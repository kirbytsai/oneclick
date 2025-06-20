// server/routes/proposals.js
const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const router = express.Router();

const Proposal = require('../models/Proposal');
const ProposalSubmission = require('../models/ProposalSubmission');
const { authenticateToken, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const ResponseFormatter = require('../utils/response');
const AuditLog = require('../models/AuditLog');

// 輸入驗證中介軟體
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      ResponseFormatter.error('VALIDATION_ERROR', '輸入資料有誤', errors.array(), 400)
    );
  }
  next();
};

// =========================
// 提案 CRUD 操作
// =========================

// 創建提案 (提案方專用)
router.post('/',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('標題長度必須在5-200字符之間'),
    body('industry').isIn([
      'IT', 'Manufacturing', 'Finance', 'Healthcare', 'Education',
      'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Logistics',
      'Energy', 'Entertainment', 'Food & Beverage', 'Automotive', 'Other'
    ]).withMessage('請選擇有效的行業分類'),
    body('summary').trim().isLength({ min: 10, max: 1000 }).withMessage('摘要長度必須在10-1000字符之間'),
    body('description').trim().isLength({ min: 50, max: 10000 }).withMessage('描述長度必須在50-10000字符之間'),
    body('targetMarket').trim().isLength({ min: 10, max: 1000 }).withMessage('目標市場描述必須在10-1000字符之間'),
    body('financial.investmentRequired.amount').isFloat({ min: 0 }).withMessage('投資金額必須為正數'),
    body('maInfo.dealType').isIn(['acquisition', 'merger', 'partnership', 'investment', 'joint_venture']).withMessage('請選擇有效的交易類型')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposalData = {
        ...req.body,
        sellerId: req.user._id,
        status: 'draft'
      };
      
      const proposal = new Proposal(proposalData);
      await proposal.save();
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'CREATE_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title,
          industry: proposal.industry
        }
      });
      
      res.status(201).json(
        ResponseFormatter.success(proposal, '提案創建成功')
      );
      
    } catch (error) {
      console.error('Create proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '創建提案失敗', null, 500)
      );
    }
  }
);

// 獲取提案列表
router.get('/',
  rateLimiters.api,
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('頁碼必須為正整數'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每頁數量必須在1-100之間'),
    query('status').optional().isIn(['draft', 'pending_review', 'approved', 'rejected', 'published', 'archived']),
    query('industry').optional().isString(),
    query('search').optional().isString().isLength({ max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // 構建查詢條件
      let query = {};
      
      // 根據用戶角色過濾
      if (req.user.role === 'seller') {
        query.sellerId = req.user._id;
      } else if (req.user.role === 'buyer') {
        query.status = 'published';
        query['visibility.isPublic'] = true;
      }
      // admin 可以看到所有提案
      
      // 狀態過濾
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 行業過濾
      if (req.query.industry) {
        query.industry = req.query.industry;
      }
      
      // 搜索功能
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }
      
      // 執行查詢
      const proposals = await Proposal.find(query)
        .populate('sellerId', 'profile email')
        .select('-description') // 列表不包含詳細描述
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Proposal.countDocuments(query);
      
      res.json(ResponseFormatter.success({
        proposals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '提案列表獲取成功'));
      
    } catch (error) {
      console.error('Get proposals error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取提案列表失敗', null, 500)
      );
    }
  }
);
// 獲取單個提案詳情 - 修復版
router.get('/:id',
  rateLimiters.api,
  authenticateToken,
  param('id').isMongoId().withMessage('無效的提案ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id)
        .populate('sellerId', 'profile email contactInfo');
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      // 修復後的權限檢查邏輯
      let canView = false;
      
      // 管理員可以查看所有提案
      if (req.user.role === 'admin') {
        canView = true;
      }
      // 提案方可以查看自己的提案 - 修復 ObjectId 比較
      else if (proposal.sellerId) {
        // 處理 populate 後的情況 (sellerId 是對象)
        if (proposal.sellerId._id && proposal.sellerId._id.toString() === req.user._id.toString()) {
          canView = true;
        }
        // 處理未 populate 的情況 (sellerId 是 ObjectId)
        else if (proposal.sellerId.toString() === req.user._id.toString()) {
          canView = true;
        }
      }
      // 已發布的提案買方可以查看
      if (!canView && proposal.status === 'published' && req.user.role === 'buyer') {
        if (proposal.visibility.isPublic) {
          canView = true;
        } else if (proposal.visibility.allowedBuyers.includes(req.user._id)) {
          canView = true;
        }
      }
      
      if (!canView) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權查看此提案', null, 403)
        );
      }
      
      // 如果是買方查看，記錄瀏覽
      if (req.user.role === 'buyer' && proposal.status === 'published') {
        proposal.statistics.views += 1;
        await proposal.save();
        
        // 檢查是否已有發送記錄
        let submission = await ProposalSubmission.findOne({
          proposalId: proposal._id,
          buyerId: req.user._id
        });
        
        if (submission) {
          await submission.addInteraction('view');
        }
      }
      
      res.json(ResponseFormatter.success(proposal, '提案詳情獲取成功'));
      
    } catch (error) {
      console.error('Get proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取提案詳情失敗', null, 500)
      );
    }
  }
);

