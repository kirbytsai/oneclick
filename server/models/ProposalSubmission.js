// server/models/ProposalSubmission.js
const mongoose = require('mongoose');

const proposalSubmissionSchema = new mongoose.Schema({
  // 提案ID
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
    index: true
  },
  
  // 買方ID
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 提案方ID (冗余欄位，方便查詢)
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 發送狀態
  status: {
    type: String,
    enum: [
      'sent',                // 已發送給買方
      'viewed',              // 買方已查看
      'interested',          // 買方表示興趣
      'questioned',          // 買方提問中
      'nda_signed',          // NDA已簽署
      'detail_requested',    // 要求詳細資料
      'under_negotiation',   // 洽談中
      'contact_exchanged',   // 已交換聯絡方式
      'deal_closed',         // 交易完成
      'rejected',            // 買方拒絕
      'archived'             // 已歸檔
    ],
    default: 'sent',
    index: true
  },
  
  // NDA 相關
  nda: {
    required: {
      type: Boolean,
      default: true
    },
    signedAt: Date,
    documentUrl: String,
    ipAddress: String,
    userAgent: String
  },
  
  // 互動記錄
  interactions: [{
    type: {
      type: String,
      enum: ['view', 'download', 'question', 'interest', 'rejection', 'contact_request'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // 買方反饋
  feedback: {
    interestLevel: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'not_interested']
    },
    comments: {
      type: String,
      maxlength: 2000
    },
    concerns: [{
      category: {
        type: String,
        enum: ['financial', 'market', 'technical', 'legal', 'operational']
      },
      description: String
    }],
    investmentCapacity: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'JPY'
      }
    }
  },
  
  // 聯絡資訊交換
  contactExchange: {
    requestedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    exchangedContacts: {
      buyerContact: {
        email: String,
        phone: String,
        company: String,
        position: String
      },
      sellerContact: {
        email: String,
        phone: String,
        company: String,
        position: String
      }
    }
  },
  
  // 時間戳記錄
  timestamps: {
    sentAt: {
      type: Date,
      default: Date.now
    },
    firstViewedAt: Date,
    lastViewedAt: Date,
    respondedAt: Date,
    closedAt: Date
  },
  
  // 統計資料
  statistics: {
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    responseTime: Number, // 以小時為單位
    engagementScore: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 複合索引
proposalSubmissionSchema.index({ proposalId: 1, buyerId: 1 }, { unique: true });
proposalSubmissionSchema.index({ buyerId: 1, status: 1 });
proposalSubmissionSchema.index({ sellerId: 1, status: 1 });
proposalSubmissionSchema.index({ 'timestamps.sentAt': -1 });

// 虛擬欄位
proposalSubmissionSchema.virtual('proposal', {
  ref: 'Proposal',
  localField: 'proposalId',
  foreignField: '_id',
  justOne: true
});

proposalSubmissionSchema.virtual('buyer', {
  ref: 'User',
  localField: 'buyerId',
  foreignField: '_id',
  justOne: true
});

proposalSubmissionSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// 中介軟體
proposalSubmissionSchema.pre('save', function(next) {
  // 計算回應時間
  if (this.timestamps.respondedAt && this.timestamps.sentAt) {
    const diffMs = this.timestamps.respondedAt - this.timestamps.sentAt;
    this.statistics.responseTime = Math.round(diffMs / (1000 * 60 * 60)); // 轉換為小時
  }
  
  // 計算參與度分數
  this.calculateEngagementScore();
  
  next();
});

// 實例方法
proposalSubmissionSchema.methods.addInteraction = function(type, details = {}) {
  this.interactions.push({
    type,
    details,
    timestamp: new Date()
  });
  
  // 更新相關時間戳
  if (type === 'view') {
    if (!this.timestamps.firstViewedAt) {
      this.timestamps.firstViewedAt = new Date();
    }
    this.timestamps.lastViewedAt = new Date();
    this.statistics.viewCount += 1;
    
    // 如果是第一次查看，更新狀態
    if (this.status === 'sent') {
      this.status = 'viewed';
    }
  } else if (type === 'download') {
    this.statistics.downloadCount += 1;
  } else if (type === 'question' || type === 'interest') {
    this.timestamps.respondedAt = new Date();
  }
  
  return this.save();
};

proposalSubmissionSchema.methods.updateStatus = function(newStatus, metadata = {}) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // 記錄狀態變更
  this.addInteraction('status_change', {
    from: oldStatus,
    to: newStatus,
    metadata
  });
  
  // 特殊狀態處理
  if (newStatus === 'nda_signed') {
    this.nda.signedAt = new Date();
    this.nda.ipAddress = metadata.ipAddress;
    this.nda.userAgent = metadata.userAgent;
  } else if (newStatus === 'contact_exchanged') {
    this.contactExchange.approvedAt = new Date();
    this.contactExchange.approvedBy = metadata.approvedBy;
  } else if (['deal_closed', 'rejected', 'archived'].includes(newStatus)) {
    this.timestamps.closedAt = new Date();
  }
  
  return this.save();
};

proposalSubmissionSchema.methods.calculateEngagementScore = function() {
  let score = 0;
  
  // 基礎分數
  if (this.statistics.viewCount > 0) score += 20;
  if (this.statistics.downloadCount > 0) score += 20;
  
  // 互動分數
  const questionCount = this.interactions.filter(i => i.type === 'question').length;
  const interestCount = this.interactions.filter(i => i.type === 'interest').length;
  
  score += Math.min(questionCount * 15, 30); // 最多30分
  score += Math.min(interestCount * 10, 20); // 最多20分
  
  // 狀態獎勵
  const statusBonus = {
    'viewed': 5,
    'interested': 10,
    'questioned': 15,
    'nda_signed': 20,
    'detail_requested': 25,
    'under_negotiation': 30,
    'contact_exchanged': 40,
    'deal_closed': 50
  };
  
  score += statusBonus[this.status] || 0;
  
  // 回應速度獎勵
  if (this.statistics.responseTime) {
    if (this.statistics.responseTime <= 24) score += 10; // 24小時內回應
    else if (this.statistics.responseTime <= 72) score += 5; // 72小時內回應
  }
  
  this.statistics.engagementScore = Math.min(score, 100);
};

// 靜態方法
proposalSubmissionSchema.statics.findByBuyer = function(buyerId, status = null) {
  const query = { buyerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('proposalId', 'title summary industry financial')
    .populate('sellerId', 'profile email')
    .sort({ 'timestamps.sentAt': -1 });
};

proposalSubmissionSchema.statics.findBySeller = function(sellerId, status = null) {
  const query = { sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('proposalId', 'title summary industry')
    .populate('buyerId', 'profile email')
    .sort({ 'timestamps.sentAt': -1 });
};

proposalSubmissionSchema.statics.getAnalytics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgEngagement: { $avg: '$statistics.engagementScore' },
        avgResponseTime: { $avg: '$statistics.responseTime' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('ProposalSubmission', proposalSubmissionSchema);