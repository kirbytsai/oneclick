// src/components/proposals/steps/CompanyInfoStep.js
export default function CompanyInfoStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">公司資料</h2>
      <p className="text-gray-600">請填寫您的公司基本信息</p>
      
      {/* 公司名稱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.company.name}
          onChange={(e) => updateFormData('company.name', e.target.value)}
          placeholder="請輸入公司名稱"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors['company.name'] ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors['company.name'] && <p className="text-red-500 text-sm mt-1">{errors['company.name']}</p>}
      </div>

      {/* 成立年份 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          成立年份
        </label>
        <input
          type="number"
          value={formData.company.founded}
          onChange={(e) => updateFormData('company.founded', e.target.value)}
          placeholder="例如：2020"
          min="1900"
          max={new Date().getFullYear()}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 員工數量 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          員工數量
        </label>
        <select
          value={formData.company.employees}
          onChange={(e) => updateFormData('company.employees', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">請選擇員工規模</option>
          <option value="1-10">1-10 人</option>
          <option value="11-50">11-50 人</option>
          <option value="51-200">51-200 人</option>
          <option value="201-500">201-500 人</option>
          <option value="501-1000">501-1000 人</option>
          <option value="1000+">1000+ 人</option>
        </select>
      </div>

      {/* 公司網站 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司網站
        </label>
        <input
          type="url"
          value={formData.company.website}
          onChange={(e) => updateFormData('company.website', e.target.value)}
          placeholder="https://www.example.com"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 公司描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司簡介
        </label>
        <textarea
          value={formData.company.description}
          onChange={(e) => updateFormData('company.description', e.target.value)}
          placeholder="請簡要介紹您的公司背景、發展歷程和核心業務"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-gray-500 text-sm mt-1">{formData.company.description.length}/1000</p>
      </div>
    </div>
  );
}