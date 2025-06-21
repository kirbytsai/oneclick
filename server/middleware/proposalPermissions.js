// server/middleware/proposalPermissions.js
const Proposal = require('../models/Proposal');
const ResponseFormatter = require('../utils/response');

// 檢查提案擁有者權限
const isProposalOwner = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以執行此操作', null, 403)
      );
    }

    req.proposal = proposal;
    next();
  } catch (error) {
    console.error('權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('PERMISSION_CHECK_FAILED', '權限檢查失敗', null, 500)
    );
  }
};

// 檢查提案是否可編輯
const canEditProposal = async (req, res, next) => {
  try {
    const proposal = req.proposal || await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.canEdit()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '當前狀態不允許編輯', null, 400)
      );
    }

    req.proposal = proposal;
    next();
  } catch (error) {
    console.error('編輯權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('EDIT_CHECK_FAILED', '編輯權限檢查失敗', null, 500)
    );
  }
};

// 檢查提案是否可提交
const canSubmitProposal = async (req, res, next) => {
  try {
    const proposal = req.proposal || await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.canSubmit()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '當前狀態不允許提交', null, 400)
      );
    }

    req.proposal = proposal;
    next();
  } catch (error) {
    console.error('提交權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('SUBMIT_CHECK_FAILED', '提交權限檢查失敗', null, 500)
    );
  }
};

// 檢查提案是否可審核
const canReviewProposal = async (req, res, next) => {
  try {
    const proposal = req.proposal || await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.canApprove()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '當前狀態不允許審核', null, 400)
      );
    }

    req.proposal = proposal;
    next();
  } catch (error) {
    console.error('審核權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('REVIEW_CHECK_FAILED', '審核權限檢查失敗', null, 500)
    );
  }
};

// 檢查提案是否可發佈
const canPublishProposal = async (req, res, next) => {
  try {
    const proposal = req.proposal || await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.canPublish()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '只能發佈已核准的提案', null, 400)
      );
    }

    req.proposal = proposal;
    next();
  } catch (error) {
    console.error('發佈權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('PUBLISH_CHECK_FAILED', '發佈權限檢查失敗', null, 500)
    );
  }
};

// 檢查買方是否為目標買方
const isBuyerTargeted = async (req, res, next) => {
  try {
    const proposal = req.proposal || await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    const isTargeted = proposal.targetBuyers.some(
      tb => tb.buyerId.toString() === req.user._id.toString()
    );

    const canView = 
      req.user.role === 'admin' ||
      proposal.isOwner(req.user._id) ||
      (req.user.role === 'buyer' && (proposal.status === 'published' || isTargeted));

    if (!canView) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '無權限查看此提案', null, 403)
      );
    }

    req.proposal = proposal;
    req.isTargetedBuyer = isTargeted;
    next();
  } catch (error) {
    console.error('買方權限檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('BUYER_CHECK_FAILED', '買方權限檢查失敗', null, 500)
    );
  }
};

// 訂閱狀態檢查（提案方創建提案時）
const checkSubscriptionForProposal = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return next();
    }

    // 檢查用戶訂閱狀態
    if (!req.user.canCreateProposal()) {
      return res.status(403).json(
        ResponseFormatter.error('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能創建提案', null, 403)
      );
    }

    // 檢查提案數量限制（如果有的話）
    const proposalCount = await Proposal.countDocuments({
      creator: req.user._id,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const monthlyLimit = req.user.subscription.planType === 'basic' ? 5 : 
                        req.user.subscription.planType === 'premium' ? 20 : 100;

    if (proposalCount >= monthlyLimit) {
      return res.status(403).json(
        ResponseFormatter.error('MONTHLY_LIMIT_EXCEEDED', `本月提案數量已達上限 (${monthlyLimit})`, null, 403)
      );
    }

    next();
  } catch (error) {
    console.error('訂閱檢查錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('SUBSCRIPTION_CHECK_FAILED', '訂閱檢查失敗', null, 500)
    );
  }
};

// 提案資料驗證中介軟體
const validateProposalData = (req, res, next) => {
  try {
    const {
      title,
      industry,
      company,
      executiveSummary,
      financial,
      transaction,
      competitiveAdvantages
    } = req.body;

    const errors = [];

    // 基本資料驗證
    if (!title || title.trim().length === 0) {
      errors.push('提案標題不能為空');
    }

    if (!industry) {
      errors.push('必須選擇行業分類');
    }

    // 公司資料驗證
    if (!company || !company.name || company.name.trim().length === 0) {
      errors.push('公司名稱不能為空');
    }

    if (!company || !company.founded || company.founded < 1800) {
      errors.push('請輸入有效的成立年份');
    }

    // 財務資料驗證
    if (!financial || !financial.annualRevenue || financial.annualRevenue.amount <= 0) {
      errors.push('請輸入有效的年收入');
    }

    if (financial && typeof financial.growthRate !== 'number') {
      errors.push('請輸入有效的成長率');
    }

    // 交易資料驗證
    if (!transaction || !transaction.type) {
      errors.push('必須選擇交易類型');
    }

    if (!transaction || !transaction.targetValuation || 
        transaction.targetValuation.min <= 0 || 
        transaction.targetValuation.max <= 0) {
      errors.push('請輸入有效的目標估值');
    }

    if (transaction && transaction.targetValuation && 
        transaction.targetValuation.min >= transaction.targetValuation.max) {
      errors.push('最低估值必須小於最高估值');
    }

    // 競爭優勢驗證
    if (competitiveAdvantages && Array.isArray(competitiveAdvantages)) {
      if (competitiveAdvantages.length === 0) {
        errors.push('請至少填寫一個競爭優勢');
      }
      if (competitiveAdvantages.length > 5) {
        errors.push('競爭優勢最多只能填寫5個');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json(
        ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', errors, 400)
      );
    }

    next();
  } catch (error) {
    console.error('資料驗證錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('VALIDATION_FAILED', '資料驗證失敗', null, 500)
    );
  }
};

module.exports = {
  isProposalOwner,
  canEditProposal,
  canSubmitProposal,
  canReviewProposal,
  canPublishProposal,
  isBuyerTargeted,
  checkSubscriptionForProposal,
  validateProposalData
};