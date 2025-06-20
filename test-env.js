const path = require('path');
const dotenv = require('dotenv');

// 明確指定 .env.local 路徑
const envPath = path.join(__dirname, '.env.local');
console.log('📁 載入環境變數檔案:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('❌ 環境變數載入失敗:', result.error);
} else {
  console.log('✅ 環境變數載入成功');
}

console.log('\n🔍 環境變數測試:');
console.log('- NODE_ENV:', process.env.NODE_ENV || '未設定');
console.log('- PORT:', process.env.PORT || '未設定');
console.log('- MONGODB_URI 前30字符:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : '未設定');
console.log('- JWT_SECRET 是否設定:', process.env.JWT_SECRET ? '已設定' : '未設定');