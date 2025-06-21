// src/components/proposals/steps/BasicInfoStep.js
export default function BasicInfoStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
      <p className="text-gray-600">請填寫提案的基本信息</p>
      
      {/* 提案標題 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          提案標題 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="請輸入具有吸引力的提案標題（至少5個字符）"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          <p className={`text-sm ml-auto ${
            formData.title.length < 5 ? 'text-red-500' : 
            formData.title.length > 200 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {formData.title.length}/200 {formData.title.length < 5 && '(最少5字符)'}
          </p>
        </div>
      </div>

      {/* 行業類別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          行業類別 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.industry}
          onChange={(e) => updateFormData('industry', e.target.value)}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.industry ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">請選擇行業</option>
          <option value="IT">資訊科技</option>
          <option value="Manufacturing">製造業</option>
          <option value="Finance">金融業</option>
          <option value="Healthcare">醫療保健</option>
          <option value="Education">教育</option>
          <option value="Retail">零售業</option>
          <option value="Real Estate">房地產</option>
          <option value="Consulting">顧問業</option>
          <option value="Marketing">行銷</option>
          <option value="Logistics">物流</option>
          <option value="Energy">能源</option>
          <option value="Entertainment">娛樂業</option>
          <option value="Food & Beverage">餐飲業</option>
          <option value="Automotive">汽車業</option>
          <option value="Other">其他</option>
        </select>
        {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
      </div>

      {/* 提案摘要 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          提案摘要 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => updateFormData('summary', e.target.value)}
          placeholder="請用簡潔的語言描述您的提案核心內容（建議200-500字）"
          rows={4}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.summary ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.summary && <p className="text-red-500 text-sm">{errors.summary}</p>}
          <p className={`text-sm ml-auto ${
            formData.summary.length < 10 ? 'text-red-500' : 
            formData.summary.length > 1000 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {formData.summary.length}/1000 {formData.summary.length < 10 && '(最少10字符)'}
          </p>
        </div>
      </div>

      {/* 詳細描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          詳細描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="請詳細描述您的商業提案，包括商業模式、產品服務、市場機會等（至少50個字符）"
          rows={8}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className={`text-sm ml-auto ${
            formData.description.length < 50 ? 'text-red-500' : 
            formData.description.length > 10000 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {formData.description.length}/10000 {formData.description.length < 50 && '(最少50字符)'}
          </p>
        </div>
      </div>
    </div>
  );
}