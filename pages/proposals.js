import { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/layout/Layout';
import ProposalCard from '../src/components/proposals/ProposalCard';
import ProposalSearch from '../src/components/proposals/ProposalSearch';
import { proposalService } from '../src/services/proposalService';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ProposalsPage() {
  const { user, isAuthenticated } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [searchFilters, setSearchFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 載入提案列表
  const loadProposals = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
        ...searchParams
      };

      const response = await proposalService.getProposals(params);
      
      setProposals(response.data.proposals);
      setTotalPages(Math.ceil(response.data.total / params.limit));
      
    } catch (err) {
      console.error('載入提案失敗:', err);
      setError(err.message || '載入提案失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入搜索篩選選項
  const loadSearchFilters = async () => {
    try {
      const filters = await proposalService.getSearchFilters();
      setSearchFilters(filters.data);
    } catch (err) {
      console.error('載入篩選選項失敗:', err);
    }
  };

  // 初始載入
  useEffect(() => {
    if (isAuthenticated) {
      loadProposals();
      loadSearchFilters();
    }
  }, [isAuthenticated, currentPage, sortBy]);

  // 搜索處理
  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      // 映射前端排序到後端格式
      const sortMapping = {
        'createdAt_desc': 'newest',
        'createdAt_asc': 'oldest', 
        'investment_desc': 'investment_desc',
        'investment_asc': 'investment_asc',
        'views_desc': 'newest', // 暫時映射到 newest
        'engagement_desc': 'newest' // 暫時映射到 newest
      };

      // 如果有搜索條件，使用高級搜索API
      if (searchParams.query || 
          searchParams.filters?.industry || 
          searchParams.filters?.dealType ||
          searchParams.filters?.investmentRange?.min ||
          searchParams.filters?.investmentRange?.max ||
          searchParams.filters?.tags?.length > 0) {
        
        // 構建搜索請求 - 根據後端API格式
        const searchRequest = {
          query: searchParams.query || '',
          filters: {},
          sort: sortMapping[sortBy] || 'newest',
          page: 1,
          limit: 12
        };

        // 添加行業篩選 - 轉換為數組格式
        if (searchParams.filters?.industry) {
          searchRequest.filters.industry = [searchParams.filters.industry];
        }

        // 添加交易類型篩選 - 轉換為數組格式
        if (searchParams.filters?.dealType) {
          searchRequest.filters.dealType = [searchParams.filters.dealType];
        }

        // 添加標籤篩選
        if (searchParams.filters?.tags?.length > 0) {
          searchRequest.filters.tags = searchParams.filters.tags;
        }

        // 添加投資範圍篩選
        if (searchParams.filters?.investmentRange?.min || searchParams.filters?.investmentRange?.max) {
          searchRequest.filters.investmentRange = {};
          if (searchParams.filters.investmentRange.min) {
            searchRequest.filters.investmentRange.min = parseInt(searchParams.filters.investmentRange.min) * 10000; // 轉換為日圓
          }
          if (searchParams.filters.investmentRange.max) {
            searchRequest.filters.investmentRange.max = parseInt(searchParams.filters.investmentRange.max) * 10000; // 轉換為日圓
          }
        }

        console.log('搜索請求:', searchRequest);
        const response = await proposalService.searchProposals(searchRequest);
        console.log('搜索回應:', response);
        
        setProposals(response.data.proposals);
        setTotalPages(Math.ceil(response.data.pagination.total / 12));
        
      } else {
        // 沒有搜索條件，載入所有提案
        await loadProposals();
      }
      
    } catch (err) {
      console.error('搜索失敗:', err);
      setError(err.message || '搜索失敗');
    } finally {
      setLoading(false);
    }
  };

  // 排序處理
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  // 頁面切換
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 權限檢查
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入以查看提案列表</p>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">提案列表</h1>
                <p className="mt-2 text-gray-600">
                  瀏覽所有可用的商業提案，找到最適合的投資機會
                </p>
              </div>
              <button
                onClick={() => loadProposals()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                刷新
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 搜索和篩選 */}
          <ProposalSearch
            onSearch={handleSearch}
            searchFilters={searchFilters}
          />

          {/* 排序和結果統計 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {loading ? (
                <span>載入中...</span>
              ) : (
                <span>找到 {proposals.length} 個提案</span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">排序:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt_desc">最新發布</option>
                <option value="investment_desc">投資金額：高到低</option>
                <option value="investment_asc">投資金額：低到高</option>
                <option value="views_desc">最多瀏覽</option>
                <option value="engagement_desc">最高參與度</option>
              </select>
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
                onClick={() => loadProposals()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          )}

          {/* 提案網格 */}
          {!loading && !error && (
            <>
              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到提案</h3>
                  <p className="text-gray-600">請嘗試調整搜索條件或篩選設定</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal._id}
                      proposal={proposal}
                      userRole={user?.role}
                    />
                  ))}
                </div>
              )}

              {/* 分頁 */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一頁
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一頁
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}