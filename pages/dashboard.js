// pages/dashboard.js
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '../src/components/common/ProtectedRoute';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                歡迎，{user?.profile?.name || user?.email || '用戶'}！
              </h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 用戶資訊 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">用戶資訊</h2>
              <div className="space-y-2">
                <p><strong>姓名:</strong> {user?.profile?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>角色:</strong> {user?.role || 'N/A'}</p>
                <p><strong>公司:</strong> {user?.profile?.company || 'N/A'}</p>
                <p><strong>狀態:</strong> {user?.isActive !== undefined ? (user.isActive ? '活躍' : '停用') : '活躍'}</p>
                {user?.subscription && (
                  <>
                    <p><strong>訂閱:</strong> {user.subscription.plan}</p>
                    <p><strong>提案額度:</strong> {user.subscription.usedProposals || 0} / {user.subscription.monthlyProposalLimit || 0}</p>
                  </>
                )}
              </div>
            </div>

            {/* 角色專用功能導航 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">專用功能</h2>
              <div className="space-y-3">
                {user?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="block p-3 border border-red-200 rounded-lg hover:bg-red-50 text-red-700 hover:text-red-800"
                  >
                    🔧 管理員控制台
                  </a>
                )}
                
                {user?.role === 'buyer' && (
                  <a
                    href="/buyer"
                    className="block p-3 border border-green-200 rounded-lg hover:bg-green-50 text-green-700 hover:text-green-800"
                  >
                    🛒 買方專用頁面
                  </a>
                )}
                
                {user?.role === 'seller' && (
                  <a
                    href="/seller"
                    className="block p-3 border border-purple-200 rounded-lg hover:bg-purple-50 text-purple-700 hover:text-purple-800"
                  >
                    📝 提案方專用頁面
                  </a>
                )}

                <button
                  onClick={() => window.open('/admin', '_blank')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-800"
                  disabled={user?.role !== 'admin'}
                >
                  🧪 測試權限控制 (管理員頁面)
                </button>
              </div>
            </div>
          </div>

          {/* 除錯資訊 */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">除錯資訊</h3>
            <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-4 rounded">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}