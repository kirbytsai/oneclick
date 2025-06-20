const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      website: String
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'trial'
    },
    monthlyProposalLimit: {
      type: Number,
      default: 5
    },
    usedProposals: {
      type: Number,
      default: 0
    },
    expiresAt: Date,
    resetDate: Date // 每月重設使用量的日期
  },
  preferences: {
    industries: [{
      type: String
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    }
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [String] // 儲存有效的 refresh tokens
}, {
  timestamps: true
});

// 密碼加密中介軟體
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密碼驗證方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 檢查訂閱狀態
userSchema.methods.canCreateProposal = function() {
  if (this.role !== 'seller') return false;
  if (this.subscription.status !== 'active') return false;
  
  // 檢查是否需要重設月度使用量
  const now = new Date();
  if (!this.subscription.resetDate || now >= this.subscription.resetDate) {
    this.subscription.usedProposals = 0;
    this.subscription.resetDate = new Date(now.setMonth(now.getMonth() + 1));
  }
  
  return this.subscription.usedProposals < this.subscription.monthlyProposalLimit;
};

// 增加提案使用量
userSchema.methods.incrementProposalUsage = function() {
  this.subscription.usedProposals += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);