// src/components/proposals/InterestForm.js
import { useState } from 'react';
import { Heart, DollarSign, MessageCircle, Send, X } from 'lucide-react';

export default function InterestForm({ proposal, onSubmit, onCancel, isOpen, userRole }) {
  const [formData, setFormData] = useState({
    interestLevel: 'high',
    comments: '',
    investmentCapacity: {
      min: '',
      max: '',
      currency: 'JPY'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 只有買方可以表達興趣
  if (userRole !== 'buyer' || !isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本驗證
    const newErrors = {};
    if (!formData.comments.trim()) {
      newErrors.comments = '請輸入評論';
    }
    if (formData.comments.length > 2000) {
      newErrors.comments = '評論不能超過2000字';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submissionData = {
        interestLevel: formData.interestLevel,
        comments: formData.comments.trim()
      };

      // 添加投資能力（如果填寫了）
      if (formData.investmentCapacity.min || formData.investmentCapacity.max) {
        submissionData.investmentCapacity = {
          min: formData.investmentCapacity.min ? parseInt(formData.investmentCapacity.min) * 10000 : undefined,
          max: formData.investmentCapacity.max ? parseInt(formData.investmentCapacity.max) * 10000 : undefined,
          currency: formData.investmentCapacity.currency
        };
      }

      await onSubmit(submissionData);
      
      // 重置表單
      setFormData({
        interestLevel: 'high',
        comments: '',
        investmentCapacity: { min: '', max: '', currency: 'JPY' }
      });
      
    } catch (error) {
      console.error('提交興趣表達失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除相關錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleInvestmentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      investmentCapacity: {
        ...prev.investmentCapacity,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">表達興趣</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 提案摘要 */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900 mb-2">{proposal.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{proposal.executiveSummary}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {proposal.industry}
            </span>
            <span className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {proposal.financial?.investmentRequired?.amount ? 
                `${(proposal.financial.investmentRequired.amount / 10000).toLocaleString()}萬円` : 
                '面談'
              }
            </span>
          </div>
        </div>

        {/* 表單內容 */}
        <div className="p-6 space-y-6">
          {/* 興趣程度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              興趣程度 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'very_high', label: '非常高', color: 'bg-red-100 text-red-800 border-red-300' },
                { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                { value: 'medium', label: '中等', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                { value: 'low', label: '低', color: 'bg-gray-100 text-gray-800 border-gray-300' }
              ].map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('interestLevel', level.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.interestLevel === level.value
                      ? level.color
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* 評論/問題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評論或問題 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="請描述您對此提案的興趣、問題或建議..."
              rows={4}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.comments ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.comments && (
                <p className="text-red-500 text-sm">{errors.comments}</p>
              )}
              <p className="text-gray-500 text-sm ml-auto">
                {formData.comments.length}/2000
              </p>
            </div>
          </div>

          {/* 投資能力 (可選) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              投資能力 (可選)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">最小投資額 (萬円)</label>
                <input
                  type="number"
                  value={formData.investmentCapacity.min}
                  onChange={(e) => handleInvestmentChange('min', e.target.value)}
                  placeholder="例如: 1000"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">最大投資額 (萬円)</label>
                <input
                  type="number"
                  value={formData.investmentCapacity.max}
                  onChange={(e) => handleInvestmentChange('max', e.target.value)}
                  placeholder="例如: 5000"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              此信息將幫助提案方了解您的投資範圍
            </p>
          </div>

          {/* 提交按鈕 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>提交興趣</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}