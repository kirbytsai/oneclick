// src/components/layout/Layout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navigation = [
    { name: '首頁', href: '/dashboard', icon: Home, current: router.pathname === '/dashboard' },
    { 
      name: '提案列表', 
      href: '/proposals', 
      icon: FileText, 
      current: router.pathname === '/proposals',
      roles: ['buyer', 'admin']
    },
    { 
      name: '創建提案', 
      href: '/proposals/create', 
      icon: PlusCircle, 
      current: router.pathname === '/proposals/create',
      roles: ['seller']
    },
    { 
      name: '我的提案', 
      href: '/my-proposals', 
      icon: BarChart3, 
      current: router.pathname === '/my-proposals',
      roles: ['seller']
    },
    { 
      name: '管理後台', 
      href: '/admin', 
      icon: Settings, 
      current: router.pathname.startsWith('/admin'),
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo 和主導航 */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  href="/dashboard"
                  className="flex items-center cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    提案媒合平台
                  </span>
                </Link>
              </div>
              
              {/* 桌面導航 */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {filteredNavigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer transition-colors ${
                      item.current
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 右側用戶菜單 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-gray-700">
                        {user?.profile?.firstName || user?.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.role === 'admin' ? '管理員' :
                         user?.role === 'buyer' ? '買方' :
                         user?.role === 'seller' ? '提案方' : user?.role}
                      </div>
                    </div>
                  </div>
                </button>

                {/* 用戶下拉菜單 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      登出
                    </button>
                  </div>
                )}
              </div>

              {/* 手機菜單按鈕 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 手機版導航菜單 */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white border-b">
              {filteredNavigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${
                    item.current
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 inline mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 主要內容區域 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 點擊外部關閉用戶菜單 */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}