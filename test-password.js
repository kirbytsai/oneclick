const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '.env.local');
dotenv.config({ path: envPath });

const database = require('./server/config/database');
const User = require('./server/models/User');

const testPassword = async () => {
  try {
    await database.connect();
    
    // 查找管理員用戶
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ 管理員用戶不存在');
      return;
    }
    
    console.log('✅ 管理員用戶存在');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password Hash:', admin.password.substring(0, 20) + '...');
    
    // 測試密碼比對
    const isValid = await admin.comparePassword('Admin123!');
    console.log('🧪 密碼比對結果:', isValid ? '✅ 正確' : '❌ 錯誤');
    
    if (!isValid) {
      console.log('🔧 嘗試手動設置密碼...');
      admin.password = 'Admin123!';
      await admin.save();
      console.log('✅ 密碼重新設置完成');
      
      // 再次測試
      const newAdmin = await User.findOne({ email: 'admin@example.com' });
      const isNewValid = await newAdmin.comparePassword('Admin123!');
      console.log('🧪 新密碼比對結果:', isNewValid ? '✅ 正確' : '❌ 錯誤');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    process.exit(1);
  }
};

testPassword();