const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proposal-matching';
      
      console.log('🔍 嘗試連接 MongoDB...');
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      this.connection = await mongoose.connect(mongoUri, options);
      
      console.log(`✅ MongoDB 連接成功: ${this.connection.connection.host}`);
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB 連接失敗:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('📪 MongoDB 連接已關閉');
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();