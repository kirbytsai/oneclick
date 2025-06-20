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

// 基本路由 - 測試用
app.get('/api/test', (req, res) => {
  res.json(ResponseFormatter.success({
    message: 'Express 伺服器運行正常！',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }));
});
// API 路由
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


// 健康檢查端點
app.get('/api/health', async (req, res) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: database.isConnected() ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(ResponseFormatter.success(healthInfo, '系統運行正常'));
});

// 404 處理
app.use('/api/*', (req, res) => {
  res.status(404).json(
    ResponseFormatter.error('NOT_FOUND', '找不到請求的資源', null, 404)
  );
});

// 全域錯誤處理
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  // MongoDB 驗證錯誤
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json(
      ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', errors, 400)
    );
  }

  // MongoDB 重複鍵錯誤
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json(
      ResponseFormatter.error('DUPLICATE_ERROR', `${field} 已存在`, null, 400)
    );
  }

  // JWT 錯誤
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ResponseFormatter.error('INVALID_TOKEN', '無效的認證令牌', null, 401)
    );
  }

  // 預設錯誤
  res.status(500).json(
    ResponseFormatter.error('SERVER_ERROR', '伺服器內部錯誤', null, 500)
  );
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 連接資料庫
    await database.connect();

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 Express 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📁 環境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ 資料庫: ${database.isConnected() ? '已連接' : '未連接'}`);
    });

  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
};

// 啟動應用程式
if (require.main === module) {
  startServer();
}

module.exports = app;