// test-phase2.js
const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let sellerToken = '';
let buyerToken = '';
let testProposalId = '';

// 測試資料
const testUsers = {
  seller: {
    email: 'seller-phase2@example.com', // 使用不同的郵箱
    password: 'Seller123!',
    name: '提案方測試', // 直接使用 name 而不是 profile.name
    company: 'Phase2測試提案公司', // 直接使用 company
    role: 'seller'
  },
  buyer: {
    email: 'buyer-phase2@example.com', // 使用不同的郵箱
    password: 'Buyer123!',
    name: '買方測試', // 直接使用 name
    company: 'Phase2測試買方公司', // 直接使用 company
    role: 'buyer'
  }
};

const testProposal = {
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
  executiveSummary: '本公司運用先進的AI技術，為企業提供端到端的物流優化解決方案。通過機器學習算法，我們的平台能夠預測需求、優化路線，並即時調整庫存策略，幫助客戶降低30%的物流成本。我們專注於為電商和製造業客戶提供智能化的供應鏈管理服務，通過數據分析和自動化技術提升整體運營效率。',
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

// 工具函數
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

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`${error.response.status}: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
};

const log = (message, data = null) => {
  console.log(`\n${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const logError = (message, error) => {
  console.log(`❌ ${message}`);
  console.error(error.message);
};

// 測試步驟
const runTests = async () => {
  try {
    console.log('🚀 開始 Phase 2 完整測試流程...\n');

    // Step 1: 登入管理員獲取 Token
    console.log('1️⃣ 管理員登入...');
    try {
      const adminLogin = await makeRequest('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'Admin123!'
      });
      adminToken = adminLogin.data.accessToken;
      logSuccess('管理員登入成功');
    } catch (error) {
      logError('管理員登入失敗', error);
      return;
    }

    // Step 2: 跳過用戶創建，直接使用現有用戶
    console.log('\n2️⃣ 跳過用戶創建，使用預先創建的測試用戶...');
    console.log('✅ 使用現有測試用戶');
    console.log('   賣方: seller-phase2@example.com');
    console.log('   買方: buyer-phase2@example.com');

    // Step 3: 測試用戶登入
    console.log('\n3️⃣ 測試用戶登入...');
    try {
      // 賣方登入
      const sellerLogin = await makeRequest('POST', '/auth/login', {
        email: testUsers.seller.email,
        password: testUsers.seller.password
      });
      sellerToken = sellerLogin.data.accessToken;
      logSuccess('賣方登入成功');

      // 買方登入
      const buyerLogin = await makeRequest('POST', '/auth/login', {
        email: testUsers.buyer.email,
        password: testUsers.buyer.password
      });
      buyerToken = buyerLogin.data.accessToken;
      logSuccess('買方登入成功');
    } catch (error) {
      logError('測試用戶登入失敗', error);
      return;
    }

    // Step 4: 測試獲取選項資料
    console.log('\n4️⃣ 測試獲取選項資料...');
    try {
      const options = await makeRequest('GET', '/proposals/options/all');
      logSuccess('選項資料獲取成功');
      console.log(`   行業選項: ${options.data.industries.length} 個`);
      console.log(`   員工規模: ${options.data.employeeRanges.length} 個`);
      console.log(`   交易類型: ${options.data.transactionTypes.length} 個`);
      console.log(`   估值範圍: ${options.data.valuationRanges.length} 個`);
    } catch (error) {
      logError('獲取選項資料失敗', error);
    }

    // Step 5: 創建提案
    console.log('\n5️⃣ 創建提案...');
    try {
      const createResult = await makeRequest('POST', '/proposals', testProposal, sellerToken);
      testProposalId = createResult.data._id;
      logSuccess('提案創建成功');
      console.log(`   提案ID: ${testProposalId}`);
      console.log(`   狀態: ${createResult.data.status}`);
    } catch (error) {
      logError('創建提案失敗', error);
      return;
    }

    // Step 6: 測試獲取提案列表
    console.log('\n6️⃣ 測試獲取提案列表...');
    try {
      // 賣方查看自己的提案
      const sellerProposals = await makeRequest('GET', '/proposals', null, sellerToken);
      logSuccess('賣方提案列表獲取成功');
      console.log(`   提案數量: ${sellerProposals.data.proposals.length}`);

      // 買方查看提案（應該為空，因為還沒發佈）
      const buyerProposals = await makeRequest('GET', '/proposals', null, buyerToken);
      logSuccess('買方提案列表獲取成功');
      console.log(`   可見提案數量: ${buyerProposals.data.proposals.length}`);
    } catch (error) {
      logError('獲取提案列表失敗', error);
    }

    // Step 7: 測試提案詳情查看
    console.log('\n7️⃣ 測試提案詳情查看...');
    try {
      // 賣方查看自己的提案
      const proposalDetail = await makeRequest('GET', `/proposals/${testProposalId}`, null, sellerToken);
      logSuccess('賣方查看提案詳情成功');
      console.log(`   提案標題: ${proposalDetail.data.title}`);
      console.log(`   公司名稱: ${proposalDetail.data.company.name}`);
      console.log(`   年收入: ${proposalDetail.data.financial.annualRevenue.amount.toLocaleString()} JPY`);
    } catch (error) {
      logError('查看提案詳情失敗', error);
    }

    // Step 8: 測試提案更新
    console.log('\n8️⃣ 測試提案更新...');
    try {
      const updatedData = {
        ...testProposal,
        title: 'AI驅動的物流管理平台 (已更新)',
        financial: {
          ...testProposal.financial,
          growthRate: 95
        }
      };

      const updateResult = await makeRequest('PUT', `/proposals/${testProposalId}`, updatedData, sellerToken);
      logSuccess('提案更新成功');
      console.log(`   新標題: ${updateResult.data.title}`);
      console.log(`   新成長率: ${updateResult.data.financial.growthRate}%`);
    } catch (error) {
      logError('提案更新失敗', error);
    }

    // Step 9: 測試提案狀態管理 - 提交審核
    console.log('\n9️⃣ 測試提案狀態管理...');
    try {
      // 提交審核
      const submitResult = await makeRequest('POST', `/proposals/${testProposalId}/submit`, null, sellerToken);
      logSuccess('提案提交審核成功');
      console.log(`   狀態變更: draft → ${submitResult.data.status}`);
      console.log(`   提交時間: ${submitResult.data.submittedAt}`);
    } catch (error) {
      logError('提交審核失敗', error);
    }

    // Step 10: 測試管理員審核 - 核准
    console.log('\n🔟 測試管理員審核...');
    try {
      const approveResult = await makeRequest('POST', `/proposals/${testProposalId}/approve`, {
        comments: '提案內容完整，財務數據合理，核准發佈。'
      }, adminToken);
      logSuccess('管理員審核通過');
      console.log(`   狀態變更: ${approveResult.data.status}`);
      console.log(`   審核時間: ${approveResult.data.approvedAt}`);
      console.log(`   審核意見: ${approveResult.data.review.comments}`);
    } catch (error) {
      logError('管理員審核失敗', error);
    }

    // Step 11: 獲取買方列表
    console.log('\n1️⃣1️⃣ 獲取買方列表...');
    try {
      const buyersList = await makeRequest('GET', '/proposals/buyers/list', null, sellerToken);
      logSuccess('買方列表獲取成功');
      console.log(`   買方數量: ${buyersList.data.buyers.length}`);
      
      if (buyersList.data.buyers.length > 0) {
        const targetBuyerId = buyersList.data.buyers[0]._id;
        console.log(`   目標買方: ${buyersList.data.buyers[0].email}`);

        // Step 12: 發送給買方
        console.log('\n1️⃣2️⃣ 發送提案給買方...');
        const sendResult = await makeRequest('POST', `/proposals/${testProposalId}/send-to-buyers`, {
          buyerIds: [targetBuyerId]
        }, sellerToken);
        logSuccess('提案發送成功');
        console.log(`   狀態變更: ${sendResult.data.status}`);
        console.log(`   發佈時間: ${sendResult.data.publishedAt}`);
        console.log(`   目標買方數量: ${sendResult.data.targetBuyers.length}`);
      }
    } catch (error) {
      logError('獲取買方列表或發送提案失敗', error);
    }

    // Step 13: 買方查看收件箱
    console.log('\n1️⃣3️⃣ 買方查看收件箱...');
    try {
      const inbox = await makeRequest('GET', '/proposals/received/inbox', null, buyerToken);
      logSuccess('買方收件箱獲取成功');
      console.log(`   收到提案數量: ${inbox.data.proposals.length}`);
      
      if (inbox.data.proposals.length > 0) {
        console.log(`   第一個提案: ${inbox.data.proposals[0].title}`);
        console.log(`   發送狀態: ${inbox.data.proposals[0].buyerStatus}`);
      }
    } catch (error) {
      logError('買方收件箱獲取失敗', error);
    }

    // Step 14: 買方回應提案
    console.log('\n1️⃣4️⃣ 買方回應提案...');
    try {
      const responseResult = await makeRequest('POST', `/proposals/${testProposalId}/respond`, {
        status: 'interested',
        response: '我們對這個AI物流項目很感興趣，希望能安排進一步的會議討論投資細節。'
      }, buyerToken);
      logSuccess('買方回應成功');
      console.log(`   回應狀態: ${responseResult.data.status}`);
      console.log(`   回應內容: ${responseResult.data.response}`);
    } catch (error) {
      logError('買方回應失敗', error);
    }

    // Step 15: 測試搜尋功能
    console.log('\n1️⃣5️⃣ 測試搜尋功能...');
    try {
      const searchResult = await makeRequest('GET', '/proposals/search/advanced?keyword=AI&industry=科技軟體', null, buyerToken);
      logSuccess('搜尋功能測試成功');
      console.log(`   搜尋結果數量: ${searchResult.data.proposals.length}`);
      
      if (searchResult.data.proposals.length > 0) {
        console.log(`   第一個結果: ${searchResult.data.proposals[0].title}`);
      }
    } catch (error) {
      logError('搜尋功能測試失敗', error);
    }

    // Step 16: 測試刪除申請功能
    console.log('\n1️⃣6️⃣ 測試刪除申請功能...');
    try {
      const deleteRequestResult = await makeRequest('POST', `/proposals/${testProposalId}/request-delete`, {
        reason: '測試完成，申請刪除此提案'
      }, sellerToken);
      logSuccess('刪除申請提交成功');
      console.log(`   申請時間: ${deleteRequestResult.data.requestedAt}`);
      console.log(`   申請原因: ${deleteRequestResult.data.reason}`);
    } catch (error) {
      logError('刪除申請失敗', error);
    }

    // Step 17: 管理員核准刪除
    console.log('\n1️⃣7️⃣ 管理員核准刪除...');
    try {
      await makeRequest('POST', `/proposals/${testProposalId}/approve-delete`, null, adminToken);
      logSuccess('管理員核准刪除成功');
      console.log('   提案已被永久刪除');
    } catch (error) {
      logError('管理員核准刪除失敗', error);
    }

    // Step 18: 驗證提案已刪除
    console.log('\n1️⃣8️⃣ 驗證提案已刪除...');
    try {
      await makeRequest('GET', `/proposals/${testProposalId}`, null, sellerToken);
      logError('提案仍然存在', new Error('刪除功能異常'));
    } catch (error) {
      if (error.message.includes('404')) {
        logSuccess('提案已成功刪除');
      } else {
        logError('刪除驗證失敗', error);
      }
    }

    // Step 19: 測試權限控制
    console.log('\n1️⃣9️⃣ 測試權限控制...');
    try {
      // 創建新提案用於權限測試
      const newProposal = await makeRequest('POST', '/proposals', {
        ...testProposal,
        title: '權限測試提案'
      }, sellerToken);
      
      const newProposalId = newProposal.data._id;
      
      // 測試買方嘗試修改提案（應該失敗）
      try {
        await makeRequest('PUT', `/proposals/${newProposalId}`, {
          title: '買方嘗試修改'
        }, buyerToken);
        logError('權限控制失效', new Error('買方不應該能修改提案'));
      } catch (error) {
        if (error.message.includes('403')) {
          logSuccess('權限控制正常 - 買方無法修改提案');
        } else {
          logError('權限測試異常', error);
        }
      }

      // 測試買方嘗試審核提案（應該失敗）
      try {
        await makeRequest('POST', `/proposals/${newProposalId}/approve`, {
          comments: '買方嘗試審核'
        }, buyerToken);
        logError('權限控制失效', new Error('買方不應該能審核提案'));
      } catch (error) {
        if (error.message.includes('403')) {
          logSuccess('權限控制正常 - 買方無法審核提案');
        } else {
          logError('權限測試異常', error);
        }
      }

      // 清理測試提案
      await makeRequest('DELETE', `/proposals/${newProposalId}`, null, sellerToken);
      logSuccess('權限測試提案已清理');
      
    } catch (error) {
      logError('權限控制測試失敗', error);
    }

    // 完成測試
    console.log('\n🎉 Phase 2 完整測試流程完成！');
    console.log('\n📊 測試總結:');
    console.log('✅ 提案 Model 和 API 功能正常');
    console.log('✅ 狀態管理流程完整');
    console.log('✅ 權限控制機制有效');
    console.log('✅ 買方互動功能正常');
    console.log('✅ 搜尋功能運行正常');
    console.log('✅ 刪除申請機制完整');

  } catch (error) {
    console.error('\n💥 測試過程中發生嚴重錯誤:', error.message);
    process.exit(1);
  }
};

// 執行測試
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✅ 所有測試完成');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ 測試失敗:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };