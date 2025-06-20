const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const jwtService = require('../utils/jwt');
const ResponseFormatter = require('../utils/response');
const { rateLimiters, handleValidationErrors, validationRules } = require('../middleware/security');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 登入
router.post('/login', 
  rateLimiters.login,
  [
    validationRules.email,
    body('password').notEmpty().withMessage('密碼不能為空')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // 查找用戶
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(401).json(
          ResponseFormatter.error('INVALID_CREDENTIALS', '電子郵件或密碼錯誤', null, 401)
        );
      }

      // 驗證密碼
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json(
          ResponseFormatter.error('INVALID_CREDENTIALS', '電子郵件或密碼錯誤', null, 401)
        );
      }

      // 生成 Token
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const { accessToken, refreshToken } = jwtService.generateTokenPair(tokenPayload);

      // 儲存 Refresh Token
      user.refreshTokens.push(refreshToken);
      user.lastLoginAt = new Date();
      await user.save();

      // 設定 Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
      });

      // 返回用戶資料（不包含敏感資訊）
      const userData = {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        subscription: user.role === 'seller' ? user.subscription : undefined,
        preferences: user.preferences
      };

      res.json(ResponseFormatter.success({
        user: userData,
        accessToken
      }, '登入成功'));

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '伺服器錯誤', null, 500)
      );
    }
  }
);

// Refresh Token
router.post('/refresh',
  rateLimiters.api,
  async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json(
          ResponseFormatter.error('NO_REFRESH_TOKEN', '請重新登入', null, 401)
        );
      }

      // 驗證 Refresh Token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json(
          ResponseFormatter.error('INVALID_REFRESH_TOKEN', '請重新登入', null, 401)
        );
      }

      // 生成新的 Access Token
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = jwtService.generateAccessToken(tokenPayload);

      res.json(ResponseFormatter.success({
        accessToken: newAccessToken
      }, 'Token 更新成功'));

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json(
        ResponseFormatter.error('INVALID_REFRESH_TOKEN', '請重新登入', null, 401)
      );
    }
  }
);

// 登出
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      
      if (refreshToken) {
        // 從資料庫移除 Refresh Token
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { refreshTokens: refreshToken }
        });
      }

      // 清除 Cookie
      res.clearCookie('refreshToken');

      res.json(ResponseFormatter.success(null, '登出成功'));

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '伺服器錯誤', null, 500)
      );
    }
  }
);

// 獲取當前用戶資料
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-password -refreshTokens')
        .lean();

      res.json(ResponseFormatter.success(user, '用戶資料擷取成功'));

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '伺服器錯誤', null, 500)
      );
    }
  }
);

module.exports = router;