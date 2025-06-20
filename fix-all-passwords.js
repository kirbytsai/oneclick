const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '.env.local');
dotenv.config({ path: envPath });

const database = require('./server/config/database');
const User = require('./server/models/User');

const fixAllPasswords = async () => {
  try {
    await database.connect();
    
    const testUsers = [
      { email: 'admin@example.com', password: 'Admin123!' },
      { email: 'buyer@example.com', password: 'Buyer123!' },
      { email: 'buyer2@example.com', password: 'Buyer123!' },
      { email: 'seller@example.com', password: 'Seller123!' },
      { email: 'seller2@example.com', password: 'Seller123!' }
    ];

    for (const userData of testUsers) {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        console.log(`🔧 修復 ${userData.email} 的密碼...`);
        user.password = userData.password;
        await user.save();
        
        // 驗證修復結果
        const isValid = await user.comparePassword(userData.password);
        console.log(`${isValid ? '✅' : '❌'} ${userData.email} 密碼${isValid ? '正確' : '錯誤'}`);
      } else {
        console.log(`❌ 找不到用戶: ${userData.email}`);
      }
    }
    
    console.log('\n🎉 所有用戶密碼修復完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修復失敗:', error);
    process.exit(1);
  }
};

fixAllPasswords();