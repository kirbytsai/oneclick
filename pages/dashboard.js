// pages/dashboard.js
import { useAuth } from '../src/contexts/AuthContext';
import ProtectedRoute from '../src/components/common/ProtectedRoute';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  Search, 
  TrendingUp, 
  Heart, 
  Eye,
  ArrowRight,
  Briefcase,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // 買方專用的 Dashboard
  const BuyerDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部歡迎區域 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                歡迎回來，{user?.profile?.firstName || '買方'}！
              </h1>
              <p className="text-gray-600 mt-1">探索最新的商業提案，發現投資機會</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <button 
                onClick={logout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 主要行動區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 探索提案卡片 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">探索商業提案</h2>
                <p className="text-blue-100">發現符合您投資策略的優質提案</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Search className="h-8 w-8" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-100">
                立即開始瀏覽提案
              </div>
              <Link href="/proposals">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <span>瀏覽提案</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* 統計概覽卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">我的活動概覽</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">已瀏覽提案</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600">感興趣提案</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">洽談中項目</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600">完成交易</div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/proposals">
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">瀏覽提案</h3>
              </div>
              <p className="text-gray-600 text-sm">查看最新發布的商業提案，找到適合的投資機會</p>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/my-investments">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">我的投資</h3>
              </div>
              <p className="text-gray-600 text-sm">管理您的投資組合和追蹤項目進度</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/settings">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">帳戶設定</h3>
              </div>
              <p className="text-gray-600 text-sm">更新個人資料和投資偏好設定</p>
            </Link>
          </div>
        </div>

        {/* 最近活動 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">最近活動</h2>
          <div className="text-gray-500 text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>您還沒有任何活動記錄</p>
            <p className="text-sm mt-1">開始瀏覽提案來查看您的活動歷史</p>
            <Link href="/proposals">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                立即開始
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // 提案方專用的 Dashboard
  const SellerDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                歡迎，{user?.profile?.firstName || '提案方'}！
              </h1>
              <p className="text-gray-600 mt-1">管理您的提案，追蹤買方興趣</p>
            </div>
            <button 
              onClick={logout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">提案方儀表板</h2>
          <p className="text-gray-600 mb-6">管理您的提案，查看買方互動統計</p>
          <div className="space-y-4">
            <Link href="/proposals/create">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                創建新提案
              </button>
            </Link>
            <br />
            <Link href="/my-proposals">
              <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                我的提案
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // 管理員專用的 Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                管理員儀表板
              </h1>
              <p className="text-gray-600 mt-1">系統管理和審核中心</p>
            </div>
            <button 
              onClick={logout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <Link href="/admin/users">
              <div className="bg-red-100 p-3 rounded-lg inline-block mb-3">
                <Settings className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">系統管理</h3>
              <p className="text-gray-600 text-sm">管理用戶、權限和系統設定</p>
            </Link>
          </div>

          <Link href="/proposals">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">提案管理</h3>
              <p className="text-gray-600 text-sm">審核和管理所有提案</p>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <Link href="/admin/analytics">
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">統計報告</h3>
              <p className="text-gray-600 text-sm">查看平台使用統計和報告</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // 根據用戶角色渲染不同的 Dashboard
  const renderDashboard = () => {
    switch (user?.role) {
      case 'buyer':
        return <BuyerDashboard />;
      case 'seller':
        return <SellerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">未知角色</h2>
              <p className="text-gray-600">無法識別用戶角色</p>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      {renderDashboard()}
    </ProtectedRoute>
  );
}