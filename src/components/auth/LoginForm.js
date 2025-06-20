// src/components/auth/LoginForm.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 清除錯誤當組件掛載時
  useEffect(() => {
    clearError();
  }, []); // 移除 clearError 依賴，因為我們只想在組件掛載時執行一次

  // 處理輸入變化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除錯誤當用戶開始輸入
    if (error) {
      clearError();
    }
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // 登入成功，重定向到儀表板
        try {
          await router.push('/dashboard');
        } catch (routerError) {
          console.error('Router push error:', routerError);
          // 如果路由跳轉失敗，可以嘗試 window.location
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 快速登入（開發用）
  const quickLogin = async (role) => {
    const testAccounts = {
      admin: { email: 'admin@example.com', password: 'Admin123!' },
      buyer: { email: 'buyer@example.com', password: 'Buyer123!' },
      buyer2: { email: 'buyer2@example.com', password: 'Buyer123!' },
      seller: { email: 'seller@example.com', password: 'Seller123!' },
      seller2: { email: 'seller2@example.com', password: 'Seller123!' },
    };

    const account = testAccounts[role];
    if (account) {
      console.log(`🚀 快速登入: ${role} (${account.email})`);
      
      // 清除任何現有錯誤
      if (error) {
        clearError();
      }
      
      // 直接調用登入 API，不依賴表單狀態
      setIsSubmitting(true);
      
      try {
        const result = await login(account.email, account.password);
        
        if (result.success) {
          // 登入成功，重定向到儀表板
          try {
            await router.push('/dashboard');
          } catch (routerError) {
            console.error('Router push error:', routerError);
            // 如果路由跳轉失敗，可以嘗試 window.location
            window.location.href = '/dashboard';
          }
        }
      } catch (err) {
        console.error('Quick login error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo 和標題 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">提</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            提案媒合平台
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登入到您的帳戶
          </p>
        </div>

        {/* 登入表單 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            {/* 錯誤訊息 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email 輸入 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="請輸入您的電子郵件"
                  disabled={isSubmitting || loading}
                />
              </div>

              {/* 密碼輸入 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密碼
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="請輸入您的密碼"
                    disabled={isSubmitting || loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || loading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting || loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </button>
          </div>
        </form>

        {/* 開發環境快速登入 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-3">
              開發模式 - 快速登入
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="text-xs bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                disabled={isSubmitting || loading}
              >
                👤 管理員
              </button>
              <button
                onClick={() => quickLogin('buyer')}
                className="text-xs bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                disabled={isSubmitting || loading}
              >
                🛒 買方1
              </button>
              <button
                onClick={() => quickLogin('buyer2')}
                className="text-xs bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                disabled={isSubmitting || loading}
              >
                🛒 買方2
              </button>
              <button
                onClick={() => quickLogin('seller')}
                className="text-xs bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
                disabled={isSubmitting || loading}
              >
                📝 提案方1
              </button>
              <button
                onClick={() => quickLogin('seller2')}
                className="text-xs bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                disabled={isSubmitting || loading}
              >
                📝 提案方2
              </button>
            </div>
          </div>
        )}

        {/* 頁腳 */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 提案媒合平台. 保留所有權利.</p>
        </div>
      </div>
    </div>
  );
}