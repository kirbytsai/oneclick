// pages/proposals/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import Layout from '../../src/components/layout/Layout';
import InterestForm from '../../src/components/proposals/InterestForm';
import { proposalService } from '../../src/services/proposalService';
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Users, 
  Calendar,
  Building2,
  FileText,
  Tag,
  AlertCircle,
  Loader2,
  MessageCircle,
  Download,
  Share2
} from 'lucide-react';

export default function ProposalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  // 載入提案詳情
  useEffect(() => {
    if (id && isAuthenticated) {
      loadProposalDetails();
    }
  }, [id, isAuthenticated]);

  const loadProposalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await proposalService.getProposal(id);
      setProposal(response.data);
      
      // 檢查是否已表達興趣 (這裡簡化處理，實際應該從API獲取)
      // setHasExpressedInterest(response.data.hasExpressedInterest);
      
    } catch (err) {
      console.error('載入提案詳情失敗:', err);
      setError(err.message || '載入提案詳情失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理興趣表達
  const handleExpressInterest = async (interestData) => {
    try {
      await proposalService.expressInterest(id, interestData);
      setHasExpressedInterest(true);
      setShowInterestForm(false);
      
      // 重新載入提案以獲取最新統計
      await loadProposalDetails();
      
      alert('興趣表達成功！提案方將會收到您的訊息。');
    } catch (error) {
      console.error('表達興趣失敗:', error);
      alert('表達興趣失敗：' + error.message);
    }
  };

  // 格式化數字
  const formatAmount = (amount) => {
    if (!amount) return '面談';
    return `${(amount / 10000).toLocaleString()}萬円`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 權限檢查
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入以查看提案詳情</p>
            <Link href="/login">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                前往登入
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // 載入狀態
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">載入提案詳情中...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadProposalDetails}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              重試
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!proposal) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">提案不存在</h2>
            <p className="text-gray-600 mb-4">找不到指定的提案</p>
            <Link href="/proposals">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                返回提案列表
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頂部導航 */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/proposals">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  返回提案列表
                </button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>分享</span>
                </button>
                
                {user?.role === 'buyer' && (
                  <button
                    onClick={() => setShowInterestForm(true)}
                    disabled={hasExpressedInterest}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      hasExpressedInterest
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span>{hasExpressedInterest ? '已表達興趣' : '表達興趣'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 提案標題區域 */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {proposal.industry}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    {proposal.maInfo?.dealType === 'acquisition' ? '收購' : 
                     proposal.maInfo?.dealType === 'investment' ? '投資' : 
                     proposal.maInfo?.dealType === 'partnership' ? '合作夥伴' : 
                     proposal.maInfo?.dealType === 'licensing' ? '授權' : 
                     proposal.maInfo?.dealType}
                  </span>
                  {proposal.status === 'published' && (
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      已發布
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {proposal.title}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {proposal.executiveSummary}
                </p>
              </div>
            </div>

            {/* 統計信息 */}
            <div className="flex items-center space-x-6 pt-4 border-t text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{proposal.statistics?.views || 0} 次瀏覽</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{proposal.statistics?.interests || 0} 人感興趣</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{proposal.statistics?.downloads || 0} 次下載</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>發布於 {formatDate(proposal.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 主要信息卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 財務信息 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                財務資訊
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">所需投資</label>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(proposal.financial?.investmentRequired?.amount)}
                  </p>
                </div>
                
                {proposal.financial?.expectedReturns?.roi && (
                  <div>
                    <label className="text-sm text-gray-500">預期回報率</label>
                    <p className="text-xl font-semibold text-green-600">
                      {proposal.financial.expectedReturns.roi}%
                    </p>
                  </div>
                )}
                
                {proposal.financial?.expectedReturns?.timeline && (
                  <div>
                    <label className="text-sm text-gray-500">回報期間</label>
                    <p className="text-gray-900">
                      {proposal.financial.expectedReturns.timeline}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 公司信息 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                公司資訊
              </h3>
              
              <div className="space-y-3">
                {proposal.company?.name && (
                  <div>
                    <label className="text-sm text-gray-500">公司名稱</label>
                    <p className="text-gray-900">{proposal.company.name}</p>
                  </div>
                )}
                
                {proposal.company?.founded && (
                  <div>
                    <label className="text-sm text-gray-500">成立時間</label>
                    <p className="text-gray-900">{proposal.company.founded}年</p>
                  </div>
                )}
                
                {proposal.company?.employees && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-gray-900">{proposal.company.employees} 名員工</span>
                  </div>
                )}
                
                {proposal.location?.region && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-gray-900">{proposal.location.region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 市場信息 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                市場資訊
              </h3>
              
              <div className="space-y-3">
                {proposal.market?.size && (
                  <div>
                    <label className="text-sm text-gray-500">市場規模</label>
                    <p className="text-gray-900">
                      {formatAmount(proposal.market.size)}
                    </p>
                  </div>
                )}
                
                {proposal.market?.growth && (
                  <div>
                    <label className="text-sm text-gray-500">市場成長率</label>
                    <p className="text-green-600 font-semibold">
                      {proposal.market.growth}%
                    </p>
                  </div>
                )}
                
                {proposal.competitive?.advantages?.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">競爭優勢</label>
                    <ul className="text-sm text-gray-900 space-y-1">
                      {proposal.competitive.advantages.slice(0, 2).map((advantage, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 詳細描述 */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">詳細描述</h2>
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </div>
            </div>
          </div>

          {/* 目標市場 */}
          {proposal.targetMarket && (
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">目標市場</h2>
              <div className="text-gray-700 leading-relaxed">
                {proposal.targetMarket}
              </div>
            </div>
          )}

          {/* 標籤 */}
          {proposal.tags && proposal.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Tag className="h-6 w-6 mr-2" />
                相關標籤
              </h2>
              <div className="flex flex-wrap gap-2">
                {proposal.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 興趣表達表單 */}
        <InterestForm
          proposal={proposal}
          onSubmit={handleExpressInterest}
          onCancel={() => setShowInterestForm(false)}
          isOpen={showInterestForm}
          userRole={user?.role}
        />
      </div>
    </Layout>
  );
}