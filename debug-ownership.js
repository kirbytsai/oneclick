// debug-ownership.js - 調試擁有者權限檢查
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const debugOwnership = async () => {
  try {
    console.log('🔍 調試擁有者權限檢查...\n');

    // 1. 賣方登入並獲取用戶資訊
    console.log('1️⃣ 賣方登入並獲取用戶資訊...');
    const sellerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'seller-phase2@example.com',
      password: 'Seller123!'
    });
    const sellerToken = sellerLogin.data.data.accessToken;
    
    // 獲取當前用戶資訊
    const userInfo = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    
    console.log('✅ 賣方登入成功');
    console.log('🆔 用戶 ID:', userInfo.data.data._id);
    console.log('📧 用戶郵箱:', userInfo.data.data.email);
    console.log('👤 用戶角色:', userInfo.data.data.role);

    // 2. 創建測試提案
    console.log('\n2️⃣ 創建測試提案...');
    const testProposal = {
      title: '調試權限提案',
      industry: '科技軟體',
      company: {
        name: '調試公司',
        founded: 2020,
        employees: '11-50人',
        location: '東京都',
        description: '調試權限用的公司描述'
      },
      executiveSummary: '調試權限用的執行摘要內容',
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
      competitiveAdvantages: ['調試優勢']
    };

    const createResult = await axios.post(`${BASE_URL}/proposals`, testProposal, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    
    const proposalId = createResult.data.data._id;
    const proposalCreator = createResult.data.data.creator;
    
    console.log('✅ 測試提案創建成功');
    console.log('🆔 提案 ID:', proposalId);
    console.log('👤 提案創建者 ID:', proposalCreator);
    console.log('🔍 ID 比較:');
    console.log('   用戶 ID:', userInfo.data.data._id);
    console.log('   創建者 ID:', proposalCreator);
    console.log('   是否相等:', userInfo.data.data._id === proposalCreator);

    // 3. 直接從資料庫查詢提案詳情（繞過權限檢查）
    console.log('\n3️⃣ 獲取提案列表（檢查創建者欄位）...');
    try {
      const proposalsList = await axios.get(`${BASE_URL}/proposals`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      
      const myProposal = proposalsList.data.data.proposals.find(p => p._id === proposalId);
      if (myProposal) {
        console.log('✅ 在提案列表中找到提案');
        console.log('📋 提案詳情:');
        console.log('   標題:', myProposal.title);
        console.log('   狀態:', myProposal.status);
        console.log('   創建者:', myProposal.creator);
        
        if (myProposal.creator) {
          console.log('🔍 創建者詳情:');
          console.log('   創建者 ID:', myProposal.creator._id || myProposal.creator);
          console.log('   創建者郵箱:', myProposal.creator.email);
        }
      } else {
        console.log('❌ 在提案列表中未找到提案');
      }
    } catch (error) {
      console.log('❌ 獲取提案列表失敗:', error.response?.data?.error?.message);
    }

    // 4. 嘗試查看提案詳情
    console.log('\n4️⃣ 嘗試查看提案詳情...');
    try {
      const viewResult = await axios.get(`${BASE_URL}/proposals/${proposalId}`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      console.log('✅ 成功查看提案詳情');
      console.log('   提案標題:', viewResult.data.data.title);
    } catch (error) {
      console.log('❌ 查看提案詳情失敗');
      console.log('   狀態碼:', error.response?.status);
      console.log('   錯誤訊息:', error.response?.data?.error?.message);
      
      // 檢查伺服器日誌中的詳細錯誤
      console.log('\n🔍 請檢查伺服器終端的詳細錯誤日誌');
    }

    // 5. 測試更新提案（這個在原始測試中是成功的）
    console.log('\n5️⃣ 測試更新提案（對比）...');
    try {
      const updateResult = await axios.put(`${BASE_URL}/proposals/${proposalId}`, {
        title: '調試權限提案 (已更新)'
      }, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      console.log('✅ 提案更新成功');
      console.log('   新標題:', updateResult.data.data.title);
    } catch (error) {
      console.log('❌ 提案更新失敗');
      console.log('   狀態碼:', error.response?.status);
      console.log('   錯誤訊息:', error.response?.data?.error?.message);
    }

    // 6. 清理
    console.log('\n6️⃣ 清理測試提案...');
    try {
      await axios.delete(`${BASE_URL}/proposals/${proposalId}`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      console.log('✅ 測試提案已清理');
    } catch (error) {
      console.log('⚠️ 清理失敗，提案 ID:', proposalId);
    }

  } catch (error) {
    console.error('❌ 調試失敗:', error.message);
    if (error.response) {
      console.log('回應狀態:', error.response.status);
      console.log('回應資料:', error.response.data);
    }
  }
};

debugOwnership();