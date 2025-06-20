const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    console.log('🔍 測試完整 API 流程...\n');

    // 1. 登入獲取 Token
    console.log('1️⃣ 執行登入...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });

    if (loginResponse.data.success) {
      console.log('✅ 登入成功');
      console.log('👤 用戶:', loginResponse.data.data.user.email);
      console.log('🔑 Token 已獲取\n');

      const accessToken = loginResponse.data.data.accessToken;

      // 2. 測試獲取用戶資料
      console.log('2️⃣ 測試獲取用戶資料...');
      const meResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (meResponse.data.success) {
        console.log('✅ 用戶資料獲取成功');
        console.log('📧 Email:', meResponse.data.data.email);
        console.log('👨‍💼 Role:', meResponse.data.data.role, '\n');
      }

      // 3. 測試管理員功能
      console.log('3️⃣ 測試管理員功能...');
      const usersResponse = await axios.get(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (usersResponse.data.success) {
        console.log('✅ 管理員功能測試成功');
        console.log('👥 用戶數量:', usersResponse.data.data.length);
        console.log('📊 分頁資訊:', usersResponse.data.pagination, '\n');
      }

      console.log('🎉 所有 API 測試通過！');

    } else {
      console.log('❌ 登入失敗:', loginResponse.data.error.message);
    }

  } catch (error) {
    console.error('❌ API 測試失敗:', error.response?.data || error.message);
  }
};

testAPI();