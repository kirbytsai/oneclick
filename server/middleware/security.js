const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
// Rate Limiting 設定
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 不同等級的 Rate Limiting
const rateLimiters = {
  // 登入限制：開發環境寬鬆，生產環境嚴格
  login: createRateLimiter(
    15 * 60 * 1000, // 15分鐘
    process.env.NODE_ENV === 'development' ? 50 : 5, // 開發50次，生產5次
    '登入嘗試次數過多，請稍後再試'
  ),
  
  // API限制：開發環境寬鬆
  api: createRateLimiter(
    60 * 1000, // 1分鐘
    process.env.NODE_ENV === 'development' ? 1000 : 100, // 開發1000次，生產100次
    'API請求頻率過高'
  ),
  
  // 一般請求：開發環境寬鬆
  general: createRateLimiter(
    60 * 1000, // 1分鐘
    process.env.NODE_ENV === 'development' ? 2000 : 200, // 開發2000次，生產200次
    '請求頻率過高'
  )
};
// 安全標頭設定
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// 輸入驗證中介軟體
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '輸入資料有誤',
        details: errors.array()
      }
    });
  }
  next();
};

// 常用驗證規則
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('請輸入有效的電子郵件地址'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密碼必須至少8位，包含大小寫字母和數字'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名長度必須在2-50字符之間'),
  
  company: body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('公司名稱長度必須在2-100字符之間')
};

module.exports = {
  rateLimiters,
  securityHeaders,
  handleValidationErrors,
  validationRules
};