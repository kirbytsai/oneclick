// server/server.js (更新版本)
const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const database = require('./config/database');
const ResponseFormatter = require('./utils/response');
const { securityHeaders, rateLimiters } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// 信任代理 (Vercel)
app.set('trust proxy', 1);

// 安全中介軟體
app.use(securityHeaders);

// CORS 設定
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// 基本中介軟體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 全域 Rate Limiting
app.use('/api/', rateLimiters.api);

// API 路由
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const proposalRoutes = require('./routes/proposals');
const submissionRoutes = require('./routes/submissions');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/submissions', submissionRoutes);

// 基本路由 - 測試用
app.get('/api/test', (req, res) => {
  res.json(ResponseFormatter.success({
    message: 'Express 伺服器運行正常！',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      authentication: true,
      proposals: true,
      submissions: true,
      nda: true,
      comments: true
    }
  }));
});

// 健康檢查端點
app.get('/api/health', async (req, res) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: database.isConnected() ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(ResponseFormatter.success(healthInfo));
});

// 404 處理
app.use('/api/*', (req, res) => {
  res.status(404).json(
    ResponseFormatter.error('NOT_FOUND', 'API 端點不存在', null, 404)
  );
});

// 全域錯誤處理
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json(
      ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', error.errors, 400)
    );
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json(
      ResponseFormatter.error('INVALID_ID', '無效的資源ID', null, 400)
    );
  }
  
  if (error.code === 11000) {
    return res.status(409).json(
      ResponseFormatter.error('DUPLICATE_ERROR', '資料重複', error.keyValue, 409)
    );
  }
  
  res.status(500).json(
    ResponseFormatter.error('SERVER_ERROR', '內部伺服器錯誤', null, 500)
  );
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 連接資料庫
    await database.connect();
    console.log('✅ MongoDB 連接成功');
    
    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 Express 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📁 環境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ 資料庫: ${database.isConnected() ? '已連接' : '未連接'}`);
      console.log(`📡 API 功能:`);
      console.log(`   - 認證系統: /api/auth`);
      console.log(`   - 管理員功能: /api/admin`);
      console.log(`   - 提案管理: /api/proposals`);
      console.log(`   - 互動系統: /api/submissions`);
      console.log(`   - 健康檢查: /api/health`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;