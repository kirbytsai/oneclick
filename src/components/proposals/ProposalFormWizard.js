// src/components/proposals/ProposalFormWizard.js
import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  FileText,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Upload,
  Check
} from 'lucide-react';

export default function ProposalFormWizard({ onSubmit, onSaveDraft, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // 基本信息
    title: '',
    industry: '',
    summary: '',
    description: '',
    tags: [],
    
    // 公司信息
    company: {
      name: '',
      founded: '',
      employees: '',
      website: '',
      description: ''
    },
    
    // 財務信息
    financial: {
      investmentRequired: {
        amount: '',
        currency: 'JPY'
      },
      expectedReturns: {
        roi: '',
        timeline: ''
      },
      useOfFunds: '',
      revenueModel: ''
    },
    
    // 市場信息
    market: {
      size: '',
      growth: '',
      targetCustomers: '',
      marketStrategy: ''
    },
    
    // 競爭分析
    competitive: {
      advantages: [],
      competitors: '',
      differentiation: ''
    },
    
    // 團隊信息
    team: {
      keyMembers: [],
      advisors: [],
      teamDescription: ''
    },
    
    // 目標市場
    targetMarket: '',
    
    // M&A 信息
    maInfo: {
      dealType: '',
      timeline: '',
      exitStrategy: ''
    },
    
    // 風險評估
    risks: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 步驟配置
  const steps = [
    {
      id: 1,
      title: '基本信息',
      description: '提案標題和概述',
      icon: FileText,
      fields: ['title', 'industry', 'summary', 'description']
    },
    {
      id: 2,
      title: '公司資料',
      description: '公司基本信息',
      icon: Building2,
      fields: ['company']
    },
    {
      id: 3,
      title: '財務規劃',
      description: '投資需求和回報',
      icon: DollarSign,
      fields: ['financial']
    },
    {
      id: 4,
      title: '市場分析',
      description: '目標市場和策略',
      icon: TrendingUp,
      fields: ['market', 'targetMarket']
    },
    {
      id: 5,
      title: '團隊介紹',
      description: '核心團隊成員',
      icon: Users,
      fields: ['team']
    },
    {
      id: 6,
      title: '文件上傳',
      description: '相關文件資料',
      icon: Upload,
      fields: ['documents']
    }
  ];

  // 更新表單數據
  const updateFormData = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const keys = field.split('.');
        const result = { ...prev };
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return result;
      } else {
        return { ...prev, [field]: value };
      }
    });

    // 清除相關錯誤
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 驗證當前步驟
  const validateCurrentStep = () => {
    const currentStepConfig = steps[currentStep - 1];
    const newErrors = {};

    currentStepConfig.fields.forEach(field => {
      if (field === 'title' && !formData.title.trim()) {
        newErrors.title = '請輸入提案標題';
      }
      if (field === 'industry' && !formData.industry) {
        newErrors.industry = '請選擇行業類別';
      }
      if (field === 'summary' && !formData.summary.trim()) {
        newErrors.summary = '請輸入提案摘要';
      }
      if (field === 'description' && formData.description.length < 50) {
        newErrors.description = '提案描述至少需要50個字符';
      }
      if (field === 'company') {
        if (!formData.company.name.trim()) {
          newErrors['company.name'] = '請輸入公司名稱';
        }
      }
      if (field === 'financial') {
        if (!formData.financial.investmentRequired.amount) {
          newErrors['financial.investmentRequired.amount'] = '請輸入所需投資金額';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 下一步
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  // 上一步
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      await onSaveDraft(formData);
      alert('草稿保存成功！');
    } catch (error) {
      alert('保存失敗：' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交表單
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      alert('提案創建成功！');
    } catch (error) {
      alert('提交失敗：' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染步驟指示器
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white'
                : isActive 
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {isCompleted ? (
                <Check className="h-6 w-6" />
              ) : (
                <StepIcon className="h-6 w-6" />
              )}
            </div>
            <div className="mt-2 text-center">
              <div className={`text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-400 hidden md:block">
                {step.description}
              </div>
            </div>
            
            {/* 連接線 */}
            {index < steps.length - 1 && (
              <div className={`hidden md:block absolute top-6 w-24 h-0.5 transform translate-x-12 ${
                currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
              }`} style={{ left: `${(index + 1) * 16.66}%` }} />
            )}
          </div>
        );
      })}
    </div>
  );

  // 渲染表單步驟內容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderCompanyInfoStep();
      case 3:
        return renderFinancialStep();
      case 4:
        return renderMarketStep();
      case 5:
        return renderTeamStep();
      case 6:
        return renderDocumentStep();
      default:
        return null;
    }
  };

  // 基本信息步驟
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
      
      {/* 提案標題 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          提案標題 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="請輸入簡潔明確的提案標題"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 行業選擇 */}
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
          <p className="text-gray-500 text-sm ml-auto">{formData.summary.length}/500</p>
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
          placeholder="請詳細描述您的商業提案，包括商業模式、產品服務、市場機會等"
          rows={8}
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className="text-gray-500 text-sm ml-auto">{formData.description.length}/2000</p>
        </div>
      </div>
    </div>
  );

  // 公司信息步驟
  const renderCompanyInfoStep = () => (
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

  const renderFinancialStep = () => (
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

      {/* 預期回報率 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            預期年回報率 (%)
          </label>
          <input
            type="number"
            value={formData.financial.expectedReturns.roi}
            onChange={(e) => updateFormData('financial.expectedReturns.roi', e.target.value)}
            placeholder="例如：15"
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投資回收期間
          </label>
          <select
            value={formData.financial.expectedReturns.timeline}
            onChange={(e) => updateFormData('financial.expectedReturns.timeline', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">請選擇期間</option>
            <option value="1年">1年</option>
            <option value="2-3年">2-3年</option>
            <option value="3-5年">3-5年</option>
            <option value="5-7年">5-7年</option>
            <option value="7年以上">7年以上</option>
          </select>
        </div>
      </div>

      {/* 資金用途 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          資金用途說明
        </label>
        <textarea
          value={formData.financial.useOfFunds}
          onChange={(e) => updateFormData('financial.useOfFunds', e.target.value)}
          placeholder="請詳細說明投資資金的主要用途，如研發、市場推廣、人員招聘等"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 營收模式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          營收模式
        </label>
        <textarea
          value={formData.financial.revenueModel}
          onChange={(e) => updateFormData('financial.revenueModel', e.target.value)}
          placeholder="請描述您的商業模式如何產生收入"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderMarketStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">市場分析</h2>
      <p className="text-gray-600">請描述目標市場和競爭環境</p>
      
      {/* 目標市場描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          目標市場描述
        </label>
        <textarea
          value={formData.targetMarket}
          onChange={(e) => updateFormData('targetMarket', e.target.value)}
          placeholder="請描述您的目標客戶群體、市場規模和特點"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 市場規模和成長率 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            市場規模
          </label>
          <input
            type="text"
            value={formData.market.size}
            onChange={(e) => updateFormData('market.size', e.target.value)}
            placeholder="例如：1000億日圓"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年成長率 (%)
          </label>
          <input
            type="number"
            value={formData.market.growth}
            onChange={(e) => updateFormData('market.growth', e.target.value)}
            placeholder="例如：15"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderTeamStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">團隊介紹</h2>
      <p className="text-gray-600">請介紹您的核心團隊成員</p>
      
      {/* 團隊概述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          團隊概述
        </label>
        <textarea
          value={formData.team.teamDescription}
          onChange={(e) => updateFormData('team.teamDescription', e.target.value)}
          placeholder="請簡要介紹您的核心團隊背景、經驗和專長"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* M&A信息 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          交易類型
        </label>
        <select
          value={formData.maInfo.dealType}
          onChange={(e) => updateFormData('maInfo.dealType', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">請選擇交易類型</option>
          <option value="acquisition">收購</option>
          <option value="merger">合併</option>
          <option value="partnership">合作夥伴</option>
          <option value="investment">投資</option>
          <option value="joint_venture">合資</option>
        </select>
      </div>
    </div>
  );

  const renderDocumentStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">文件上傳</h2>
      <p className="text-gray-600">請上傳相關的商業文件（此功能暫未實現）</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">文件上傳功能</h3>
        <p className="text-gray-600 mb-4">此功能將在後續版本中實現</p>
        <p className="text-sm text-gray-500">
          您可以先完成提案創建，之後再上傳相關文件
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* 步驟指示器 */}
      <div className="relative">
        {renderStepIndicator()}
      </div>

      {/* 表單內容 */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {renderStepContent()}

        {/* 底部操作按鈕 */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>上一步</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>保存草稿</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>下一步</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>創建提案</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}