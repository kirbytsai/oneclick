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

// 導入步驟組件
import BasicInfoStep from './steps/BasicInfoStep';
import CompanyInfoStep from './steps/CompanyInfoStep';
import FinancialStep from './steps/FinancialStep';
import MarketStep from './steps/MarketStep';
import TeamStep from './steps/TeamStep';
import DocumentStep from './steps/DocumentStep';

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
    
    // 商業模式 - 新增必需字段
    businessModel: {
      revenue: '',
      timeline: ''
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
      fields: ['financial', 'businessModel']
    },
    {
      id: 4,
      title: '市場分析',
      description: '目標市場和策略',
      icon: TrendingUp,
      fields: ['market', 'targetMarket', 'maInfo']
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
      if (field === 'title' && (!formData.title.trim() || formData.title.trim().length < 5)) {
        newErrors.title = '請輸入提案標題（至少5個字符）';
      }
      if (field === 'industry' && !formData.industry) {
        newErrors.industry = '請選擇行業類別';
      }
      if (field === 'summary' && (!formData.summary.trim() || formData.summary.length < 10)) {
        newErrors.summary = '請輸入提案摘要（至少10個字符）';
      }
      if (field === 'description' && (!formData.description.trim() || formData.description.length < 50)) {
        newErrors.description = '提案描述至少需要50個字符';
      }
      if (field === 'company') {
        if (!formData.company.name.trim()) {
          newErrors['company.name'] = '請輸入公司名稱';
        }
      }
      if (field === 'financial') {
        if (!formData.financial.investmentRequired.amount || formData.financial.investmentRequired.amount <= 0) {
          newErrors['financial.investmentRequired.amount'] = '請輸入有效的投資金額';
        }
      }
      if (field === 'businessModel') {
        if (!formData.businessModel.revenue.trim()) {
          newErrors['businessModel.revenue'] = '請輸入營收模式';
        }
        if (!formData.businessModel.timeline.trim()) {
          newErrors['businessModel.timeline'] = '請輸入商業時程';
        }
      }
      if (field === 'targetMarket' && (!formData.targetMarket.trim() || formData.targetMarket.length < 10)) {
        newErrors.targetMarket = '請輸入目標市場描述（至少10個字符）';
      }
      if (field === 'maInfo') {
        if (!formData.maInfo.dealType) {
          newErrors['maInfo.dealType'] = '請選擇交易類型';
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
    // 檢查所有必需字段
    const allErrors = {};
    
    if (!formData.title.trim() || formData.title.trim().length < 5) allErrors.title = '請輸入提案標題（至少5個字符）';
    if (!formData.industry) allErrors.industry = '請選擇行業類別';
    if (!formData.summary.trim() || formData.summary.length < 10) allErrors.summary = '請輸入提案摘要（至少10個字符）';
    if (!formData.description.trim() || formData.description.length < 50) allErrors.description = '提案描述至少需要50個字符';
    if (!formData.targetMarket.trim() || formData.targetMarket.length < 10) allErrors.targetMarket = '請輸入目標市場描述（至少10個字符）';
    if (!formData.financial.investmentRequired.amount || formData.financial.investmentRequired.amount <= 0) {
      allErrors['financial.investmentRequired.amount'] = '請輸入有效的投資金額';
    }
    if (!formData.businessModel.revenue.trim()) allErrors['businessModel.revenue'] = '請輸入營收模式';
    if (!formData.businessModel.timeline.trim()) allErrors['businessModel.timeline'] = '請輸入商業時程';
    if (!formData.maInfo.dealType) allErrors['maInfo.dealType'] = '請選擇交易類型';

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      alert('請先完成所有必填項目');
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
              {isCompleted ? <Check className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
            </div>
            <div className="mt-2 text-center">
              <div className={`text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-400 mt-1">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`hidden lg:block w-16 h-0.5 mt-6 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // 渲染當前步驟內容
  const renderStepContent = () => {
    const commonProps = {
      formData,
      errors,
      updateFormData
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return <CompanyInfoStep {...commonProps} />;
      case 3:
        return <FinancialStep {...commonProps} />;
      case 4:
        return <MarketStep {...commonProps} />;
      case 5:
        return <TeamStep {...commonProps} />;
      case 6:
        return <DocumentStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-8">
      {renderStepIndicator()}

      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* 導航按鈕 */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一步
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? '保存中...' : '保存草稿'}
          </button>
        </div>

        <div className="flex space-x-3">
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              下一步
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? '提交中...' : '創建提案'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <span className="text-red-500">*</span> 表示必填欄位
      </div>
    </div>
  );
}