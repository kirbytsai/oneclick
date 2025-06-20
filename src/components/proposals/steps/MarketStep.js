// src/components/proposals/steps/MarketStep.js
export default function MarketStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">市場分析</h2>
      <p className="text-gray-600">請提供市場分析和交易信息</p>
      
      {/* 目標市場 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          目標市場描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.targetMarket}
          onChange={(e) => updateFormData('targetMarket', e.target.value)}
          placeholder="請詳細描述您的目標市場，包括客戶群體、市場規模、競爭狀況等（至少10個字符）"
          rows={4}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.targetMarket ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.targetMarket && <p className="text-red-500 text-sm">{errors.targetMarket}</p>}
          <p className={`text-sm ml-auto ${
            formData.targetMarket.length < 10 ? 'text-red-500' : 
            formData.targetMarket.length > 1000 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {formData.targetMarket.length}/1000 {formData.targetMarket.length < 10 && '(最少10字符)'}
          </p>
        </div>
      </div>

      {/* 交易類型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          交易類型 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.maInfo.dealType}
          onChange={(e) => updateFormData('maInfo.dealType', e.target.value)}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors['maInfo.dealType'] ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">請選擇交易類型</option>
          <option value="acquisition">收購 (Acquisition)</option>
          <option value="merger">合併 (Merger)</option>
          <option value="partnership">戰略合作 (Partnership)</option>
          <option value="investment">投資 (Investment)</option>
          <option value="joint_venture">合資 (Joint Venture)</option>
        </select>
        {errors['maInfo.dealType'] && <p className="text-red-500 text-sm mt-1">{errors['maInfo.dealType']}</p>}
      </div>

      {/* 預期時間週期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          預期時間週期
        </label>
        <select
          value={formData.maInfo.timeline}
          onChange={(e) => updateFormData('maInfo.timeline', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">請選擇時間週期</option>
          <option value="立即">立即</option>
          <option value="3個月內">3個月內</option>
          <option value="6個月內">6個月內</option>
          <option value="1年內">1年內</option>
          <option value="1年以上">1年以上</option>
        </select>
      </div>

      {/* 退出策略 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          退出策略
        </label>
        <textarea
          value={formData.maInfo.exitStrategy}
          onChange={(e) => updateFormData('maInfo.exitStrategy', e.target.value)}
          placeholder="請描述您的退出策略或長期規劃"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 市場規模 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市場規模
        </label>
        <input
          type="text"
          value={formData.market.size}
          onChange={(e) => updateFormData('market.size', e.target.value)}
          placeholder="例如：100億日圓市場"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 市場成長率 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市場成長率
        </label>
        <input
          type="text"
          value={formData.market.growth}
          onChange={(e) => updateFormData('market.growth', e.target.value)}
          placeholder="例如：年成長率15%"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 目標客戶 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          目標客戶群體
        </label>
        <textarea
          value={formData.market.targetCustomers}
          onChange={(e) => updateFormData('market.targetCustomers', e.target.value)}
          placeholder="請描述您的主要目標客戶群體"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 市場策略 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市場策略
        </label>
        <textarea
          value={formData.market.marketStrategy}
          onChange={(e) => updateFormData('market.marketStrategy', e.target.value)}
          placeholder="請描述您的市場進入策略和競爭策略"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}