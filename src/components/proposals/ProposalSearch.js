// src/components/proposals/ProposalSearch.js
import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function ProposalSearch({ onSearch, loading }) {
  const [searchData, setSearchData] = useState({
    query: '',
    industry: '',
    dealType: '',
    minInvestment: '',
    maxInvestment: '',
    tags: []
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 行業選項
  const industryOptions = [
    { value: '', label: '所有行業' },
    { value: 'IT', label: '資訊科技' },
    { value: 'Manufacturing', label: '製造業' },
    { value: 'Finance', label: '金融業' },
    { value: 'Healthcare', label: '醫療保健' },
    { value: 'Education', label: '教育' },
    { value: 'Retail', label: '零售業' },
    { value: 'Real Estate', label: '房地產' },
    { value: 'Other', label: '其他' }
  ];

  // 交易類型選項
  const dealTypeOptions = [
    { value: '', label: '所有類型' },
    { value: 'acquisition', label: '收購' },
    { value: 'investment', label: '投資' },
    { value: 'partnership', label: '合作夥伴' },
    { value: 'licensing', label: '授權' }
  ];

  // 熱門標籤
  const popularTags = ['AI', '環保', 'SaaS', '電商', '物聯網', '區塊鏈'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const toggleTag = (tag) => {
    setSearchData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearAll = () => {
    setSearchData({
      query: '',
      industry: '',
      dealType: '',
      minInvestment: '',
      maxInvestment: '',
      tags: []
    });
    onSearch({
      query: '',
      industry: '',
      dealType: '',
      minInvestment: '',
      maxInvestment: '',
      tags: []
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本搜索 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索提案標題、描述..."
                value={searchData.query}
                onChange={(e) => setSearchData(prev => ({ ...prev, query: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            進階篩選
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 進階搜索 */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 行業篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">行業</label>
                <select
                  value={searchData.industry}
                  onChange={(e) => setSearchData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {industryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 交易類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">交易類型</label>
                <select
                  value={searchData.dealType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, dealType: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dealTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 投資金額範圍 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">投資金額 (萬円)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={searchData.minInvestment}
                    onChange={(e) => setSearchData(prev => ({ ...prev, minInvestment: e.target.value }))}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="最大"
                    value={searchData.maxInvestment}
                    onChange={(e) => setSearchData(prev => ({ ...prev, maxInvestment: e.target.value }))}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 標籤篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">熱門標籤</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      searchData.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {searchData.tags.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">已選擇: </span>
                  {searchData.tags.map(tag => (
                    <span key={tag} className="text-sm text-blue-600 mr-2">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                清除所有篩選
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}