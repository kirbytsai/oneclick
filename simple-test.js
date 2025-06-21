// simple-test.js - 簡單的用戶創建測試
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
    console.log('回應資料:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`❌ 請求失敗: ${method} ${url}`);
    if (error.response) {
      console.log(`狀態碼: ${error.response.status}`);
      console.log('錯誤回應:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('網路錯誤:', error.message);
    }
    throw error;
  }
};

const simpleTest = async () => {
  try {
    console.log('🔧 簡單用戶創建測試開始...\n');

    // 1. 管理員登入
    console.log('1️⃣ 管理員登入...');
    const loginResult = await makeRequest('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    const adminToken = loginResult.data.accessToken;

    // 2. 測試不同的用戶創建格式
    console.log('\n2️⃣ 測試用戶創建格式1 (簡單格式)...');
    try {
      await makeRequest('POST', '/admin/users', {
        email: 'test1@example.com',
        name: '測試用戶1',
        company: '測試公司1',
        role: 'seller'
      }, adminToken);
    } catch (error) {
      console.log('格式1失敗');
    }

    console.log('\n3️⃣ 測試用戶創建格式2 (包含密碼)...');
    try {
      await makeRequest('POST', '/admin/users', {
        email: 'test2@example.com',
        password: 'Test123!',
        name: '測試用戶2',
        company: '測試公司2',
        role: 'seller'
      }, adminToken);
    } catch (error) {
      console.log('格式2失敗');
    }

    console.log('\n4️⃣ 測試用戶創建格式3 (嵌套 profile)...');
    try {
      await makeRequest('POST', '/admin/users', {
        email: 'test3@example.com',
        password: 'Test123!',
        role: 'seller',
        profile: {
          name: '測試用戶3',
          company: '測試公司3'
        }
      }, adminToken);
    } catch (error) {
      console.log('格式3失敗');
    }

    console.log('\n5️⃣ 查看現有用戶結構...');
    try {
      const users = await makeRequest('GET', '/admin/users?limit=1', null, adminToken);
      if (users.data && users.data.length > 0) {
        console.log('現有用戶結構範例:');
        console.log(JSON.stringify(users.data[0], null, 2));
      }
    } catch (error) {
      console.log('獲取用戶失敗');
    }

    console.log('\n6️⃣ 檢查伺服器錯誤日誌...');
    console.log('請檢查伺服器終端的錯誤輸出');

  } catch (error) {
    console.error('\n💥 測試失敗:', error.message);
  }
};

simpleTest().catch(console.error);