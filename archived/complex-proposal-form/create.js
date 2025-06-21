// pages/proposals/create.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Layout from '../../src/components/layout/Layout';
import ProposalFormWizard from '../../src/components/proposals/ProposalFormWizard';
import { proposalService } from '../../src/services/proposalService';
import { AlertCircle, FileText } from 'lucide-react';

export default function CreateProposalPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 處理創建提案
  const handleCreateProposal = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // 驗證必需字段
      const requiredFields = {
        title: formData.title?.trim(),
        industry: formData.industry,
        summary: formData.summary?.trim(),
        description: formData.description?.trim(),
        targetMarket: formData.targetMarket?.trim(),
        'financial.investmentRequired.amount': formData.financial?.investmentRequired?.amount,
        'businessModel.revenue': formData.businessModel?.revenue?.trim(),
        'businessModel.timeline': formData.businessModel?.timeline?.trim(),
        'maInfo.dealType': formData.maInfo?.dealType
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (!value || (typeof value === 'string' && value.length === 0)) {
          missingFields.push(key);
        }
      });

      if (missingFields.length > 0) {
        throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
      }

      // 構建提案數據，確保所有必需字段都有值
      const proposalData = {
        title: formData.title.trim(),
        industry: formData.industry,
        summary: formData.summary.trim(),
        description: formData.description.trim(),
        executiveSummary: formData.summary.trim(), // 使用 summary 作為 executiveSummary
        targetMarket: formData.targetMarket.trim(),
        
        // 商業模式 - 必需字段
        businessModel: {
          revenue: formData.businessModel?.revenue?.trim() || '',
          timeline: formData.businessModel?.timeline?.trim() || ''
        },
        
        // 公司信息
        company: {
          name: formData.company?.name?.trim() || '',
          founded: formData.company?.founded || '',
          employees: formData.company?.employees || '',
          website: formData.company?.website?.trim() || '',
          description: formData.company?.description?.trim() || ''
        },
        
        // 財務信息 - 確保 amount 是數字
        financial: {
          investmentRequired: {
            amount: parseFloat(formData.financial.investmentRequired.amount) || 0,
            currency: formData.financial.investmentRequired.currency || 'JPY'
          },
          expectedReturns: {
            roi: formData.financial.expectedReturns?.roi ? parseFloat(formData.financial.expectedReturns.roi) : '',
            timeline: formData.financial.expectedReturns?.timeline || ''
          },
          useOfFunds: formData.financial.useOfFunds?.trim() || '',
          revenueModel: formData.financial.revenueModel?.trim() || ''
        },
        
        // 市場信息
        market: {
          size: formData.market?.size?.trim() || '',
          growth: formData.market?.growth?.trim() || '',
          targetCustomers: formData.market?.targetCustomers?.trim() || '',
          marketStrategy: formData.market?.marketStrategy?.trim() || ''
        },
        
        // 競爭分析
        competitive: {
          advantages: formData.competitive?.advantages || [],
          competitors: formData.competitive?.competitors?.trim() || '',
          differentiation: formData.competitive?.differentiation?.trim() || ''
        },
        
        // 團隊信息
        team: {
          keyMembers: formData.team?.keyMembers || [],
          advisors: formData.team?.advisors || [],
          teamDescription: formData.team?.teamDescription?.trim() || ''
        },
        
        // M&A 信息 - 必需字段
        maInfo: {
          dealType: formData.maInfo.dealType, // 這是必需的
          timeline: formData.maInfo?.timeline || '',
          exitStrategy: formData.maInfo?.exitStrategy?.trim() || ''
        },
        
        // 風險評估
        risks: formData.risks || [],
        
        // 標籤
        tags: formData.tags || [],
        
        // 預設值
        status: 'draft',
        visibility: {
          isPublic: false,
          allowedBuyers: [],
          restrictedIndustries: []
        }
      };

      console.log('創建提案數據:', proposalData);
      
      // 進行最後驗證
      if (!proposalData.title || proposalData.title.length < 5) {
        throw new Error('標題長度必須在5-200字符之間');
      }
      if (!proposalData.summary || proposalData.summary.length < 10) {
        throw new Error('摘要長度必須在10-1000字符之間');
      }
      if (!proposalData.description || proposalData.description.length < 50) {
        throw new Error('描述長度必須在50-10000字符之間');
      }
      if (!proposalData.targetMarket || proposalData.targetMarket.length < 10) {
        throw new Error('目標市場描述必須在10-1000字符之間');
      }
      if (!proposalData.financial.investmentRequired.amount || proposalData.financial.investmentRequired.amount <= 0) {
        throw new Error('投資金額必須為正數');
      }
      if (!proposalData.businessModel.revenue || proposalData.businessModel.revenue.length === 0) {
        throw new Error('請填寫營收模式');
      }
      if (!proposalData.businessModel.timeline || proposalData.businessModel.timeline.length === 0) {
        throw new Error('請填寫商業時程');
      }
      if (!proposalData.maInfo.dealType) {
        throw new Error('請選擇交易類型');
      }

      const response = await proposalService.createProposal(proposalData);
      
      console.log('創建成功:', response);
      
      // 跳轉到我的提案頁面
      router.push('/proposals/my');
      
    } catch (error) {
      console.error('創建提案失敗:', error);
      throw error; // 重新拋出錯誤讓組件處理
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理保存草稿
  const handleSaveDraft = async (formData) => {
    try {
      // 保存草稿的邏輯 - 可以允許不完整的數據
      const draftData = {
        ...formData,
        status: 'draft'
      };
      
      console.log('保存草稿:', draftData);
      // 這裡可以調用保存草稿的 API
      
    } catch (error) {
      console.error('保存草稿失敗:', error);
      throw error;
    }
  };

  // 檢查用戶權限
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入才能創建提案</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往登入
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role !== 'seller') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">權限不足</h2>
            <p className="text-gray-600 mb-4">只有提案方用戶才能創建提案</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首頁
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-blue-600" />
                  創建提案
                </h1>
                <p className="mt-2 text-gray-600">
                  填寫詳細信息來創建您的商業提案，吸引潛在投資者
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  創建提案須知
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>請確保所有信息真實準確，虛假信息可能導致提案被拒絕</li>
                    <li>標有紅色星號(*)的欄位為必填項目</li>
                    <li>提案創建後會保存為草稿，您可以隨時編輯</li>
                    <li>提交審核前，請仔細檢查所有內容的完整性</li>
                    <li>審核通過後，提案將在平台上公開展示</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 表單向導 */}
          <ProposalFormWizard
            onSubmit={handleCreateProposal}
            onSaveDraft={handleSaveDraft}
            initialData={null}
          />
        </div>
      </div>
    </Layout>
  );
}