// pages/buyer.js
import { BuyerRoute } from '../src/components/common/ProtectedRoute';
import { useAuth } from '../src/contexts/AuthContext';

export default function BuyerPage() {
  const { user, logout } = useAuth();

  return (
    <BuyerRoute>
      <div className="min-h-screen bg-green-50">
        <div className="bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">💼 買方專用頁面</h1>
            <p>只有買方可以看到這個頁面</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">買方功能</h2>
            <div className="space-y-2">
              <p><strong>當前用戶:</strong> {user?.profile?.name}</p>
              <p><strong>角色:</strong> {user?.role}</p>
              <p><strong>權限:</strong> 瀏覽和購買提案</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">瀏覽提案</h3>
                <p className="text-gray-600 text-sm mt-1">查看可用的提案</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">我的訂單</h3>
                <p className="text-gray-600 text-sm mt-1">管理購買記錄</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">聯絡提案方</h3>
                <p className="text-gray-600 text-sm mt-1">與提案方溝通</p>
              </div>
            </div>
            
            <div className="mt-6 space-x-4">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                回到儀表板
              </button>
              <button 
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>
    </BuyerRoute>
  );
}