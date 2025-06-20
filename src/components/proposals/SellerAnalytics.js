// src/components/proposals/SellerAnalytics.js
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Users, 
  DollarSign,
  FileText,
  Activity,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function SellerAnalytics({ analytics, loading, onRefresh }) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">載入統計數據中...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無統計數據</h3>
          <p className="text-gray-500 mb-4">發布提案後將顯示詳細統計</p>
          <button 
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            刷新數據
          </button>
        </div>
      </div>
    );
  }

  const { overview, engagement, statusDistribution } = analytics;

  // 計算轉換率
  const conversionRate = overview?.totalSubmissions > 0 
    ? ((overview.closedDeals / overview.totalSubmissions) * 100).toFixed(1)
    : 0;

  // 計算平均參與度
  const avgEngagement = engagement?.avgEngagement || 0;

  return (
    <div className="space-y-6">
      {/* 統計標題和控制 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">統計分析</h2>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
            <option value="90d">最近 90 天</option>
            <option value="all">全部時間</option>
          </select>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>刷新</span>
          </button>
        </div>
      </div>

      {/* 核心指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 總發送數 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {overview?.totalSubmissions || 0}
              </p>
              <p className="text-sm text-gray-500">總發送數</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">較上週</span>
          </div>
        </div>

        {/* 活躍互動 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {overview?.activeSubmissions || 0}
              </p>
              <p className="text-sm text-gray-500">活躍互動</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">較上週</span>
          </div>
        </div>

        {/* 成交數 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {overview?.closedDeals || 0}
              </p>
              <p className="text-sm text-gray-500">成交數</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+25%</span>
            <span className="text-gray-500 ml-1">較上週</span>
          </div>
        </div>

        {/* 轉換率 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {conversionRate}%
              </p>
              <p className="text-sm text-gray-500">轉換率</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+3.2%</span>
            <span className="text-gray-500 ml-1">較上週</span>
          </div>
        </div>
      </div>

      {/* 參與度分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 參與度概覽 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">參與度分析</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">總瀏覽數</span>
              </div>
              <span className="font-semibold text-gray-900">
                {engagement?.totalViews?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-700">總興趣數</span>
              </div>
              <span className="font-semibold text-gray-900">
                {engagement?.totalInterests?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">下載次數</span>
              </div>
              <span className="font-semibold text-gray-900">
                {engagement?.totalDownloads?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">平均參與度</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(avgEngagement, 100)}%` }}
                    />
                  </div>
                  <span className="font-semibold text-blue-600">
                    {avgEngagement.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 狀態分布 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">提案狀態分布</h3>
          
          {statusDistribution && statusDistribution.length > 0 ? (
            <div className="space-y-3">
              {statusDistribution.map((status, index) => {
                const statusLabels = {
                  'interested': '感興趣',
                  'questioned': '已提問',
                  'viewed': '已瀏覽',
                  'contacted': '已聯絡',
                  'deal_closed': '成交',
                  'rejected': '已拒絕'
                };
                
                const statusColors = {
                  'interested': 'bg-blue-500',
                  'questioned': 'bg-yellow-500',
                  'viewed': 'bg-gray-500',
                  'contacted': 'bg-green-500',
                  'deal_closed': 'bg-purple-500',
                  'rejected': 'bg-red-500'
                };

                const label = statusLabels[status._id] || status._id;
                const colorClass = statusColors[status._id] || 'bg-gray-500';
                const percentage = overview?.totalSubmissions > 0 
                  ? ((status.count / overview.totalSubmissions) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <span className="text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{percentage}%</span>
                      <span className="font-semibold text-gray-900">{status.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">暫無狀態數據</p>
            </div>
          )}
        </div>
      </div>

      {/* 趨勢圖表佔位符 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">參與度趨勢</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">圖表功能開發中</p>
            <p className="text-sm text-gray-400">將顯示參與度變化趨勢</p>
          </div>
        </div>
      </div>
    </div>
  );
}