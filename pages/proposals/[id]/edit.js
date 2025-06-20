// pages/proposals/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../src/contexts/AuthContext';
import Layout from '../../../src/components/layout/Layout';
import ProposalFormWizard from '../../../src/components/proposals/ProposalFormWizard';
import { proposalService } from '../../../src/services/proposalService';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';

export default function EditProposalPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 載入提案詳情
  useEffect(() => {
    if (id && isAuthenticated) {
      loadProposal();
    }
  }, [id, isAuthenticated]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await proposalService.getProposal(id);
      setProposal(response.data);
      
      // 檢查是否有編輯權限
      if (response.data.sellerId._id !== user._id) {
        setError('您沒有權限編輯此提案');
        return;
      }
      
      // 檢查提案狀態是否可編輯
      if (!['draft', 'rejected'].includes(response.data.status)) {
        setError('只有草稿和被拒絕的提案可以編輯');
        return;
      }
      
    } catch (err) {
      console.error('載入提案失敗:', err);
      setError(err.message || '載入提案失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理更新提案
  const handleUpdateProposal = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // 構建更新數據，確保包含所有必需字段
      const updateData = {
        title: formData.title,
        industry: formData.industry,
        summary: formData.summary,
        description: formData.description,
        executiveSummary: formData.summary,
        targetMarket: formData.targetMarket,
        
        // 商業模式
        businessModel: {
          revenue: formData.businessModel?.revenue || '',
          timeline: formData.businessModel?.timeline || ''
        },
        
        // 公司信息
        company: formData.company,
        
        // 財務信息
        financial: {
          investmentRequired: {
            amount: parseFloat(formData.financial.investmentRequired.amount) || 0,
            currency: formData.financial.investmentRequired.currency || 'JPY'
          },
          expectedReturns: formData.financial.expectedReturns,
          useOfFunds: formData.financial.useOfFunds || '',
          revenueModel: formData.financial.revenueModel || ''
        },
        
        // 市場信息
        market: formData.market,
        
        // 競爭分析
        competitive: formData.competitive,
        
        // 團隊信息
        team: formData.team,
        
        // M&A 信息
        maInfo: formData.maInfo,
        
        // 風險評估
        risks: formData.risks || [],
        
        // 標籤
        tags: formData.tags || []
      };

      console.log('更新提案數據:', updateData);
      
      const response = await proposalService.updateProposal(id, updateData);
      
      console.log('更新成功:', response);
      
      // 跳轉到我的提案頁面
      router.push('/my-proposals');
      
    } catch (error) {
      console.error('更新提案失敗:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理保存草稿
  const handleSaveDraft = async (formData) => {
    try {
      await handleUpdateProposal(formData);
    } catch (error) {
      console.error('保存草稿失敗:', error);
      throw error;
    }
  };

  // 權限檢查
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入才能編輯提案</p>
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
            <p className="text-gray-600 mb-4">只有提案方用戶才能編輯提案</p>
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

  // 載入中
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">載入提案中...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/my-proposals')}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回列表
              </button>
              <button
                onClick={loadProposal}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                重試
              </button>
            </div>
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
                  編輯提案
                </h1>
                <p className="mt-2 text-gray-600">
                  修改您的提案信息，完成後可重新提交審核
                </p>
              </div>
              <button
                onClick={() => router.push('/my-proposals')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 提示信息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  編輯提案須知
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>只有草稿和被拒絕的提案可以編輯</li>
                    <li>修改後的提案將保存為草稿狀態</li>
                    <li>請確保所有信息準確無誤</li>
                    <li>編輯完成後可重新提交審核</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 表單向導 */}
          {proposal && (
            <ProposalFormWizard
              onSubmit={handleUpdateProposal}
              onSaveDraft={handleSaveDraft}
              initialData={proposal}
              isEditing={true}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}