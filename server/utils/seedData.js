// server/utils/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    // 檢查是否已有用戶
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('🔄 Users already exist, clearing existing data...');
      await User.deleteMany({});
    }

    // 創建測試用戶
    const testUsers = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        profile: {
          name: '系統管理員',
          company: '提案媒合平台',
          contactInfo: {
            phone: '03-1234-5678',
            address: '東京都渋谷区'
          }
        },
        preferences: {
          notifications: {
            email: true,
            inApp: true
          }
        }
      },
      {
        email: 'buyer@example.com',
        password: 'Buyer123!',
        role: 'buyer',
        profile: {
          name: '田中太郎',
          company: '田中商事株式會社',
          contactInfo: {
            phone: '03-2345-6789',
            address: '東京都新宿区'
          }
        },
        preferences: {
          notifications: {
            email: true,
            inApp: false
          },
          industries: ['IT', 'Marketing']
        },
        subscription: {
          plan: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
          monthlyProposalLimit: 50,
          usedProposals: 5
        }
      },
      {
        email: 'seller@example.com',
        password: 'Seller123!',
        role: 'seller',
        profile: {
          name: '佐藤花子',
          company: '佐藤提案工作室',
          contactInfo: {
            phone: '03-3456-7890',
            address: '東京都港区'
          }
        },
        preferences: {
          notifications: {
            email: true,
            inApp: true
          },
          industries: ['Consulting', 'Design']
        },
        subscription: {
          plan: 'basic',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
          monthlyProposalLimit: 10,
          usedProposals: 2
        }
      },
      {
        email: 'buyer2@example.com',
        password: 'Buyer123!',
        role: 'buyer',
        profile: {
          name: '山田次郎',
          company: '山田企業有限公司',
          contactInfo: {
            phone: '03-4567-8901',
            address: '大阪府大阪市'
          }
        },
        preferences: {
          notifications: {
            email: false,
            inApp: true
          },
          industries: ['Manufacturing', 'Technology']
        },
        subscription: {
          plan: 'basic',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          monthlyProposalLimit: 10,
          usedProposals: 8
        }
      },
      {
        email: 'seller2@example.com',
        password: 'Seller123!',
        role: 'seller',
        profile: {
          name: '鈴木一郎',
          company: '鈴木策略顧問',
          contactInfo: {
            phone: '03-5678-9012',
            address: '神奈川県橫濱市'
          }
        },
        preferences: {
          notifications: {
            email: true,
            inApp: true
          },
          industries: ['Strategy', 'Finance']
        },
        subscription: {
          plan: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          monthlyProposalLimit: 50,
          usedProposals: 15
        }
      }
    ];

    // 加密密碼並創建用戶
    const createdUsers = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        isActive: true,
        emailVerified: true,
        lastLogin: new Date()
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('👤 Admin: admin@example.com / Admin123!');
    console.log('🛒 Buyer 1: buyer@example.com / Buyer123!');
    console.log('🛒 Buyer 2: buyer2@example.com / Buyer123!');
    console.log('📝 Seller 1: seller@example.com / Seller123!');
    console.log('📝 Seller 2: seller2@example.com / Seller123!');

    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// 如果直接執行這個腳本
if (require.main === module) {
  const path = require('path');
  const dotenv = require('dotenv');
  
  // 載入環境變數
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  console.log('📁 載入環境變數檔案:', envPath);
  
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log('❌ 環境變數載入失敗:', result.error);
    process.exit(1);
  }
  
  const database = require('../config/database');
  
  const run = async () => {
    try {
      await database.connect();
      await seedUsers();
      console.log('\n🔄 關閉資料庫連接...');
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed data:', error);
      process.exit(1);
    }
  };
  
  run();
}

module.exports = seedUsers;