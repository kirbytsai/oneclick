// server/utils/seedProposals.js
const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '..', '.env.local');
dotenv.config({ path: envPath });

const database = require('../config/database');
const User = require('../models/User');
const Proposal = require('../models/Proposal');
const ProposalSubmission = require('../models/ProposalSubmission');

const seedProposals = async () => {
  try {
    console.log('🌱 開始創建提案測試資料...');
    
    // 獲取測試用戶
    const sellers = await User.find({ role: 'seller' });
    const buyers = await User.find({ role: 'buyer' });
    
    if (sellers.length === 0 || buyers.length === 0) {
      throw new Error('請先創建提案方和買方用戶');
    }
    
    // 清除現有提案資料
    await Proposal.deleteMany({});
    await ProposalSubmission.deleteMany({});
    console.log('🧹 清除現有提案資料');
    
    const testProposals = [
      {
        title: 'AI 驅動的客戶服務自動化平台',
        sellerId: sellers[0]._id,
        industry: 'IT',
        summary: '開發基於人工智能的客戶服務自動化平台，能夠處理80%的常見客戶查詢，大幅降低人力成本並提升服務效率。',
        description: `
我們的 AI 客戶服務平台採用最新的自然語言處理技術，能夠：

• 自動理解和回應客戶查詢
• 與現有 CRM 系統無縫整合
• 支援多語言（日文、英文、中文）
• 24/7 不間斷服務
• 持續學習優化回應品質

技術特色：
- 基於 GPT-4 的對話引擎
- 語音識別和合成功能
- 情感分析和客戶滿意度監控
- 可自定義的工作流程

市場優勢：
目前市場上缺乏針對日本企業特色的本地化 AI 客戶服務解決方案，我們的產品填補了這個空白。
        `,
        targetMarket: '日本中大型企業，特別是電商、金融服務、電信等客戶服務需求量大的行業。預計目標市場規模達300億日圓。',
        businessModel: {
          revenue: 'SaaS 訂閱模式，按月收費。基礎版 50,000 日圓/月，企業版 200,000 日圓/月，定制版面談。',
          timeline: '預計 12 個月達到收支平衡，24 個月實現盈利。'
        },
        financial: {
          investmentRequired: {
            amount: 50000000,
            currency: 'JPY'
          },
          expectedReturn: {
            roi: 300,
            timeline: '3 年內實現 3 倍投資回報'
          },
          currentFinancials: {
            revenue: 12000000,
            profit: -5000000,
            employees: 8
          }
        },
        maInfo: {
          valuation: {
            amount: 200000000,
            currency: 'JPY',
            basis: '基於現有技術資產和未來 3 年現金流預測'
          },
          dealType: 'investment',
          ownership: {
            shareholdersCount: 3,
            majorShareholders: [
              { name: '創辦人團隊', percentage: 70 },
              { name: '天使投資人', percentage: 20 },
              { name: '員工持股', percentage: 10 }
            ]
          },
          legal: {
            hasLitigation: false,
            hasDebt: false,
            complianceStatus: 'compliant'
          }
        },
        risks: [
          {
            category: 'market',
            description: '大型科技公司可能推出競爭產品',
            severity: 'medium',
            mitigation: '建立技術護城河和客戶忠誠度'
          },
          {
            category: 'technical',
            description: 'AI 技術發展可能超出預期',
            severity: 'low',
            mitigation: '持續研發投入和技術升級'
          }
        ],
        competitiveAdvantages: [
          '深度本地化的日語 AI 模型',
          '與日本主要 CRM 系統的整合經驗',
          '經驗豐富的技術團隊',
          '已建立的客戶關係'
        ],
        tags: ['AI', 'SaaS', '客戶服務', '自動化', 'NLP'],
        status: 'published',
        visibility: {
          isPublic: true
        }
      },
      {
        title: '可持續包裝材料製造業務',
        sellerId: sellers[1]._id,
        industry: 'Manufacturing',
        summary: '生產環保可降解包裝材料，替代傳統塑料包裝，面向電商和食品行業提供可持續解決方案。',
        description: `
我們的可持續包裝解決方案包括：

產品線：
• 可降解快遞包裝袋
• 食品級可堆肥容器
• 工業用環保緩衝材料
• 定制化品牌包裝解決方案

技術優勢：
- 專利的生物降解配方
- 3-6個月完全降解
- 成本僅比傳統包裝高15%
- 通過日本JIS標準認證

生產能力：
目前月產能1000噸，計劃擴產到5000噸/月
        `,
        targetMarket: '日本電商企業、食品製造商、零售連鎖店。隨著環保法規趨嚴，市場需求快速增長。',
        businessModel: {
          revenue: 'B2B直銷模式，與大型電商和製造商簽署長期供應合約。平均毛利率35%。',
          timeline: '已實現盈利，預計未來3年年複合增長率50%。'
        },
        financial: {
          investmentRequired: {
            amount: 300000000,
            currency: 'JPY'
          },
          expectedReturn: {
            roi: 250,
            timeline: '5年內實現2.5倍投資回報'
          },
          currentFinancials: {
            revenue: 180000000,
            profit: 25000000,
            employees: 45
          }
        },
        maInfo: {
          valuation: {
            amount: 800000000,
            currency: 'JPY',
            basis: '基於收入倍數法和資產評估'
          },
          dealType: 'acquisition',
          ownership: {
            shareholdersCount: 2,
            majorShareholders: [
              { name: '創辦人', percentage: 85 },
              { name: '策略投資人', percentage: 15 }
            ]
          },
          legal: {
            hasLitigation: false,
            hasDebt: true,
            complianceStatus: 'compliant'
          }
        },
        risks: [
          {
            category: 'market',
            description: '原材料價格波動風險',
            severity: 'medium',
            mitigation: '建立長期供應商合約'
          }
        ],
        competitiveAdvantages: [
          '專利技術護城河',
          '已建立的客戶基礎',
          '政府政策支持',
          '規模經濟優勢'
        ],
        tags: ['環保', '包裝', '製造業', '可持續發展'],
        status: 'published',
        visibility: {
          isPublic: true
        }
      },
      {
        title: '數位醫療平台整合方案',
        sellerId: sellers[0]._id,
        industry: 'Healthcare',
        summary: '為中小型醫療機構提供數位化轉型解決方案，整合電子病歷、預約系統、遠程診療等功能。',
        description: `
我們的醫療數位化平台整合了：

核心功能：
• 電子病歷管理系統
• 智能預約排程
• 遠程視訊診療
• 處方藥物管理
• 患者健康追蹤
• 醫保結算整合

技術特色：
- 雲端架構，安全可靠
- 符合醫療資料保護法規
- 移動端友好設計
- AI輔助診斷建議
- 與政府醫療系統對接

客戶成功案例：
已為50+家診所成功實施，平均提升診療效率30%，減少行政成本25%。
        `,
        targetMarket: '日本中小型醫療機構、牙科診所、專科醫院。目標客戶群約15,000家機構。',
        businessModel: {
          revenue: 'SaaS訂閱 + 實施服務費。月費20,000-100,000日圓根據規模，實施費100,000-500,000日圓。',
          timeline: '已達收支平衡，計劃24個月內IPO。'
        },
        financial: {
          investmentRequired: {
            amount: 100000000,
            currency: 'JPY'
          },
          expectedReturn: {
            roi: 400,
            timeline: '3年內實現4倍投資回報'
          },
          currentFinancials: {
            revenue: 85000000,
            profit: 15000000,
            employees: 25
          }
        },
        maInfo: {
          valuation: {
            amount: 500000000,
            currency: 'JPY',
            basis: '基於ARR倍數和行業比較'
          },
          dealType: 'investment',
          ownership: {
            shareholdersCount: 4,
            majorShareholders: [
              { name: '創辦團隊', percentage: 60 },
              { name: 'A輪投資人', percentage: 25 },
              { name: '策略投資人', percentage: 10 },
              { name: '員工持股', percentage: 5 }
            ]
          },
          legal: {
            hasLitigation: false,
            hasDebt: false,
            complianceStatus: 'compliant'
          }
        },
        risks: [
          {
            category: 'legal',
            description: '醫療法規變更風險',
            severity: 'medium',
            mitigation: '密切關注法規動態，建立合規團隊'
          },
          {
            category: 'competitive',
            description: '大型醫療IT公司競爭',
            severity: 'high',
            mitigation: '專注中小型市場，提供個性化服務'
          }
        ],
        competitiveAdvantages: [
          '深度理解中小醫療機構需求',
          '快速實施和部署能力',
          '優秀的客戶服務',
          '持續的產品創新'
        ],
        tags: ['醫療', '數位化', 'SaaS', '遠程診療'],
        status: 'approved',
        visibility: {
          isPublic: false
        }
      }
    ];
    
    // 創建提案
    const createdProposals = [];
    for (const proposalData of testProposals) {
      const proposal = new Proposal(proposalData);
      if (proposal.status === 'published') {
        proposal.publishedAt = new Date();
      }
      const savedProposal = await proposal.save();
      createdProposals.push(savedProposal);
      console.log(`✅ 創建提案: ${proposalData.title}`);
    }
    
    // 創建一些發送記錄（買方查看提案的記錄）
    const submissionsToCreate = [
      {
        proposalId: createdProposals[0]._id,
        buyerId: buyers[0]._id,
        sellerId: createdProposals[0].sellerId,
        status: 'interested',
        feedback: {
          interestLevel: 'very_high',
          comments: '對AI技術很感興趣，希望了解更多實施細節。',
          investmentCapacity: {
            min: 30000000,
            max: 80000000,
            currency: 'JPY'
          }
        }
      },
      {
        proposalId: createdProposals[1]._id,
        buyerId: buyers[1]._id,
        sellerId: createdProposals[1].sellerId,
        status: 'questioned',
        feedback: {
          interestLevel: 'high',
          comments: '環保包裝很符合我們的企業理念，想進一步討論合作細節。'
        }
      },
      {
        proposalId: createdProposals[0]._id,
        buyerId: buyers[1]._id,
        sellerId: createdProposals[0].sellerId,
        status: 'viewed'
      }
    ];
    
    for (const submissionData of submissionsToCreate) {
      const submission = new ProposalSubmission(submissionData);
      
      // 添加一些互動記錄
      submission.interactions = [
        {
          type: 'view',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
          details: {}
        },
        {
          type: 'interest',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
          details: { interestLevel: submissionData.feedback?.interestLevel }
        }
      ];
      
      // 設定時間戳
      submission.timestamps = {
        sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10天前
        firstViewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        lastViewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        respondedAt: submissionData.status !== 'viewed' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : undefined
      };
      
      // 設定統計資料
      submission.statistics = {
        viewCount: Math.floor(Math.random() * 10) + 1,
        downloadCount: Math.floor(Math.random() * 3),
        engagementScore: Math.floor(Math.random() * 60) + 40
      };
      
      await submission.save();
      console.log(`✅ 創建發送記錄: ${submissionData.status}`);
    }
    
    console.log('\n🎉 提案測試資料創建完成！');
    console.log('\n📊 創建的資料：');
    console.log(`- ${testProposals.length} 個測試提案`);
    console.log(`- ${submissionsToCreate.length} 個發送記錄`);
    
    console.log('\n📋 提案狀態分布：');
    testProposals.forEach(p => {
      console.log(`  - ${p.title.substring(0, 30)}... (${p.status})`);
    });
    
    return { proposals: createdProposals, submissions: submissionsToCreate };
  } catch (error) {
    console.error('❌ 創建測試資料失敗:', error);
    throw error;
  }
};

// 如果直接執行這個腳本
if (require.main === module) {
  const run = async () => {
    try {
      await database.connect();
      await seedProposals();
      console.log('\n🔄 關閉資料庫連接...');
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed proposals:', error);
      process.exit(1);
    }
  };
  
  run();
}

module.exports = seedProposals;