// 更新提案 (提案方專用)
router.put('/:id',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  param('id').isMongoId().withMessage('無效的提案ID'),
  [
    body('title').optional().trim().isLength({ min: 5, max: 200 }),
    body('industry').optional().isIn(['IT', 'Manufacturing', 'Finance', 'Healthcare', 'Education', 'Retail', 'Real Estate', 'Consulting', 'Marketing', 'Logistics', 'Energy', 'Entertainment', 'Food & Beverage', 'Automotive', 'Other']),
    body('summary').optional().trim().isLength({ min: 10, max: 1000 }),
    body('description').optional().trim().isLength({ min: 50, max: 10000 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id);
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      // 檢查所有權
      if (proposal.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權修改此提案', null, 403)
        );
      }
      
      // 檢查是否可以編輯
      if (!['draft', 'rejected'].includes(proposal.status)) {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '當前狀態下無法編輯提案', null, 400)
        );
      }
      
      // 更新提案
      Object.assign(proposal, req.body);
      await proposal.save();
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'UPDATE_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title,
          updatedFields: Object.keys(req.body)
        }
      });
      
      res.json(ResponseFormatter.success(proposal, '提案更新成功'));
      
    } catch (error) {
      console.error('Update proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '更新提案失敗', null, 500)
      );
    }
  }
);

// 刪除提案 (提案方專用)
router.delete('/:id',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  param('id').isMongoId().withMessage('無效的提案ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id);
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      // 檢查所有權
      if (proposal.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權刪除此提案', null, 403)
        );
      }
      
      // 只有草稿狀態才能刪除
      if (proposal.status !== 'draft') {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '只有草稿狀態的提案才能刪除', null, 400)
        );
      }
      
      await Proposal.findByIdAndDelete(req.params.id);
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'DELETE_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title
        }
      });
      
      res.json(ResponseFormatter.success(null, '提案刪除成功'));
      
    } catch (error) {
      console.error('Delete proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '刪除提案失敗', null, 500)
      );
    }
  }
);

// =========================
// 提案狀態管理
// =========================

// 提交審核 (提案方專用)
router.post('/:id/submit',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  param('id').isMongoId().withMessage('無效的提案ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id);
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      // 檢查所有權
      if (proposal.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權操作此提案', null, 403)
        );
      }
      
      // 檢查當前狀態
      if (!['draft', 'rejected'].includes(proposal.status)) {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '當前狀態下無法提交審核', null, 400)
        );
      }
      
      // 驗證提案完整性
      const requiredFields = ['title', 'summary', 'description', 'targetMarket', 'financial.investmentRequired.amount', 'maInfo.dealType'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], proposal);
        if (!value) missingFields.push(field);
      });
      
      if (missingFields.length > 0) {
        return res.status(400).json(
          ResponseFormatter.error('INCOMPLETE_PROPOSAL', '提案資訊不完整', { missingFields }, 400)
        );
      }
      
      await proposal.updateStatus('pending_review');
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'SUBMIT_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title
        }
      });
      
      res.json(ResponseFormatter.success(proposal, '提案已提交審核'));
      
    } catch (error) {
      console.error('Submit proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '提交審核失敗', null, 500)
      );
    }
  }
);

