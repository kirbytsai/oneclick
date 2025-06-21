// temp-create-users.js - 臨時用戶創建腳本
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數 - 嘗試多個可能的路徑
const envPaths = [
  '.env',
  '.env.local',
  path.join(__dirname, '.env'),
  path.join(__dirname, '.env.local')
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error && process.env.MONGODB_URI) {
      console.log(`✅ 環境變數載入成功: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // 繼續嘗試下一個路徑
  }
}

if (!envLoaded || !process.env.MONGODB_URI) {
  console.error('❌ 找不到 MONGODB_URI 環境變數');
  console.log('請確認以下檔案之一存在且包含 MONGODB_URI:');
  envPaths.forEach(p => console.log(`  - ${p}`));
  process.exit(1);
}

console.log('🔍 使用的 MongoDB URI:', process.env.MONGODB_URI.substring(0, 20) + '...');

// 連接資料庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error.message);
    process.exit(1);
  }
};

// 導入 User Model
const User = require('./server/models/User');

const createTestUsers = async () => {
  try {
    await connectDB();

    // 檢查用戶是否已存在
    const existingSeller = await User.findOne({ email: 'seller-phase2@example.com' });
    const existingBuyer = await User.findOne({ email: 'buyer-phase2@example.com' });

    if (existingSeller) {
      console.log('✅ 賣方測試用戶已存在');
    } else {
      // 創建賣方用戶
      const sellerUser = new User({
        email: 'seller-phase2@example.com',
        password: 'Seller123!',
        role: 'seller',
        profile: {
          name: 'Phase2 測試賣方',
          company: 'Phase2 測試提案公司',
          contactInfo: {
            phone: '03-1111-2222',
            address: '東京都'
          }
        },
        subscription: {
          plan: 'basic',
          status: 'active',
          monthlyProposalLimit: 10,
          usedProposals: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        preferences: {
          industries: ['科技軟體'],
          notifications: {
            email: true,
            inApp: true
          }
        },
        isActive: true
      });

      await sellerUser.save();
      console.log('✅ 賣方測試用戶創建成功:', sellerUser.email);
    }

    if (existingBuyer) {
      console.log('✅ 買方測試用戶已存在');
    } else {
      // 創建買方用戶
      const buyerUser = new User({
        email: 'buyer-phase2@example.com',
        password: 'Buyer123!',
        role: 'buyer',
        profile: {
          name: 'Phase2 測試買方',
          company: 'Phase2 測試買方公司',
          contactInfo: {
            phone: '03-3333-4444',
            address: '大阪府'
          }
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          monthlyProposalLimit: 50,
          usedProposals: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        preferences: {
          industries: ['製造業', '科技軟體'],
          notifications: {
            email: true,
            inApp: true
          }
        },
        isActive: true
      });

      await buyerUser.save();
      console.log('✅ 買方測試用戶創建成功:', buyerUser.email);
    }

    console.log('\n🎉 測試用戶準備完成！');
    console.log('\n📝 測試帳戶資訊:');
    console.log('賣方: seller-phase2@example.com / Seller123!');
    console.log('買方: buyer-phase2@example.com / Buyer123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 創建測試用戶失敗:', error.message);
    process.exit(1);
  }
};

createTestUsers();