const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '..', '.env.local');
dotenv.config({ path: envPath });

const database = require('../config/database');
const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    console.log('🌱 初始化管理員帳戶...');
    
    await database.connect();

    // 檢查是否已有管理員
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ 管理員已存在:', existingAdmin.email);
      return;
    }

    // 創建預設管理員
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'Admin123!', // 這會被自動加密
      role: 'admin',
      profile: {
        name: '系統管理員',
        company: '提案媒合平台'
      },
      isActive: true
    });

    await adminUser.save();
    console.log('✅ 預設管理員創建成功');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: Admin123!');

  } catch (error) {
    console.error('❌ 創建管理員失敗:', error);
  } finally {
    await database.disconnect();
  }
};

// 如果直接執行此檔案
if (require.main === module) {
  seedAdminUser();
}

module.exports = { seedAdminUser };