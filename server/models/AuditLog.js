// server/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // 操作用戶
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 操作動作
  action: {
    type: String,
    required: true,
    enum: [
      // 用戶相關
      'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE', 'CHANGE_PASSWORD',
      
      // 提案相關
      'CREATE_PROPOSAL', 'UPDATE_PROPOSAL', 'DELETE_PROPOSAL',
      'SUBMIT_PROPOSAL', 'APPROVE_PROPOSAL', 'REJECT_PROPOSAL', 'PUBLISH_PROPOSAL',
      
      // 互動相關
      'EXPRESS_INTEREST', 'ADD_COMMENT', 'SIGN_NDA', 'REQUEST_CONTACT', 'APPROVE_CONTACT',
      
      // 管理員相關
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'SYSTEM_CONFIG',
      
      // 系統相關
      'FILE_UPLOAD', 'EMAIL_SENT', 'SYSTEM_ERROR'
    ],
    index: true
  },
  
  // 資源類型
  resourceType: {
    type: String,
    enum: ['User', 'Proposal', 'ProposalSubmission', 'Comment', 'System'],
    index: true
  },
  
  // 資源ID
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // IP 地址
  ipAddress: {
    type: String,
    validate: {
      validator: function(v) {
        // 簡單的 IP 地址驗證
        return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
      },
      message: '無效的 IP 地址格式'
    }
  },
  
  // 用戶代理
  userAgent: {
    type: String,
    maxlength: 1000
  },
  
  // 操作詳情
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // 操作結果
  success: {
    type: Boolean,
    default: true
  },
  
  // 錯誤訊息（如果失敗）
  errorMessage: {
    type: String,
    maxlength: 2000
  },
  
  // 持續時間（毫秒）
  duration: {
    type: Number,
    min: 0
  },
  
  // 時間戳
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // 我們使用自定義的 timestamp
});

// 複合索引
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // 用於清理舊記錄

// 靜態方法
auditLogSchema.statics.logAction = function(actionData) {
  return this.create({
    ...actionData,
    timestamp: new Date()
  });
};

// 記錄用戶操作
auditLogSchema.statics.logUserAction = function(userId, action, details = {}, req = null) {
  const logData = {
    userId,
    action,
    details,
    resourceType: 'User',
    resourceId: userId
  };
  
  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
  }
  
  return this.logAction(logData);
};

// 記錄提案操作
auditLogSchema.statics.logProposalAction = function(userId, action, proposalId, details = {}, req = null) {
  const logData = {
    userId,
    action,
    resourceType: 'Proposal',
    resourceId: proposalId,
    details
  };
  
  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
  }
  
  return this.logAction(logData);
};

// 記錄系統操作
auditLogSchema.statics.logSystemAction = function(action, details = {}, error = null) {
  return this.logAction({
    userId: null, // 系統操作
    action,
    resourceType: 'System',
    details,
    success: !error,
    errorMessage: error ? error.message : undefined
  });
};

// 獲取用戶操作歷史
auditLogSchema.statics.getUserHistory = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = { userId };
  
  if (action) {
    query.action = action;
  }
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.find(query)
    .populate('userId', 'email profile.name')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// 獲取資源操作歷史
auditLogSchema.statics.getResourceHistory = function(resourceType, resourceId, options = {}) {
  const { limit = 20 } = options;
  
  return this.find({
    resourceType,
    resourceId
  })
    .populate('userId', 'email profile.name role')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// 統計操作數據
auditLogSchema.statics.getActionStats = function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 預設30天前
    endDate = new Date(),
    groupBy = 'action' // 'action', 'userId', 'resourceType'
  } = options;
  
  const pipeline = [
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failureCount: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// 清理舊記錄
auditLogSchema.statics.cleanupOldLogs = function(daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
};

// 實例方法
auditLogSchema.methods.toSummary = function() {
  return {
    id: this._id,
    action: this.action,
    resourceType: this.resourceType,
    timestamp: this.timestamp,
    success: this.success,
    user: this.userId?.email || 'System'
  };
};

// 中介軟體
auditLogSchema.pre('save', function(next) {
  // 自動設定 IP 地址的地理位置（可選功能）
  if (this.ipAddress && !this.details?.location) {
    // 這裡可以集成 IP 地理位置查詢服務
    // 例如：MaxMind GeoIP, ipapi.co 等
  }
  
  next();
});

// 虛擬欄位
auditLogSchema.virtual('actionDescription').get(function() {
  const actionMap = {
    'LOGIN': '用戶登入',
    'LOGOUT': '用戶登出',
    'CREATE_PROPOSAL': '創建提案',
    'UPDATE_PROPOSAL': '更新提案',
    'DELETE_PROPOSAL': '刪除提案',
    'SUBMIT_PROPOSAL': '提交審核',
    'APPROVE_PROPOSAL': '審核通過',
    'REJECT_PROPOSAL': '審核拒絕',
    'PUBLISH_PROPOSAL': '發布提案',
    'EXPRESS_INTEREST': '表達興趣',
    'ADD_COMMENT': '添加評論',
    'SIGN_NDA': '簽署NDA',
    'REQUEST_CONTACT': '請求聯絡',
    'APPROVE_CONTACT': '批准聯絡'
  };
  
  return actionMap[this.action] || this.action;
});

module.exports = mongoose.model('AuditLog', auditLogSchema);