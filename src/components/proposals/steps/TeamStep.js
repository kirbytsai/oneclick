// src/components/proposals/steps/TeamStep.js
export default function TeamStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">團隊介紹</h2>
      <p className="text-gray-600">請介紹您的核心團隊成員</p>
      
      {/* 團隊描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          團隊概述
        </label>
        <textarea
          value={formData.team.teamDescription}
          onChange={(e) => updateFormData('team.teamDescription', e.target.value)}
          placeholder="請簡要介紹您的團隊背景、經驗和優勢"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 競爭優勢 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          競爭優勢
        </label>
        <textarea
          value={formData.competitive.differentiation}
          onChange={(e) => updateFormData('competitive.differentiation', e.target.value)}
          placeholder="請描述您相對於競爭對手的核心優勢"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 主要競爭對手 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          主要競爭對手
        </label>
        <textarea
          value={formData.competitive.competitors}
          onChange={(e) => updateFormData('competitive.competitors', e.target.value)}
          placeholder="請列出主要競爭對手及其特點"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}