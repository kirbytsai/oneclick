const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '.env.local');
dotenv.config({ path: envPath });

const database = require('./server/config/database');
const User = require('./server/models/User');

const checkUserRoles = async () => {
  try {
    await database.connect();
    
    const users = await User.find({}).select('email role profile.name');
    
    console.log('👥 所有用戶角色檢查:');
    console.log('===============================');
    
    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`👤 姓名: ${user.profile?.name || 'N/A'}`);
      console.log(`🎭 角色: ${user.role}`);
      console.log('-------------------------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
    process.exit(1);
  }
};

checkUserRoles();