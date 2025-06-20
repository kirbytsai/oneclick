const path = require('path');
const dotenv = require('dotenv');

// 明確指定 .env.local 路徑（相對於專案根目錄）
const envPath = path.join(__dirname, '..', '.env.local');
console.log('📁 載入環境變數檔案:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('❌ 環境變數載入失敗:', result.error);
  process.exit(1);
}

const database = require('./config/database');

const testConnection = async () => {
  try {
    console.log('🔍 測試 MongoDB 連接...');
    console.log('📁 環境變數檢查:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || '未設定');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '已設定' : '未設定');
    console.log('- 連接字串前40字符:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 40) + '...' : '無');
    
    await database.connect();
    console.log('🎉 資料庫連接測試成功！');
    
    if (database.isConnected()) {
      console.log('✅ 連接狀態：已連接');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 資料庫連接測試失敗:', error.message);
    console.log('\n💡 可能的解決方案:');
    console.log('1. 檢查 MongoDB Atlas 帳號密碼是否正確');
    console.log('2. 確認網路存取設定（IP 白名單）');
    console.log('3. 檢查 cluster 名稱是否正確');
    process.exit(1);
  }
};

testConnection();