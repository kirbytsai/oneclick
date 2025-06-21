// server/models/Proposal.js
const mongoose = require('mongoose');

// 行業選項
const INDUSTRIES = [
  '科技軟體', '製造業', '金融服務', '零售消費',
  '醫療健康', '不動產', '能源環保', '教育培訓',
  '物流運輸', '媒體娛樂', '餐飲服務', 
  '建築工程', '農林漁業', '其他'
];

// 員工規模選項
const EMPLOYEE_RANGES = [
  '1-10人', '11-50人', '51-100人', '101-500人',
  '501-1000人', '1000-5000人', '5000人以上'
];

// 交易類型
const TRANSACTION_TYPES = [
  'acquisition',    // 收購
  'investment',     // 投資
  'partnership',    // 策略合作
  'joint_venture'   // 合資
];

// 提案狀態
const PROPOSAL_STATUS = [
  'draft',          // 草稿
  'pending_review', // 待審核
  'under_review',   // 審核中
  'approved',       // 已核准
  'rejected',       // 已拒絕
  'published'       // 已發佈
];

// 買方回應狀態
const BUYER_RESPONSE_STATUS = [
  'sent',           // 已發送
  'viewed',         // 已查看
  'interested',     // 感興趣
  'questions',      // 有疑問
  'declined',       // 已拒絕
  'meeting'         // 安排會議
];

// 獲利狀況選項
const PROFITABILITY_OPTIONS = [
  'profitable',     // 獲利中
  'break_even',     // 損益平衡
  'growing',        // 成長中
  'early_stage'     // 早期階段
];

// 估值範圍預設選項 (日圓)
const VALUATION_RANGES = [
  { min: 10000000, max: 50000000, label: '1千萬 - 5千萬日圓' },
  { min: 50000000, max: 100000000, label: '5千萬 - 1億日圓' },
  { min: 100000000, max: 500000000, label: '1億 - 5億日圓' },
  { min: 500000000, max: 1000000000, label: '5億 - 10億日圓' },
  { min: 1000000000, max: 10000000000, label: '10億 - 100億日圓' },
  { min: 10000000000, max: null, label: '100億日圓以上' }
];

const proposalSchema = new mongoose.Schema({
  // 基本信息
  title: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  industry: { 
    type: String, 
    required: true,
    enum: INDUSTRIES
  },
  
  // 公司概況
  company: {
    name: { 
      type: String, 
      required: true, 
      maxlength: 100,
      trim: true
    },
    founded: { 
      type: Number, 
      required: true, 
      min: 1800, 
      max: new Date().getFullYear()
    },
    employees: { 
      type: String, 
      required: true,
      enum: EMPLOYEE_RANGES
    },
    location: { 
      type: String, 
      required: true, 
      maxlength: 100,
      trim: true
    },
    website: { 
      type: String, 
      maxlength: 200,
      trim: true
    },
    description: { 
      type: String, 
      required: true, 
      maxlength: 1000,
      trim: true
    }
  },
  
  // 執行摘要
  executiveSummary: { 
    type: String, 
    required: true, 
    minlength: 10, 
    maxlength: 500,
    trim: true
  },
  
  // 財務亮點
  financial: {
    annualRevenue: {
      amount: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      currency: { 
        type: String, 
        required: true, 
        enum: ['JPY'], // 只支援日幣
        default: 'JPY'
      },
      year: { 
        type: Number, 
        required: true,
        min: 2000,
        max: new Date().getFullYear()
      }
    },
    ebitda: {
      amount: { 
        type: Number, 
        min: 0 
      },
      margin: { 
        type: Number, 
        min: -100, 
        max: 100 
      }
    },
    growthRate: { 
      type: Number, 
      required: true,
      min: -100,
      max: 1000 // 最高1000%成長
    },
    profitability: { 
      type: String, 
      enum: PROFITABILITY_OPTIONS,
      required: true
    }
  },
  
  // 交易詳情
  transaction: {
    type: { 
      type: String, 
      required: true, 
      enum: TRANSACTION_TYPES 
    },
    targetValuation: {
      min: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      max: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      currency: { 
        type: String, 
        required: true, 
        enum: ['JPY'],
        default: 'JPY'
      }
    },
    timeline: { 
      type: String, 
      required: true,
      maxlength: 200
    },
    dealStructure: { 
      type: String, 
      maxlength: 1000 
    }
  },
  
  // 競爭優勢
  competitiveAdvantages: [{
    type: String,
    maxlength: 200,
    trim: true
  }],
  
  // 市場地位
  market: {
    position: { 
      type: String, 
      maxlength: 500 
    },
    size: { 
      type: String, 
      maxlength: 200 
    },
    competitors: { 
      type: String, 
      maxlength: 500 
    }
  },
  
  // 標籤系統
  tags: [{
    type: String,
    maxlength: 50,
    trim: true
  }],
  
  // 狀態管理
  status: { 
    type: String, 
    required: true, 
    enum: PROPOSAL_STATUS,
    default: 'draft'
  },
  
  // 目標買方
  targetBuyers: [{
    buyerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    sentAt: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: BUYER_RESPONSE_STATUS,
      default: 'sent'
    },
    response: { 
      type: String, 
      maxlength: 1000 
    },
    responseAt: Date
  }],
  
  // 審核信息
  review: {
    reviewedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    reviewedAt: Date,
    comments: { 
      type: String, 
      maxlength: 1000 
    },
    action: {
      type: String,
      enum: ['approved', 'rejected', 'returned_to_draft']
    }
  },
  
  // 刪除申請
  deleteRequest: {
    requested: { 
      type: Boolean, 
      default: false 
    },
    requestedAt: Date,
    reason: { 
      type: String, 
      maxlength: 500 
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    deletedAt: Date
  },
  
  // 元數據
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  submittedAt: Date,
  approvedAt: Date,
  publishedAt: Date
});

