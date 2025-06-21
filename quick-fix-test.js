// quick-fix-test.js - 測試提案詳情查看修復
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const quickTest = async () => {
  try {
    console.log('🔧 測試提案詳情查看修復...\n');

    // 1. 賣方登入
    console.log('1️⃣ 賣方登入...');
    const sellerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'seller-phase2@example.com',
      password: 'Seller123!'
    });
    const sellerToken = sellerLogin.data.data.accessToken;
    console.log('✅ 賣方登入成功');

    // 2. 創建測試提案
    console.log('\n2️⃣ 創建測試提案...');
    const testProposal = {
      title: '權限測試提案',
      industry: '科技軟體',
      company: {
        name: '測試公司',
        founded: 2020,
        employees: '11-50人',
        location: '東京都',
        description: '這是一個權限測試公司的描述'
      },
      executiveSummary: '這是一個用於測試權限的提案執行摘要',
      financial: {
        annualRevenue: {
          amount: 100000000,
          currency: 'JPY',
          year: 2024
        },
        growthRate: 50,
        profitability: 'profitable'
      },
      transaction: {
        type: 'investment',
        targetValuation: {
          min: 500000000,
          max: 1000000000,
          currency: 'JPY'
        },
        timeline: '3-6個月'
      },
      competitiveAdvantages: ['技術優勢']
    };

    const createResult = await axios.post(`${BASE_URL}/proposals`, testProposal, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const proposalId = createResult.data.data._id;
    console.log(`✅ 測試提案創建成功: ${proposalId}`);

    // 3. 測試賣方查看自己的提案
    console.log('\n3️⃣ 測試賣方查看自己的提案...');
    try {
      const viewResult = await axios.get(`${BASE_URL}/proposals/${proposalId}`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      console.log('✅ 賣方可以查看自己的提案');
      console.log(`   提案標題: ${viewResult.data.data.title}`);
      console.log(`   狀態: ${viewResult.data.data.status}`);
    } catch (error) {
      console.log('❌ 賣方查看自己的提案失敗');
      console.log(`   錯誤: ${error.response?.status} ${error.response?.data?.error?.message}`);
    }

    // 4. 買方登入
    console.log('\n4️⃣ 買方登入...');
    const buyerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'buyer-phase2@example.com',
      password: 'Buyer123!'
    });
    const buyerToken = buyerLogin.data.data.accessToken;
    console.log('✅ 買方登入成功');

    // 5. 測試買方查看草稿提案（應該失敗）
    console.log('\n5️⃣ 測試買方查看草稿提案（應該被拒絕）...');
    try {
      await axios.get(`${BASE_URL}/proposals/${proposalId}`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` }
      });
      console.log('❌ 買方不應該能查看草稿提案');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 權限控制正常 - 買方無法查看草稿提案');
      } else {
        console.log(`❌ 意外錯誤: ${error.response?.status} ${error.response?.data?.error?.message}`);
      }
    }

    // 6. 清理測試提案
    console.log('\n6️⃣ 清理測試提案...');
    try {
      await axios.delete(`${BASE_URL}/proposals/${proposalId}`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      console.log('✅ 測試提案已清理');
    } catch (error) {
      console.log('⚠️ 清理失敗，可能需要手動清理');
    }

    console.log('\n🎉 權限測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
};

quickTest();