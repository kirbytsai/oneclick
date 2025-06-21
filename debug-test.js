// debug-test.js - 調試測試腳本
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    console.log(`\n🔍 發送請求: ${method} ${url}`);
    if (data) {
      console.log('請求資料:', JSON.stringify(data, null, 2));
    }

    const response = await axios(config);
    console.log(`✅ 回應狀態: ${response.status}`);
    return response.data;
  } catch (error) {
    console.log(`❌ 請求失敗: ${method} ${url}`);
    if (error.response) {
      console.log(`狀態碼: ${error.response.status}`);
      console.log('錯誤回應:', JSON.stringify(error.response.data, null, 2));
      throw new Error(`${error.response.status}: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.log('網路錯誤:', error.message);
      throw error;
    }
  }
};

const debugTest = async () => {
  try {
    console.log('🔍 開始調試測試...\n');

    // 測試伺服器連接
    console.log('1️⃣ 測試伺服器連接...');
    try {
      const health = await makeRequest('GET', '/health');
      console.log('✅ 伺服器運行正常');
      console.log('伺服器資訊:', JSON.stringify(health, null, 2));
    } catch (error) {
      console.log('❌ 伺服器連接失敗:', error.message);
      return;
    }

    // 測試管理員登入
    console.log('\n2️⃣ 測試管理員登入...');
    let adminToken;
    try {
      const loginResult = await makeRequest('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'Admin123!'
      });
      adminToken = loginResult.data.accessToken;
      console.log('✅ 管理員登入成功');
      console.log('Token 長度:', adminToken.length);
    } catch (error) {
      console.log('❌ 管理員登入失敗:', error.message);
      return;
    }

    // 檢查現有用戶
    console.log('\n3️⃣ 檢查現有用戶...');
    try {
      const users = await makeRequest('GET', '/admin/users', null, adminToken);
      console.log('✅ 用戶列表獲取成功');
      
      // 修復：回應資料是 data 陣列，不是 data.users
      if (users.data && Array.isArray(users.data)) {
        console.log(`現有用戶數量: ${users.data.length}`);
        users.data.forEach(user => {
          console.log(`- ${user.email} (${user.role}) - ${user.profile.name}`);
        });
      } else {
        console.log('回應資料結構異常');
        console.log('完整回應:', JSON.stringify(users, null, 2));
      }
    } catch (error) {
      console.log('❌ 獲取用戶列表失敗:', error.message);
    }

    // 測試創建用戶
    console.log('\n4️⃣ 測試創建賣方用戶...');
    const testSeller = {
      email: 'seller-debug@example.com',
      password: 'Seller123!',
      name: '調試測試賣方', // 直接使用 name
      company: '調試測試公司', // 直接使用 company
      role: 'seller'
    };

    try {
      const createResult = await makeRequest('POST', '/admin/users', testSeller, adminToken);
      console.log('✅ 賣方用戶創建成功');
      console.log('創建結果:', JSON.stringify(createResult, null, 2));
    } catch (error) {
      console.log('❌ 賣方用戶創建失敗:', error.message);
    }

    // 測試提案選項獲取
    console.log('\n5️⃣ 測試提案選項獲取...');
    try {
      const options = await makeRequest('GET', '/proposals/options/all');
      console.log('✅ 提案選項獲取成功');
      console.log('選項內容:', JSON.stringify(options, null, 2));
    } catch (error) {
      console.log('❌ 提案選項獲取失敗:', error.message);
    }

    // 測試 Proposal Model
    console.log('\n6️⃣ 測試 Proposal Model 是否載入...');
    try {
      // 這個測試需要直接連接到資料庫
      const mongoose = require('mongoose');
      require('dotenv').config();
      
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      
      const Proposal = require('./server/models/Proposal');
      console.log('✅ Proposal Model 載入成功');
      console.log('可用行業:', Proposal.getIndustries());
      console.log('可用狀態:', Proposal.getStatusOptions());
      
    } catch (error) {
      console.log('❌ Proposal Model 載入失敗:', error.message);
      console.log('請檢查 server/models/Proposal.js 是否存在');
    }

    console.log('\n🎉 調試測試完成！');

  } catch (error) {
    console.error('\n💥 調試測試過程中發生錯誤:', error.message);
  }
};

debugTest().catch(console.error);