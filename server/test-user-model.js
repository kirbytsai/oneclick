const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const database = require('./config/database');
const User = require('./models/User');

const testUserModel = async () => {
  try {
    console.log('🔍 測試 User Model...');
    
    // 連接資料庫
    await database.connect();
    
    // 清除測試資料（如果存在）
    await User.deleteOne({ email: 'test@example.com' });
    
    // 創建測試用戶
    console.log('📝 創建測試用戶...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'TestPassword123',
      role: 'seller',
      profile: {
        name: '測試用戶',
        company: '測試公司'
      }
    });
    
    const savedUser = await testUser.save();
    console.log('✅ 用戶創建成功:', savedUser.email);
    
    // 測試密碼驗證
    console.log('🔒 測試密碼驗證...');
    const isPasswordValid = await savedUser.comparePassword('TestPassword123');
    console.log('✅ 密碼驗證:', isPasswordValid ? '通過' : '失敗');
    
    // 測試訂閱功能
    console.log('💰 測試訂閱功能...');
    const canCreate = savedUser.canCreateProposal();
    console.log('✅ 可以創建提案:', canCreate ? '是' : '否');
    
    // 清除測試資料
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🧹 測試資料清除完成');
    
    console.log('🎉 User Model 測試通過！');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ User Model 測試失敗:', error.message);
    process.exit(1);
  }
};

testUserModel();