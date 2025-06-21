// debug-proposal.js - 調試提案創建
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
    if (data && Object.keys(data).length < 20) {
      console.log('請求資料:', JSON.stringify(data, null, 2));
    } else if (data) {
      console.log('請求資料: [大型物件，省略詳情]');
    }

    const response = await axios(config);
    console.log(`✅ 回應狀態: ${response.status}`);
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

const debugProposal = async () => {
  try {
    console.log('🔍 調試提案創建...\n');

    // 1. 管理員登入
    console.log('1️⃣ 管理員登入...');
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    const adminToken = adminLogin.data.accessToken;

    // 2. 賣方登入
    console.log('\n2️⃣ 賣方登入...');
    const sellerLogin = await makeRequest('POST', '/auth/login', {
      email: 'seller-phase2@example.com',
      password: 'Seller123!'
    });
    const sellerToken = sellerLogin.data.accessToken;

    // 3. 檢查提案路由是否存在
    console.log('\n3️⃣ 檢查提案選項是否可用...');
    try {
      const options = await makeRequest('GET', '/proposals/options/all');
      console.log('✅ 提案選項可用');
    } catch (error) {
      console.log('❌ 提案選項不可用，可能是路由問題');
      return;
    }

    // 4. 測試簡單的提案創建
    console.log('\n4️⃣ 測試簡單提案創建...');
    const simpleProposal = {
      title: '測試提案',
      industry: '科技軟體',
      company: {
        name: '測試公司',
        founded: 2020,
        employees: '11-50人',
        location: '東京都',
        description: '這是一個測試公司的描述，專注於提供創新的技術解決方案，幫助企業提升效率和競爭力。'
      },
      executiveSummary: '這是一個測試提案的執行摘要，用於測試提案創建功能是否正常運作。我們的公司致力於開發創新的科技產品，通過先進的技術為客戶提供優質的服務和解決方案，幫助企業實現數位轉型和業務增長。我們擁有專業的團隊和豐富的經驗，能夠為不同行業的客戶提供客製化的解決方案。',
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
      competitiveAdvantages: ['技術優勢', '市場經驗', '專業團隊']
    };

    try {
      const createResult = await makeRequest('POST', '/proposals', simpleProposal, sellerToken);
      console.log('✅ 簡單提案創建成功');
      console.log('提案 ID:', createResult.data._id);
    } catch (error) {
      console.log('❌ 簡單提案創建失敗');
    }

    // 5. 測試更完整的提案創建
    console.log('\n5️⃣ 測試完整提案創建...');
    const fullProposal = {
      title: 'AI驅動的物流管理平台',
      industry: '科技軟體',
      company: {
        name: 'Smart Logistics Inc.',
        founded: 2020,
        employees: '51-100人',
        location: '東京都',
        website: 'https://smartlogistics.jp',
        description: '我們是一家專注於AI物流優化的科技公司，致力於為電商和製造業提供智能化的供應鏈解決方案。'
      },
      executiveSummary: '本公司運用先進的AI技術，為企業提供端到端的物流優化解決方案。通過機器學習算法，我們的平台能夠預測需求、優化路線，並即時調整庫存策略，幫助客戶降低30%的物流成本。',
      financial: {
        annualRevenue: {
          amount: 150000000,
          currency: 'JPY',
          year: 2024
        },
        ebitda: {
          amount: 30000000,
          margin: 20
        },
        growthRate: 85,
        profitability: 'profitable'
      },
      transaction: {
        type: 'investment',
        targetValuation: {
          min: 500000000,
          max: 1000000000,
          currency: 'JPY'
        },
        timeline: '3-6個月內完成',
        dealStructure: '尋求A輪融資，資金將用於技術研發和市場擴張'
      },
      competitiveAdvantages: [
        '擁有專利的AI預測算法',
        '與主要電商平台的深度整合',
        '經驗豐富的技術團隊',
        '已獲得多個大型客戶的長期合約'
      ],
      market: {
        position: '日本AI物流解決方案領域的創新者',
        size: '預估市場規模達1000億日圓',
        competitors: '主要競爭對手包括傳統物流公司和大型科技企業'
      },
      tags: ['AI', '物流', '供應鏈', '電商', 'SaaS']
    };

    try {
      const createResult = await makeRequest('POST', '/proposals', fullProposal, sellerToken);
      console.log('✅ 完整提案創建成功');
      console.log('提案 ID:', createResult.data._id);
    } catch (error) {
      console.log('❌ 完整提案創建失敗');
    }

    // 6. 檢查路由是否正確載入
    console.log('\n6️⃣ 檢查伺服器路由...');
    try {
      const healthCheck = await makeRequest('GET', '/health');
      console.log('✅ 伺服器健康檢查通過');
      
      // 檢查是否有提案相關的端點資訊
      if (healthCheck.data && healthCheck.data.endpoints) {
        console.log('可用端點:', healthCheck.data.endpoints);
      }
    } catch (error) {
      console.log('❌ 伺服器健康檢查失敗');
    }

  } catch (error) {
    console.error('\n💥 調試過程失敗:', error.message);
  }
};

debugProposal();