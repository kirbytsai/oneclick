// pages/my-proposals.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/layout/Layout';
import ProposalStatusCard from '../src/components/proposals/ProposalStatusCard';
import SellerAnalytics from '../src/components/proposals/SellerAnalytics';
import { proposalService } from '../src/services/proposalService';
import { 
  Plus, 
  Filter, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  BarChart3,
  FileText,
  TrendingUp,
  Users
} from 'lucide-react';

export default function MyProposalsPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [proposals, setProposals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('proposals');
  const [statusFilter, setStatusFilter] = useState('all');

  // 載入我的提案
  const loadMyProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await proposalService.getMyProposals(params);
      setProposals(response.data.proposals);
      
    } catch (err) {
      console.error('載入提案失敗:', err);
      setError(err.message || '載入提案失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入統計分析
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await proposalService.getSellerAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('載入統計失敗:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      loadMyProposals();
      loadAnalytics();
    }
  }, [isAuthenticated, user, statusFilter]);

  // 處理狀態變更
  const handleStatusChange = async (proposalId, action) => {
    try {
      switch (action) {
        case 'submit':
          await proposalService.submitProposalForReview(proposalId);
          break;
        case 'publish':
          await proposalService.publishProposal(proposalId);
          break;
        default:
          throw new Error('未知的操作');
      }
      
      // 重新載入提案列表
      await loadMyProposals();
      alert('操作成功！');
      
    } catch (error) {
      throw error;
    }
  };

  // 權限檢查
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入以查看提案管理</p>
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
            <p className="text-gray-600 mb-4">此頁面僅限提案方使用</p>
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

  // 過濾提案
  const filteredProposals = proposals.filter(proposal => {
    if (statusFilter === 'all') return true;
    return proposal.status === statusFilter;
  });

  // 統計摘要
  const getQuickStats = () => {
    const total = proposals.length;
    const published = proposals.filter(p => p.status === 'published').length;
    const pending = proposals.filter(p => p.status === 'pending_review').length;
    const draft = proposals.filter(p => p.status === 'draft').length;
    
    return { total, published, pending, draft };
  };

  const quickStats = getQuickStats();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">我的提案</h1>
                <p className="mt-2 text-gray-600">
                  管理您的提案，追蹤買方互動和統計分析
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    loadMyProposals();
                    loadAnalytics();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  刷新
                </button>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-5 w-5" />
                  創建提案
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 快速統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">總提案數</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">已發布</p>
                  <p className="text-2xl font-bold text-green-600">{quickStats.published}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待審核</p>
                  <p className="text-2xl font-bold text-yellow-600">{quickStats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">草稿</p>
                  <p className="text-2xl font-bold text-gray-600">{quickStats.draft}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 標籤切換 */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'proposals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-5 w-5 inline mr-2" />
                  提案管理
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  統計分析
                </button>
              </nav>
            </div>

            {/* 提案管理標籤內容 */}
            {activeTab === 'proposals' && (
              <div className="p-6">
                {/* 篩選器 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">狀態篩選:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有狀態</option>
                      <option value="draft">草稿</option>
                      <option value="pending_review">待審核</option>
                      <option value="approved">已通過</option>
                      <option value="rejected">已拒絕</option>
                      <option value="published">已發布</option>
                      <option value="archived">已歸檔</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    顯示 {filteredProposals.length} 個提案
                  </div>
                </div>

                {/* 載入狀態 */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">載入提案中...</span>
                  </div>
                )}

                {/* 錯誤狀態 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-red-900 mb-2">載入失敗</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                      onClick={loadMyProposals}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      重試
                    </button>
                  </div>
                )}

                {/* 提案列表 */}
                {!loading && !error && (
                  <>
                    {filteredProposals.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {statusFilter === 'all' ? '還沒有提案' : '沒有符合條件的提案'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {statusFilter === 'all' 
                            ? '開始創建您的第一個提案，吸引潛在買方' 
                            : '請嘗試調整篩選條件'
                          }
                        </p>
                        {statusFilter === 'all' && (
                          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            創建第一個提案
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredProposals.map((proposal) => (
                          <ProposalStatusCard
                            key={proposal._id}
                            proposal={proposal}
                            onStatusChange={handleStatusChange}
                            userRole={user?.role}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 統計分析標籤內容 */}
            {activeTab === 'analytics' && (
              <div className="p-6">
                <SellerAnalytics
                  analytics={analytics}
                  loading={analyticsLoading}
                  onRefresh={loadAnalytics}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}