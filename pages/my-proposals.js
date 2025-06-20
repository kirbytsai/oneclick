// pages/my-proposals.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/layout/Layout';
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
  Users,
  Eye,
  Heart,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function MyProposalsPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // 初始載入
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      loadMyProposals();
    }
  }, [isAuthenticated, user, statusFilter]);

  // 格式化金額
  const formatAmount = (amount) => {
    if (!amount) return '面談';
    return `${(amount / 10000).toLocaleString()}萬円`;
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // 獲取狀態顯示文字
  const getStatusText = (status) => {
    const statusMap = {
      draft: '草稿',
      pending_review: '待審核',
      approved: '已通過',
      rejected: '已拒絕',
      published: '已發布',
      archived: '已歸檔'
    };
    return statusMap[status] || status;
  };

  // 獲取狀態顏色
  const getStatusColor = (status) => {
    const colorMap = {
      draft: 'bg-gray-100 text-gray-700',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-blue-100 text-blue-800',
      archived: 'bg-purple-100 text-purple-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
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
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              前往登入
            </Link>
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
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              返回首頁
            </Link>
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

  const stats = getQuickStats();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-purple-600" />
                  我的提案
                </h1>
                <p className="mt-2 text-gray-600">
                  管理您的商業提案，追蹤互動狀況
                </p>
              </div>
              
              <Link href="/proposals/create" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-5 w-5" />
                創建提案
              </Link>
            </div>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 快速統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總提案數</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已發布</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待審核</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">草稿</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 篩選器 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-700">狀態篩選：</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">全部狀態</option>
                  <option value="draft">草稿</option>
                  <option value="pending_review">待審核</option>
                  <option value="approved">已通過</option>
                  <option value="rejected">已拒絕</option>
                  <option value="published">已發布</option>
                  <option value="archived">已歸檔</option>
                </select>
              </div>

              <button
                onClick={loadMyProposals}
                disabled={loading}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
          </div>

          {/* 提案列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">載入中...</span>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadMyProposals}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                重試
              </button>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到提案</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' ? '您還沒有創建任何提案' : `沒有${getStatusText(statusFilter)}狀態的提案`}
              </p>
              <Link href="/proposals/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                創建第一個提案
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProposals.map(proposal => (
                <div key={proposal._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
                  {/* 提案標題和狀態 */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {proposal.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {proposal.summary}
                    </p>

                    {/* 統計信息 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {proposal.statistics?.views || 0}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {proposal.statistics?.interests || 0}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(proposal.createdAt)}
                      </div>
                    </div>

                    {/* 財務信息 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-gray-900">
                          {formatAmount(proposal.financial?.investmentRequired?.amount)}
                        </span>
                      </div>
                      
                      {proposal.financial?.expectedReturns?.roi && (
                        <div className="text-sm text-green-600">
                          預期回報 {proposal.financial.expectedReturns.roi}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 底部操作區域 */}
                  <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link href={`/proposals/${proposal._id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {proposal.status === 'published' ? '公開頁面' : '查看詳情'}
                      </Link>
                      
                      <Link href={`/proposals/${proposal._id}/edit`} className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        編輯
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}