// 索引設置
proposalSchema.index({ creator: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ industry: 1 });
proposalSchema.index({ 'targetBuyers.buyerId': 1 });
proposalSchema.index({ tags: 1 });
proposalSchema.index({ createdAt: -1 });

// 更新時間中介軟體
proposalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 驗證目標估值
proposalSchema.pre('save', function(next) {
  if (this.transaction.targetValuation.min >= this.transaction.targetValuation.max) {
    next(new Error('最低估值必須小於最高估值'));
  }
  next();
});

// 實例方法
proposalSchema.methods.canEdit = function() {
  return ['draft', 'rejected'].includes(this.status);
};

proposalSchema.methods.canSubmit = function() {
  return this.status === 'draft';
};

proposalSchema.methods.canApprove = function() {
  return ['pending_review', 'under_review'].includes(this.status);
};

proposalSchema.methods.canPublish = function() {
  return this.status === 'approved';
};

proposalSchema.methods.isOwner = function(userId) {
  return this.creator.toString() === userId.toString();
};

// 靜態方法
proposalSchema.statics.getIndustries = function() {
  return INDUSTRIES;
};

proposalSchema.statics.getEmployeeRanges = function() {
  return EMPLOYEE_RANGES;
};

proposalSchema.statics.getTransactionTypes = function() {
  return TRANSACTION_TYPES;
};

proposalSchema.statics.getValuationRanges = function() {
  return VALUATION_RANGES;
};

proposalSchema.statics.getStatusOptions = function() {
  return PROPOSAL_STATUS;
};

// 導出常數供其他模組使用
proposalSchema.statics.INDUSTRIES = INDUSTRIES;
proposalSchema.statics.EMPLOYEE_RANGES = EMPLOYEE_RANGES;
proposalSchema.statics.TRANSACTION_TYPES = TRANSACTION_TYPES;
proposalSchema.statics.PROPOSAL_STATUS = PROPOSAL_STATUS;
proposalSchema.statics.BUYER_RESPONSE_STATUS = BUYER_RESPONSE_STATUS;
proposalSchema.statics.VALUATION_RANGES = VALUATION_RANGES;

module.exports = mongoose.model('Proposal', proposalSchema);