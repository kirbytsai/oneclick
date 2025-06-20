// server/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // 關聯的提案發送記錄
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProposalSubmission',
    required: true,
    index: true
  },
  
  // 評論者
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 評論內容
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // 評論類型
  type: {
    type: String,
    enum: ['question', 'clarification', 'concern', 'interest', 'feedback'],
    required: true
  },
  
  // 回覆評論ID（如果是回覆）
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // 是否需要回覆
  requiresResponse: {
    type: Boolean,
    default: false
  },
  
  // 回覆狀態
  isAnswered: {
    type: Boolean,
    default: false
  },
  
  // 附件
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  
  // 可見性
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // 標記為已讀
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 索引
commentSchema.index({ submissionId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

// 虛擬欄位 - 回覆
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

module.exports = mongoose.model('Comment', commentSchema);