// server/index.js - 更新版本，整合 Phase 2 功能

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const ResponseFormatter = require('./utils/response');

// 路由導入
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const proposalRoutes = require('./routes/proposals'); // 新增

const app = express();
const PORT = process.env.PORT || 5000;

// 資料庫連接
connectDB();

// 全域速率限制
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 每15分鐘最多1000個請求
  message: ResponseFormatter.error('RATE_LIMIT', '請求頻率過高，請稍後再試', null, 429),
  standardHeaders: true,
  legacyHeaders: false,
});

// 中介軟體
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌中介軟體
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(
      `[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.originalUrl} - ` +
      `${res.statusCode} - ${duration}ms - ${req.ip}`
    );
  });
  
  next();
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json(
    ResponseFormatter.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      phase: 'Phase 2 - Proposal System'
    }, '系統運行正常')
  );
});

// API 根端點
app.get('/api', (req, res) => {
  res.json(
    ResponseFormatter.success({
      message: '提案媒合平台 API',
      version: '1.0.0',
      phase: 'Phase 2',
      endpoints: {
        auth: '/api/auth',
        admin: '/api/admin',
        proposals: '/api/proposals'
      },
      documentation: 'https://docs.example.com'
    }, '歡迎使用提案媒合平台 API')
  );
});

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proposals', proposalRoutes); // 新增 Proposal 路由

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json(
    ResponseFormatter.error('NOT_FOUND', `路由 ${req.originalUrl} 不存在`, null, 404)
  );
});

// 全域錯誤處理
app.use((error, req, res, next) => {
  console.error('全域錯誤處理:', error);

  // MongoDB 相關錯誤
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json(
      ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', messages, 400)
    );
  }

  if (error.name === 'CastError') {
    return res.status(400).json(
      ResponseFormatter.error('INVALID_ID', '無效的ID格式', null, 400)
    );
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json(
      ResponseFormatter.error('DUPLICATE_FIELD', `${field} 已存在`, null, 400)
    );
  }

  // JWT 相關錯誤
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ResponseFormatter.error('INVALID_TOKEN', '無效的認證令牌', null, 401)
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      ResponseFormatter.error('TOKEN_EXPIRED', '認證令牌已過期', null, 401)
    );
  }

  // 預設錯誤回應
  res.status(error.status || 500).json(
    ResponseFormatter.error(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'production' ? '內部伺服器錯誤' : error.message,
      process.env.NODE_ENV === 'development' ? error.stack : null,
      error.status || 500
    )
  );
});

// 伺服器啟動
const server = app.listen(PORT, () => {
  console.log('\n🚀 伺服器啟動成功!');
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 階段: Phase 2 - Proposal System`);
  console.log('\n📋 可用端點:');
  console.log(`   GET  /health              - 健康檢查`);
  console.log(`   GET  /api                 - API 資訊`);
  console.log(`   POST /api/auth/login      - 用戶登入`);
  console.log(`   GET  /api/auth/me         - 獲取用戶資料`);
  console.log(`   GET  /api/admin/users     - 管理員功能`);
  console.log(`   POST /api/proposals       - 創建提案`);
  console.log(`   GET  /api/proposals       - 獲取提案列表`);
  console.log(`   GET  /api/proposals/:id   - 獲取提案詳情`);
  console.log(`   PUT  /api/proposals/:id   - 更新提案`);
  console.log(`   (更多 Proposal API...)`);
  console.log('\n✅ 準備接收請求...');
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('\n📴 收到 SIGTERM 信號，開始優雅關閉...');
  server.close(() => {
    console.log('✅ 伺服器已關閉');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 收到 SIGINT 信號，開始優雅關閉...');
  server.close(() => {
    console.log('✅ 伺服器已關閉');
    process.exit(0);
  });
});

module.exports = app;