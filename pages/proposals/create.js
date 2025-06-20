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
      
      // 構建提案數據
      const proposalData = {
        title: formData.title,
        industry: formData.industry,
        summary: formData.summary,
        description: formData.description,
        executiveSummary: formData.summary, // 使用 summary 作為 executiveSummary
        targetMarket: formData.targetMarket || formData.summary,
        
        company: formData.company,
        financial: formData.financial,
        market: formData.market,
        competitive: formData.competitive,
        team: formData.team,
        maInfo: formData.maInfo,
        risks: formData.risks,
        
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
      
      const response = await proposalService.createProposal(proposalData);
      
      console.log('創建成功:', response);
      
      // 跳轉到我的提案頁面
      router.push('/my-proposals');
      
    } catch (error) {
      console.error('創建提案失敗:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理保存草稿
  const handleSaveDraft = async (formData) => {
    // 實現保存草稿邏輯
    console.log('保存草稿:', formData);
    // 可以調用相同的 createProposal API，狀態設為 draft
  };

  // 權限檢查
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入以創建提案</p>
            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往登入
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role !== 'seller') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">權限不足</h2>
            <p className="text-gray-600 mb-4">只有提案方可以創建提案</p>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首頁
            </a>
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