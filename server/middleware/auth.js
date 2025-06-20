const jwtService = require('../utils/jwt');
const User = require('../models/User');
const ResponseFormatter = require('../utils/response');

// 驗證 Access Token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(
        ResponseFormatter.error('NO_TOKEN', '需要認證令牌', null, 401)
      );
    }

    const decoded = jwtService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json(
        ResponseFormatter.error('USER_NOT_FOUND', '用戶不存在或已停用', null, 401)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(
      ResponseFormatter.error('INVALID_TOKEN', '無效的認證令牌', null, 401)
    );
  }
};

// 權限檢查
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        ResponseFormatter.error('NOT_AUTHENTICATED', '請先登入', null, 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ResponseFormatter.error('INSUFFICIENT_PERMISSIONS', '權限不足', null, 403)
      );
    }

    next();
  };
};

// 訂閱狀態檢查 (僅提案方)
const checkSubscription = async (req, res, next) => {
  if (req.user.role !== 'seller') {
    return next();
  }

  if (req.user.subscription.status !== 'active') {
    return res.status(403).json(
      ResponseFormatter.error('SUBSCRIPTION_INACTIVE', '訂閱已過期，請續費', null, 403)
    );
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  checkSubscription
};