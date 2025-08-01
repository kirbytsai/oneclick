// src/components/proposals/ProposalCard.js
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Eye, 
  TrendingUp, 
  MapPin,
  DollarSign,
  Users,
  Heart,
  MessageCircle
} from 'lucide-react';

export default function ProposalCard({ proposal, userRole }) {
  // 格式化金額
  const formatAmount = (amount) => {
    if (!amount) return '面談';
    return `${(amount / 10000).toLocaleString()}萬円`;
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // 格式化行業
  const formatIndustry = (industry) => {
    const industryMap = {
      'IT': '資訊科技',
      'Manufacturing': '製造業',
      'Healthcare': '醫療保健',
      'Finance': '金融業',
      'Education': '教育'
    };
    return industryMap[industry] || industry;
  };

  // 格式化交易類型
  const formatDealType = (dealType) => {
    const dealTypeMap = {
      'acquisition': '收購',
      'investment': '投資',
      'partnership': '合作夥伴',
      'licensing': '授權'
    };
    return dealTypeMap[dealType] || dealType;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 頂部標籤區域 */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {formatIndustry(proposal.industry)}
            </span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {formatDealType(proposal.maInfo?.dealType)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Eye className="h-4 w-4 mr-1" />
            {proposal.statistics?.views || 0}
          </div>
        </div>

        {/* 提案標題 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {proposal.title}
        </h3>

        {/* 提案描述 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {proposal.summary || proposal.executiveSummary}
        </p>
      </div>

      {/* 主要資訊 */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          {/* 投資金額 */}
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-500 mr-2" />
            <div>
              <div className="text-xs text-gray-500">所需投資</div>
              <div className="font-semibold text-gray-900">
                {formatAmount(proposal.financial?.investmentRequired?.amount)}
              </div>
            </div>
          </div>

          {/* 公司規模 */}
          <div className="flex items-center">
            <Users className="h-4 w-4 text-blue-500 mr-2" />
            <div>
              <div className="text-xs text-gray-500">公司規模</div>
              <div className="font-semibold text-gray-900">
                {proposal.company?.employees || '未填寫'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部資訊和動作 */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(proposal.createdAt)}
          </div>
          
          <div className="flex items-center space-x-2">
            {userRole === 'buyer' && (
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <Heart className="h-4 w-4 inline mr-1" />
                興趣
              </button>
            )}
            
            <Link 
              href={`/proposals/${proposal._id}`}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              查看詳情
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}