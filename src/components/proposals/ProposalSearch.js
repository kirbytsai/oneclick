import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export default function ProposalSearch({ onSearch, searchFilters }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    industry: '',
    dealType: '',
    investmentRange: { min: '', max: '' },
    tags: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      filters: selectedFilters
    });
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      industry: '',
      dealType: '',
      investmentRange: { min: '', max: '' },
      tags: []
    });
    setSearchQuery('');
    onSearch({ query: '', filters: {} });
  };

  const hasActiveFilters = searchQuery || 
    selectedFilters.industry || 
    selectedFilters.dealType || 
    selectedFilters.investmentRange.min || 
    selectedFilters.investmentRange.max || 
    selectedFilters.tags.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* 基本搜索 */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索提案關鍵字..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          篩選
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 高級篩選 */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 行業篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">行業</label>
              <select
                value={selectedFilters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有行業</option>
                {searchFilters?.industries?.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* 交易類型篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">交易類型</label>
              <select
                value={selectedFilters.dealType}
                onChange={(e) => handleFilterChange('dealType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有類型</option>
                {searchFilters?.dealTypes?.map(type => (
                  <option key={type} value={type}>
                    {type === 'acquisition' ? '收購' : 
                     type === 'investment' ? '投資' : 
                     type === 'partnership' ? '合作夥伴' : 
                     type === 'licensing' ? '授權' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* 投資金額範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最低投資 (萬円)</label>
              <input
                type="number"
                value={selectedFilters.investmentRange.min}
                onChange={(e) => handleFilterChange('investmentRange', {
                  ...selectedFilters.investmentRange,
                  min: e.target.value
                })}
                placeholder="最低金額"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最高投資 (萬円)</label>
              <input
                type="number"
                value={selectedFilters.investmentRange.max}
                onChange={(e) => handleFilterChange('investmentRange', {
                  ...selectedFilters.investmentRange,
                  max: e.target.value
                })}
                placeholder="最高金額"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 熱門標籤 */}
          {searchFilters?.popularTags?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">熱門標籤</label>
              <div className="flex flex-wrap gap-2">
                {searchFilters.popularTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedFilters.tags.includes(tag.name)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 篩選按鈕 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              應用篩選
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                清除篩選
              </button>
            )}
          </div>
        </div>
      )}

      {/* 活躍篩選顯示 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>活躍篩選:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                "{searchQuery}"
              </span>
            )}
            {selectedFilters.industry && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                {selectedFilters.industry}
              </span>
            )}
            {selectedFilters.dealType && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {selectedFilters.dealType === 'acquisition' ? '收購' : 
                 selectedFilters.dealType === 'investment' ? '投資' : 
                 selectedFilters.dealType === 'partnership' ? '合作夥伴' : 
                 selectedFilters.dealType === 'licensing' ? '授權' : selectedFilters.dealType}
              </span>
            )}
            {selectedFilters.tags.map(tag => (
              <span key={tag} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}