// =========================
// 管理員審核功能
// =========================

// 獲取待審核提案列表 (管理員專用)
router.get('/admin/pending',
  rateLimiters.api,
  authenticateToken,
  authorize('admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const proposals = await Proposal.find({ status: 'pending_review' })
        .populate('sellerId', 'profile email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Proposal.countDocuments({ status: 'pending_review' });
      
      res.json(ResponseFormatter.success({
        proposals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '待審核提案列表獲取成功'));
      
    } catch (error) {
      console.error('Get pending proposals error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取待審核提案失敗', null, 500)
      );
    }
  }
);

// 審核提案 (管理員專用)
router.post('/:id/review',
  rateLimiters.api,
  authenticateToken,
  authorize('admin'),
  param('id').isMongoId().withMessage('無效的提案ID'),
  [
    body('action').isIn(['approve', 'reject']).withMessage('審核動作必須是 approve 或 reject'),
    body('comments').optional().isString().isLength({ max: 1000 }).withMessage('審核意見最多1000字符'),
    body('rejectionReason').if(body('action').equals('reject')).notEmpty().withMessage('拒絕時必須提供原因')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id);
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      if (proposal.status !== 'pending_review') {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '提案不在待審核狀態', null, 400)
        );
      }
      
      const { action, comments, rejectionReason } = req.body;
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      await proposal.updateStatus(newStatus, {
        reviewedBy: req.user._id,
        reviewComments: comments,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      });
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: action === 'approve' ? 'APPROVE_PROPOSAL' : 'REJECT_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title,
          comments,
          rejectionReason
        }
      });
      
      res.json(ResponseFormatter.success(proposal, `提案已${action === 'approve' ? '通過' : '拒絕'}審核`));
      
    } catch (error) {
      console.error('Review proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '審核提案失敗', null, 500)
      );
    }
  }
);

// 發布提案 (管理員或提案方)
router.post('/:id/publish',
  rateLimiters.api,
  authenticateToken,
  param('id').isMongoId().withMessage('無效的提案ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const proposal = await Proposal.findById(req.params.id);
      
      if (!proposal) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
        );
      }
      
      // 檢查權限
      const canPublish = req.user.role === 'admin' || 
        (req.user.role === 'seller' && proposal.sellerId.toString() === req.user._id.toString());
      
      if (!canPublish) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權發布此提案', null, 403)
        );
      }
      
      // 檢查狀態
      if (proposal.status !== 'approved') {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '只有已審核通過的提案才能發布', null, 400)
        );
      }
      
      await proposal.updateStatus('published');
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'PUBLISH_PROPOSAL',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          title: proposal.title
        }
      });
      
      res.json(ResponseFormatter.success(proposal, '提案已發布'));
      
    } catch (error) {
      console.error('Publish proposal error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '發布提案失敗', null, 500)
      );
    }
  }
);

// =========================
// 搜索和篩選功能
// =========================

