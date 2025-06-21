// src/components/proposals/steps/FinancialStep.js
export default function FinancialStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">財務規劃</h2>
      <p className="text-gray-600">請提供投資需求和財務預測</p>
      
      {/* 所需投資金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          所需投資金額 <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <input
            type="number"
            value={formData.financial.investmentRequired.amount}
            onChange={(e) => updateFormData('financial.investmentRequired.amount', e.target.value)}
            placeholder="請輸入金額"
            min="0"
            className={`flex-1 border rounded-l-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors['financial.investmentRequired.amount'] ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <select
            value={formData.financial.investmentRequired.currency}
            onChange={(e) => updateFormData('financial.investmentRequired.currency', e.target.value)}
            className="border-l-0 border border-gray-300 rounded-r-lg p-3 bg-gray-50"
          >
            <option value="JPY">日圓 (JPY)</option>
            <option value="USD">美元 (USD)</option>
            <option value="EUR">歐元 (EUR)</option>
          </select>
        </div>
        {errors['financial.investmentRequired.amount'] && (
          <p className="text-red-500 text-sm mt-1">{errors['financial.investmentRequired.amount']}</p>
        )}
      </div>

      {/* 預期投資回報率 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          預期投資回報率 (%)
        </label>
        <input
          type="number"
          value={formData.financial.expectedReturns.roi}
          onChange={(e) => updateFormData('financial.expectedReturns.roi', e.target.value)}
          placeholder="例如：20"
          min="0"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 回報時間週期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          回報時間週期
        </label>
        <select
          value={formData.financial.expectedReturns.timeline}
          onChange={(e) => updateFormData('financial.expectedReturns.timeline', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">請選擇時間週期</option>
          <option value="1年">1年</option>
          <option value="2年">2年</option>
          <option value="3-5年">3-5年</option>
          <option value="5-10年">5-10年</option>
          <option value="10年以上">10年以上</option>
        </select>
      </div>

      {/* 資金用途 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          資金用途
        </label>
        <textarea
          value={formData.financial.useOfFunds}
          onChange={(e) => updateFormData('financial.useOfFunds', e.target.value)}
          placeholder="請說明資金的具體用途，如營運資金、設備購置、研發投入等"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 營收模式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          營收模式 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.businessModel.revenue}
          onChange={(e) => updateFormData('businessModel.revenue', e.target.value)}
          placeholder="請描述您的營收模式和盈利策略（必填）"
          rows={3}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors['businessModel.revenue'] ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors['businessModel.revenue'] && (
          <p className="text-red-500 text-sm mt-1">{errors['businessModel.revenue']}</p>
        )}
      </div>

      {/* 商業時程 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          商業時程 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.businessModel.timeline}
          onChange={(e) => updateFormData('businessModel.timeline', e.target.value)}
          placeholder="請描述您的商業發展時程和里程碑（必填）"
          rows={3}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors['businessModel.timeline'] ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors['businessModel.timeline'] && (
          <p className="text-red-500 text-sm mt-1">{errors['businessModel.timeline']}</p>
        )}
      </div>

      {/* 額外營收模式描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          額外營收模式說明
        </label>
        <textarea
          value={formData.financial.revenueModel}
          onChange={(e) => updateFormData('financial.revenueModel', e.target.value)}
          placeholder="如有其他營收模式或補充說明，請在此填寫"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}