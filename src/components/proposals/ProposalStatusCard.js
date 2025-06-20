// src/components/proposals/ProposalStatusCard.js
import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  DollarSign,
  Edit3,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';

export default function ProposalStatusCard({ proposal, onStatusChange, userRole }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 格式化金額
  const formatAmount = (amount) => {
    if (!amount) return '面談';
    return `${(amount / 10000).toLocaleString()}萬円`;
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // 狀態顯示配置
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { 
        label: '草稿', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Edit3,
        description: '提案尚未提交審核'
      },
      'pending_review': { 
        label: '待審核', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        description: '等待管理員審核中'
      },
      'approved': { 
        label: '已通過', 
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        description: '審核通過，可以發布'
      },
      'rejected': { 
        label: '已拒絕', 
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        description: '審核未通過，需要修改'
      },
      'published': { 
        label: '已發布', 
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Send,
        description: '提案已公開，買方可查看'
      },
      'archived': { 
        label: '已歸檔', 
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: FileText,
        description: '提案已歸檔'
      }
    };
    return configs[status] || configs.draft;
  };

  const statusConfig = getStatusConfig(proposal.status);
  const StatusIcon = statusConfig.icon;

  // 處理狀態操作
  const handleStatusAction = async (action) => {
    setIsSubmitting(true);
    setShowMenu(false);
    
    try {
      await onStatusChange(proposal._id, action);
    } catch (error) {
      console.error('狀態操作失敗:', error);
      alert('操作失敗：' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 獲取可用操作
  const getAvailableActions = () => {
    const actions = [];
    
    switch (proposal.status) {
      case 'draft':
        actions.push({ 
          label: '提交審核', 
          action: 'submit',
          color: 'text-blue-600 hover:bg-blue-50'
        });
        break;
      case 'approved':
        actions.push({ 
          label: '發布提案', 
          action: 'publish',
          color: 'text-green-600 hover:bg-green-50'
        });
        break;
      case 'rejected':
        actions.push({ 
          label: '重新提交', 
          action: 'submit',
          color: 'text-blue-600 hover:bg-blue-50'
        });
        break;
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
      {/* 卡片頭部 */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusConfig.label}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {proposal.industry}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {proposal.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {proposal.executiveSummary || proposal.summary}
            </p>
            
            <p className="text-xs text-gray-500">
              {statusConfig.description}
            </p>
          </div>
          
          {/* 操作菜單 */}
          {availableActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  {availableActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleStatusAction(action.action)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 統計信息 */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {proposal.statistics?.views || 0} 瀏覽
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">
              {proposal.statistics?.interests || 0} 興趣
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {proposal.statistics?.comments || 0} 評論
            </span>
          </div>
        </div>
      </div>

      {/* 財務信息 */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
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
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(proposal.createdAt)}
        </div>

        <div className="flex items-center space-x-3">
          {proposal.status === 'published' && (
            <Link href={`/proposals/${proposal._id}`}>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                公開頁面
              </button>
            </Link>
          )}
          
          <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
            編輯
          </button>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            查看詳情
          </button>
        </div>
      </div>

      {/* 點擊外部關閉菜單 */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}