// 高級搜索
router.post('/search',
  rateLimiters.api,
  authenticateToken,
  [
    body('query').optional().isString().isLength({ max: 100 }),
    body('filters.industry').optional().isArray(),
    body('filters.dealType').optional().isArray(),
    body('filters.investmentRange.min').optional().isFloat({ min: 0 }),
    body('filters.investmentRange.max').optional().isFloat({ min: 0 }),
    body('filters.tags').optional().isArray(),
    body('sort').optional().isIn(['newest', 'oldest', 'investment_asc', 'investment_desc', 'relevance']),
    body('page').optional().isInt({ min: 1 }),
    body('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        query: searchQuery,
        filters = {},
        sort = 'newest',
        page = 1,
        limit = 10
      } = req.body;
      
      const skip = (page - 1) * limit;
      
      // 構建查詢條件
      let mongoQuery = {};
      
      // 基礎權限過濾
      if (req.user.role === 'buyer') {
        mongoQuery.status = 'published';
        mongoQuery['visibility.isPublic'] = true;
      } else if (req.user.role === 'seller') {
        mongoQuery.sellerId = req.user._id;
      }
      
      // 文本搜索
      if (searchQuery) {
        mongoQuery.$text = { $search: searchQuery };
      }
      
      // 行業過濾
      if (filters.industry && filters.industry.length > 0) {
        mongoQuery.industry = { $in: filters.industry };
      }
      
      // 交易類型過濾
      if (filters.dealType && filters.dealType.length > 0) {
        mongoQuery['maInfo.dealType'] = { $in: filters.dealType };
      }
      
      // 投資金額範圍
      if (filters.investmentRange) {
        const investmentFilter = {};
        if (filters.investmentRange.min) {
          investmentFilter.$gte = filters.investmentRange.min;
        }
        if (filters.investmentRange.max) {
          investmentFilter.$lte = filters.investmentRange.max;
        }
        if (Object.keys(investmentFilter).length > 0) {
          mongoQuery['financial.investmentRequired.amount'] = investmentFilter;
        }
      }
      
      // 標籤過濾
      if (filters.tags && filters.tags.length > 0) {
        mongoQuery.tags = { $in: filters.tags };
      }
      
      // 構建排序
      let sortQuery = {};
      switch (sort) {
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'investment_asc':
          sortQuery = { 'financial.investmentRequired.amount': 1 };
          break;
        case 'investment_desc':
          sortQuery = { 'financial.investmentRequired.amount': -1 };
          break;
        case 'relevance':
          if (searchQuery) {
            sortQuery = { score: { $meta: 'textScore' } };
          } else {
            sortQuery = { createdAt: -1 };
          }
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
      
      // 執行查詢
      const proposals = await Proposal.find(mongoQuery)
        .populate('sellerId', 'profile email')
        .select(req.user.role === 'buyer' ? '-description' : '')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
      
      const total = await Proposal.countDocuments(mongoQuery);
      
      res.json(ResponseFormatter.success({
        proposals,
        searchQuery,
        filters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '搜索完成'));
      
    } catch (error) {
      console.error('Search proposals error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '搜索失敗', null, 500)
      );
    }
  }
);

// 獲取搜索過濾選項
router.get('/search/filters',
  rateLimiters.api,
  authenticateToken,
  async (req, res) => {
    try {
      // 獲取所有可用的行業選項
      const industries = await Proposal.distinct('industry', 
        req.user.role === 'buyer' ? { status: 'published' } : {}
      );
      
      // 獲取所有可用的交易類型
      const dealTypes = await Proposal.distinct('maInfo.dealType',
        req.user.role === 'buyer' ? { status: 'published' } : {}
      );
      
      // 獲取投資金額範圍
      const investmentStats = await Proposal.aggregate([
        ...(req.user.role === 'buyer' ? [{ $match: { status: 'published' } }] : []),
        {
          $group: {
            _id: null,
            minInvestment: { $min: '$financial.investmentRequired.amount' },
            maxInvestment: { $max: '$financial.investmentRequired.amount' },
            avgInvestment: { $avg: '$financial.investmentRequired.amount' }
          }
        }
      ]);
      
      // 獲取熱門標籤
      const popularTags = await Proposal.aggregate([
        ...(req.user.role === 'buyer' ? [{ $match: { status: 'published' } }] : []),
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);
      
      const filterOptions = {
        industries: industries.sort(),
        dealTypes: dealTypes.sort(),
        investmentRange: investmentStats[0] || { minInvestment: 0, maxInvestment: 0, avgInvestment: 0 },
        popularTags: popularTags.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      };
      
      res.json(ResponseFormatter.success(filterOptions, '搜索過濾選項獲取成功'));
      
    } catch (error) {
      console.error('Get filter options error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取過濾選項失敗', null, 500)
      );
    }
  }
);

module.exports = router;