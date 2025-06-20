// server/models/Proposal.js
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  // 基本資訊
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // 提案方
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 行業分類
  industry: {
    type: String,
    required: true,
    enum: [
      'IT', 'Manufacturing', 'Finance', 'Healthcare', 'Education',
      'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Logistics',
      'Energy', 'Entertainment', 'Food & Beverage', 'Automotive', 'Other'
    ],
    index: true
  },
  
  // 提案概述
  summary: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // 詳細內容
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  
  // 目標市場
  targetMarket: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // 商業模式
  businessModel: {
    revenue: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timeline: {
      type: String,
      required: true,
      maxlength: 500
    }
  },
  
  // 財務資訊
  financial: {
    // 投資需求
    investmentRequired: {
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'JPY',
        enum: ['JPY', 'USD', 'EUR']
      }
    },
    
    // 預期回報
    expectedReturn: {
      roi: {
        type: Number,
        min: 0,
        max: 1000 // 1000% = 10x
      },
      timeline: {
        type: String,
        maxlength: 200
      }
    },
    
    // 現有財務狀況
    currentFinancials: {
      revenue: {
        type: Number,
        min: 0
      },
      profit: {
        type: Number
      },
      employees: {
        type: Number,
        min: 0
      }
    }
  },
  
  // M&A 相關資訊
  maInfo: {
    // 公司估值
    valuation: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'JPY',
        enum: ['JPY', 'USD', 'EUR']
      },
      basis: {
        type: String,
        maxlength: 500
      }
    },
    
    // 交易類型
    dealType: {
      type: String,
      enum: ['acquisition', 'merger', 'partnership', 'investment', 'joint_venture'],
      required: true
    },
    
    // 股權結構
    ownership: {
      shareholdersCount: {
        type: Number,
        min: 1
      },
      majorShareholders: [{
        name: String,
        percentage: {
          type: Number,
          min: 0,
          max: 100
        }
      }]
    },
    
    // 法務狀況
    legal: {
      hasLitigation: {
        type: Boolean,
        default: false
      },
      hasDebt: {
        type: Boolean,
        default: false
      },
      complianceStatus: {
        type: String,
        enum: ['compliant', 'minor_issues', 'major_issues'],
        default: 'compliant'
      }
    }
  },
  
  // 風險評估
  risks: [{
    category: {
      type: String,
      enum: ['market', 'financial', 'operational', 'legal', 'technical', 'competitive'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    mitigation: {
      type: String,
      maxlength: 500
    }
  }],
  
  // 競爭優勢
  competitiveAdvantages: [{
    type: String,
    maxlength: 300
  }],
  
  // 附件
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['document', 'presentation', 'financial_statement', 'legal_document', 'other'],
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 狀態管理
  status: {
    type: String,
    enum: [
      'draft',              // 草稿
      'pending_review',     // 待審核
      'approved',          // 已通過審核
      'rejected',          // 審核未通過
      'published',         // 已發布
      'archived'           // 已歸檔
    ],
    default: 'draft',
    index: true
  },
  
  // 審核資訊
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewComments: {
      type: String,
      maxlength: 1000
    },
    rejectionReason: {
      type: String,
      maxlength: 1000
    }
  },
  
  // 統計資料
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    interests: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  
  // 可見性設定
  visibility: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedBuyers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    restrictedIndustries: [{
      type: String
    }]
  },
  
  // 標籤
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
proposalSchema.index({ sellerId: 1, status: 1 });
proposalSchema.index({ industry: 1, status: 1 });
proposalSchema.index({ createdAt: -1 });
proposalSchema.index({ 'financial.investmentRequired.amount': 1 });
proposalSchema.index({ tags: 1 });
proposalSchema.index({ title: 'text', summary: 'text', description: 'text' });

// 虛擬欄位
proposalSchema.virtual('submission', {
  ref: 'ProposalSubmission',
  localField: '_id',
  foreignField: 'proposalId'
});

// 中介軟體
proposalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 實例方法
proposalSchema.methods.canBeViewedBy = function(user) {
  if (!user) return false;
  
  // 管理員可以查看所有提案
  if (user.role === 'admin') return true;
  
  // 提案方可以查看自己的提案
  if (this.sellerId.toString() === user._id.toString()) return true;
  
  // 已發布的提案買方可以查看
  if (this.status === 'published' && user.role === 'buyer') {
    if (this.visibility.isPublic) return true;
    if (this.visibility.allowedBuyers.includes(user._id)) return true;
  }
  
  return false;
};

proposalSchema.methods.updateStatus = async function(newStatus, reviewData = {}) {
  this.status = newStatus;
  
  if (reviewData.reviewedBy) {
    this.review.reviewedBy = reviewData.reviewedBy;
    this.review.reviewedAt = new Date();
    this.review.reviewComments = reviewData.reviewComments;
    this.review.rejectionReason = reviewData.rejectionReason;
  }
  
  if (newStatus === 'published') {
    this.publishedAt = new Date();
  } else if (newStatus === 'archived') {
    this.archivedAt = new Date();
  }
  
  return this.save();
};

// 靜態方法
proposalSchema.statics.findByIndustry = function(industry, status = 'published') {
  return this.find({ industry, status }).populate('sellerId', 'profile email');
};

proposalSchema.statics.searchProposals = function(query, filters = {}) {
  const searchCriteria = {
    status: 'published',
    ...filters
  };
  
  if (query) {
    searchCriteria.$text = { $search: query };
  }
  
  return this.find(searchCriteria)
    .populate('sellerId', 'profile email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Proposal', proposalSchema);