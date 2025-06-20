const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const ResponseFormatter = require('../utils/response');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors, validationRules } = require('../middleware/security');

const router = express.Router();

// 所有管理員路由都需要認證和管理員權限
router.use(authenticateToken);
router.use(authorize('admin'));

// 創建用戶（買方或提案方）
router.post('/users',
  [
    validationRules.email,
    validationRules.name,
    validationRules.company,
    body('role').isIn(['buyer', 'seller']).withMessage('角色必須是 buyer 或 seller'),
    body('subscription.plan').optional().isIn(['basic', 'premium']),
    body('subscription.monthlyProposalLimit').optional().isInt({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, role, profile, subscription } = req.body;

      // 檢查電子郵件是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(
          ResponseFormatter.error('EMAIL_EXISTS', '電子郵件已被使用')
        );
      }

      // 生成臨時密碼
      const tempPassword = Math.random().toString(36).slice(-12);

      const userData = {
        email,
        password: tempPassword,
        role,
        profile,
        isActive: true
      };

      // 如果是提案方，設定訂閱資訊
      if (role === 'seller') {
        userData.subscription = {
          plan: subscription?.plan || 'basic',
          status: 'active',
          monthlyProposalLimit: subscription?.monthlyProposalLimit || 5,
          usedProposals: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天後過期
        };
      }

      const user = new User(userData);
      await user.save();

      // 返回用戶資料（包含臨時密碼，實際應用中應透過安全方式傳送）
      const responseData = {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription
        },
        tempPassword // 實際應用中應該透過 email 或其他安全方式發送
      };

      res.status(201).json(ResponseFormatter.success(responseData, '用戶創建成功', 201));

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '伺服器錯誤', null, 500)
      );
    }
  }
);

// 獲取用戶列表
router.get('/users',
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        search
      } = req.query;

      const query = {};
      
      if (role) query.role = role;
      if (status) query.isActive = status === 'active';
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { 'profile.name': { $regex: search, $options: 'i' } },
          { 'profile.company': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await User.countDocuments(query);

      const users = await User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      };

      res.json(ResponseFormatter.paginated(users, pagination));

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '伺服器錯誤', null, 500)
      );
    }
  }
);

module.exports = router;