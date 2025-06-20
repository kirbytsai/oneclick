// pages/admin.js
import { AdminRoute } from '../src/components/common/ProtectedRoute';
import { useAuth } from '../src/contexts/AuthContext';

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-red-50">
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">🔧 管理員專用頁面</h1>
            <p>只有管理員可以看到這個頁面</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">管理員功能</h2>
            <div className="space-y-2">
              <p><strong>當前用戶:</strong> {user?.profile?.name}</p>
              <p><strong>角色:</strong> {user?.role}</p>
              <p><strong>權限:</strong> 完整系統管理權限</p>
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
    </AdminRoute>
  );
}