const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const database = require('./config/database');
const User = require('./models/User');
const jwtService = require('./utils/jwt');
const { authenticateToken, authorize } = require('./middleware/auth');

const testMiddleware = async () => {
  try {
    console.log('🔍 測試中介軟體...');
    
    // 連接資料庫
    await database.connect();
    
    // 創建測試用戶
    console.log('📝 創建測試用戶...');
    await User.deleteOne({ email: 'middleware-test@example.com' });
    
    const testUser = new User({
      email: 'middleware-test@example.com',
      password: 'TestPassword123',
      role: 'admin',
      profile: {
        name: '中介軟體測試用戶',
        company: '測試公司'
      }
    });
    
    const savedUser = await testUser.save();
    console.log('✅ 測試用戶創建成功');
    
    // 生成測試 Token
    console.log('🔑 生成測試 Token...');
    const { accessToken } = jwtService.generateTokenPair({
      userId: savedUser._id,
      email: savedUser.email,
      role: savedUser.role
    });
    console.log('✅ Token 生成成功');
    
    // 模擬 Express req, res 物件
    const mockReq = {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    };
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };
    
    // 測試認證中介軟體
    console.log('🛡️ 測試認證中介軟體...');
    await new Promise((resolve, reject) => {
      authenticateToken(mockReq, mockRes, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ 認證中介軟體測試通過');
    console.log('👤 認證用戶:', mockReq.user.email);
    
    // 測試權限中介軟體
    console.log('🔐 測試權限中介軟體...');
    const adminAuth = authorize('admin');
    
    await new Promise((resolve, reject) => {
      adminAuth(mockReq, mockRes, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ 權限中介軟體測試通過');
    
    // 清除測試資料
    await User.deleteOne({ email: 'middleware-test@example.com' });
    console.log('🧹 測試資料清除完成');
    
    console.log('🎉 中介軟體測試全部通過！');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 中介軟體測試失敗:', error.message);
    process.exit(1);
  }
};

testMiddleware();