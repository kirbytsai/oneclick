// pages/seller.js
import { SellerRoute } from '../src/components/common/ProtectedRoute';
import { useAuth } from '../src/contexts/AuthContext';

export default function SellerPage() {
  const { user, logout } = useAuth();

  return (
    <SellerRoute>
      <div className="min-h-screen bg-purple-50">
        <div className="bg-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">📝 提案方專用頁面</h1>
            <p>只有提案方可以看到這個頁面</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">提案方功能</h2>
            <div className="space-y-2">
              <p><strong>當前用戶:</strong> {user?.profile?.name}</p>
              <p><strong>角色:</strong> {user?.role}</p>
              <p><strong>權限:</strong> 創建和管理提案</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">創建提案</h3>
                <p className="text-gray-600 text-sm mt-1">發布新的商業提案</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">我的提案</h3>
                <p className="text-gray-600 text-sm mt-1">管理已發布的提案</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">銷售統計</h3>
                <p className="text-gray-600 text-sm mt-1">查看提案表現</p>
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
    </SellerRoute>
  );
}