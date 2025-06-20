// src/components/common/ProtectedRoute.js
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = [],
  redirectTo = '/login',
  fallback = null 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // 等待認證狀態載入完成
      if (loading) {
        return;
      }

      // 檢查是否已登入
      if (!isAuthenticated) {
        await router.push(redirectTo);
        return;
      }

      // 檢查角色權限
      let hasPermission = true;

      if (requiredRole) {
        hasPermission = user?.role === requiredRole;
      } else if (allowedRoles.length > 0) {
        hasPermission = allowedRoles.includes(user?.role);
      }

      if (!hasPermission) {
        // 根據用戶角色重定向到適當的頁面
        const roleRedirects = {
          admin: '/dashboard',
          buyer: '/dashboard', 
          seller: '/dashboard'
        };
        
        const defaultRedirect = roleRedirects[user?.role] || '/dashboard';
        await router.push(defaultRedirect);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, loading, user, requiredRole, allowedRoles, router, redirectTo]);

  // 載入中狀態
  if (loading || isChecking) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      )
    );
  }

  // 未授權狀態
  if (!isAuthenticated || !isAuthorized) {
    return null; // 重定向時不顯示任何內容
  }

  // 授權通過，顯示子組件
  return children;
};

// 角色專用的高階組件
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const BuyerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="buyer" {...props}>
    {children}
  </ProtectedRoute>
);

export const SellerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="seller" {...props}>
    {children}
  </ProtectedRoute>
);

// 多角色路由
export const BuyerOrSellerRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['buyer', 'seller']} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;