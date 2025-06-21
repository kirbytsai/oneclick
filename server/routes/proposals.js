// server/routes/proposals.js
const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const ResponseFormatter = require('../utils/response');
const rateLimit = require('express-rate-limit');

// Rate limiting for proposal creation
const createProposalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 proposals per 15 minutes
  message: ResponseFormatter.error('RATE_LIMIT', '提案創建頻率過高，請稍後再試', null, 429)
});

// ===========================================
// 基本 CRUD 操作
// ===========================================

// 創建提案
router.post('/', authenticateToken, authorize('seller'), createProposalLimit, async (req, res) => {
  try {
    const proposalData = {
      ...req.body,
      creator: req.user._id,
      status: 'draft'
    };

    // 自動生成標籤
    const autoTags = [
      req.body.industry,
      req.body.transaction?.type,
      req.body.company?.location
    ].filter(Boolean);

    proposalData.tags = [...new Set([...autoTags, ...(req.body.tags || [])])];

    const proposal = new Proposal(proposalData);
    await proposal.save();

    await proposal.populate('creator', 'email firstName lastName');

    res.status(201).json(
      ResponseFormatter.success(proposal, '提案創建成功', 201)
    );
  } catch (error) {
    console.error('創建提案錯誤:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(
        ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', messages, 400)
      );
    }

    res.status(500).json(
      ResponseFormatter.error('CREATE_FAILED', '提案創建失敗', null, 500)
    );
  }
});

// 獲取提案列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      industry,
      creator,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 構建查詢條件
    const query = {};

    // 根據用戶角色限制查詢範圍
    if (req.user.role === 'seller') {
      query.creator = req.user._id;
    } else if (req.user.role === 'buyer') {
      // 買方只能看到已發佈的提案或發送給自己的提案
      query.$or = [
        { status: 'published' },
        { 'targetBuyers.buyerId': req.user._id }
      ];
    }
    // 管理員可以看到所有提案

    // 狀態篩選
    if (status) {
      query.status = status;
    }

    // 行業篩選
    if (industry) {
      query.industry = industry;
    }

    // 創建者篩選（僅管理員）
    if (creator && req.user.role === 'admin') {
      query.creator = creator;
    }

    // 關鍵字搜尋
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { 'company.description': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 排序設定
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 分頁計算
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 執行查詢
    const proposals = await Proposal.find(query)
      .populate('creator', 'email firstName lastName')
      .populate('targetBuyers.buyerId', 'email firstName lastName')
      .populate('review.reviewedBy', 'email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    // 分頁資訊
    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: skip + proposals.length < total,
      hasPrevPage: parseInt(page) > 1
    };

    res.json(
      ResponseFormatter.success({
        proposals,
        pagination
      }, '提案列表獲取成功')
    );
  } catch (error) {
    console.error('獲取提案列表錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('FETCH_FAILED', '獲取提案列表失敗', null, 500)
    );
  }
});

// 獲取單個提案
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('creator', 'email firstName lastName')
      .populate('targetBuyers.buyerId', 'email firstName lastName')
      .populate('review.reviewedBy', 'email firstName lastName');

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    // 修復權限檢查邏輯
    let canView = false;

    // 管理員可以查看所有提案
    if (req.user.role === 'admin') {
      canView = true;
    }
    // 檢查是否為提案創建者 - 處理 populate 的情況
    else if (proposal.creator) {
      // 如果 creator 被 populate 了（是物件）
      if (proposal.creator._id) {
        canView = proposal.creator._id.toString() === req.user._id.toString();
      }
      // 如果 creator 沒有被 populate（是 ObjectId）
      else {
        canView = proposal.creator.toString() === req.user._id.toString();
      }
    }
    // 買方權限檢查
    else if (req.user.role === 'buyer') {
      if (proposal.status === 'published') {
        canView = true;
      } else {
        // 檢查是否為目標買方
        canView = proposal.targetBuyers.some(tb => {
          if (tb.buyerId && tb.buyerId._id) {
            return tb.buyerId._id.toString() === req.user._id.toString();
          } else if (tb.buyerId) {
            return tb.buyerId.toString() === req.user._id.toString();
          }
          return false;
        });
      }
    }

    if (!canView) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '無權限查看此提案', null, 403)
      );
    }

    // 如果是買方查看，記錄查看狀態
    if (req.user.role === 'buyer') {
      const buyerRecord = proposal.targetBuyers.find(tb => {
        if (tb.buyerId && tb.buyerId._id) {
          return tb.buyerId._id.toString() === req.user._id.toString();
        } else if (tb.buyerId) {
          return tb.buyerId.toString() === req.user._id.toString();
        }
        return false;
      });
      
      if (buyerRecord && buyerRecord.status === 'sent') {
        buyerRecord.status = 'viewed';
        await proposal.save();
      }
    }

    res.json(
      ResponseFormatter.success(proposal, '提案詳情獲取成功')
    );
  } catch (error) {
    console.error('獲取提案詳情錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('FETCH_FAILED', '獲取提案詳情失敗', null, 500)
    );
  }
});

// 更新提案
router.put('/:id', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    // 權限檢查：只有創建者可以修改
    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以修改', null, 403)
      );
    }

    // 狀態檢查：只有草稿和已拒絕的提案可以修改
    if (!proposal.canEdit()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '當前狀態不允許修改', null, 400)
      );
    }

    // 更新資料
    Object.assign(proposal, req.body);
    
    // 如果是從拒絕狀態修改，重置為草稿
    if (proposal.status === 'rejected') {
      proposal.status = 'draft';
      proposal.review = {};
    }

    await proposal.save();
    await proposal.populate('creator', 'email firstName lastName');

    res.json(
      ResponseFormatter.success(proposal, '提案更新成功')
    );
  } catch (error) {
    console.error('更新提案錯誤:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(
        ResponseFormatter.error('VALIDATION_ERROR', '資料驗證失敗', messages, 400)
      );
    }

    res.status(500).json(
      ResponseFormatter.error('UPDATE_FAILED', '提案更新失敗', null, 500)
    );
  }
});

// 刪除提案（僅草稿）
router.delete('/:id', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    // 權限檢查
    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以刪除', null, 403)
      );
    }

    // 只能刪除草稿狀態的提案
    if (proposal.status !== 'draft') {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '只能刪除草稿狀態的提案', null, 400)
      );
    }

    await Proposal.findByIdAndDelete(req.params.id);

    res.json(
      ResponseFormatter.success(null, '提案刪除成功')
    );
  } catch (error) {
    console.error('刪除提案錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('DELETE_FAILED', '提案刪除失敗', null, 500)
    );
  }
});

// ===========================================
// 狀態管理操作
// ===========================================

// 提交審核
router.post('/:id/submit', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以提交審核', null, 403)
      );
    }

    if (!proposal.canSubmit()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '當前狀態不允許提交審核', null, 400)
      );
    }

    proposal.status = 'pending_review';
    proposal.submittedAt = new Date();
    await proposal.save();

    res.json(
      ResponseFormatter.success(proposal, '提案已提交審核')
    );
  } catch (error) {
    console.error('提交審核錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('SUBMIT_FAILED', '提交審核失敗', null, 500)
    );
  }
});

// 管理員審核（核准）
router.post('/:id/approve', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { comments } = req.body;
    const proposal = await Proposal.findById(req.params.id);

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

    proposal.status = 'approved';
    proposal.approvedAt = new Date();
    proposal.review = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      comments: comments || '',
      action: 'approved'
    };

    await proposal.save();
    await proposal.populate('creator', 'email firstName lastName');

    res.json(
      ResponseFormatter.success(proposal, '提案審核通過')
    );
  } catch (error) {
    console.error('審核通過錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('APPROVE_FAILED', '審核通過失敗', null, 500)
    );
  }
});

// 管理員審核（拒絕）
router.post('/:id/reject', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { comments } = req.body;
    const proposal = await Proposal.findById(req.params.id);

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

    proposal.status = 'rejected';
    proposal.review = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      comments: comments || '',
      action: 'rejected'
    };

    await proposal.save();
    await proposal.populate('creator', 'email firstName lastName');

    res.json(
      ResponseFormatter.success(proposal, '提案已拒絕')
    );
  } catch (error) {
    console.error('審核拒絕錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('REJECT_FAILED', '審核拒絕失敗', null, 500)
    );
  }
});

// 發送給買方
router.post('/:id/send-to-buyers', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const { buyerIds } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以發送', null, 403)
      );
    }

    if (!proposal.canPublish()) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '只能發送已核准的提案', null, 400)
      );
    }

    // 驗證買方存在且為買方角色
    const buyers = await User.find({
      _id: { $in: buyerIds },
      role: 'buyer',
      isActive: true
    });

    if (buyers.length !== buyerIds.length) {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_BUYERS', '部分買方不存在或無效', null, 400)
      );
    }

    // 添加目標買方
    buyerIds.forEach(buyerId => {
      const existingBuyer = proposal.targetBuyers.find(
        tb => tb.buyerId.toString() === buyerId.toString()
      );
      
      if (!existingBuyer) {
        proposal.targetBuyers.push({
          buyerId,
          sentAt: new Date(),
          status: 'sent'
        });
      }
    });

    proposal.status = 'published';
    proposal.publishedAt = new Date();
    await proposal.save();

    res.json(
      ResponseFormatter.success(proposal, `提案已發送給 ${buyerIds.length} 位買方`)
    );
  } catch (error) {
    console.error('發送提案錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('SEND_FAILED', '發送提案失敗', null, 500)
    );
  }
});

// ===========================================
// 買方互動操作
// ===========================================

// 買方回應提案
router.post('/:id/respond', authenticateToken, authorize('buyer'), async (req, res) => {
  try {
    const { status, response } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    // 檢查買方是否為目標買方
    const buyerRecord = proposal.targetBuyers.find(
      tb => tb.buyerId.toString() === req.user._id.toString()
    );

    if (!buyerRecord) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '您不是此提案的目標買方', null, 403)
      );
    }

    // 更新買方回應
    buyerRecord.status = status;
    buyerRecord.response = response || '';
    buyerRecord.responseAt = new Date();

    await proposal.save();

    res.json(
      ResponseFormatter.success(buyerRecord, '回應已記錄')
    );
  } catch (error) {
    console.error('買方回應錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('RESPOND_FAILED', '回應失敗', null, 500)
    );
  }
});

// 獲取買方收到的提案
router.get('/received/inbox', authenticateToken, authorize('buyer'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      industry,
      sortBy = 'sentAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      'targetBuyers.buyerId': req.user._id
    };

    if (status) {
      query['targetBuyers.status'] = status;
    }

    if (industry) {
      query.industry = industry;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[`targetBuyers.${sortBy}`] = sortOrder === 'desc' ? -1 : 1;

    const proposals = await Proposal.find(query)
      .populate('creator', 'email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // 過濾出當前買方的記錄
    const formattedProposals = proposals.map(proposal => {
      const buyerRecord = proposal.targetBuyers.find(
        tb => tb.buyerId.toString() === req.user._id.toString()
      );
      
      return {
        ...proposal.toObject(),
        buyerStatus: buyerRecord?.status,
        sentAt: buyerRecord?.sentAt,
        responseAt: buyerRecord?.responseAt,
        myResponse: buyerRecord?.response
      };
    });

    const total = await Proposal.countDocuments(query);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: skip + proposals.length < total,
      hasPrevPage: parseInt(page) > 1
    };

    res.json(
      ResponseFormatter.success({
        proposals: formattedProposals,
        pagination
      }, '收件箱獲取成功')
    );
  } catch (error) {
    console.error('獲取收件箱錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('FETCH_FAILED', '獲取收件箱失敗', null, 500)
    );
  }
});

// ===========================================
// 刪除申請功能
// ===========================================

// 申請刪除提案
router.post('/:id/request-delete', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const { reason } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.isOwner(req.user._id)) {
      return res.status(403).json(
        ResponseFormatter.error('ACCESS_DENIED', '只有提案創建者可以申請刪除', null, 403)
      );
    }

    if (proposal.status !== 'published') {
      return res.status(400).json(
        ResponseFormatter.error('INVALID_STATUS', '只能申請刪除已發佈的提案', null, 400)
      );
    }

    if (proposal.deleteRequest.requested) {
      return res.status(400).json(
        ResponseFormatter.error('ALREADY_REQUESTED', '已經申請過刪除', null, 400)
      );
    }

    proposal.deleteRequest = {
      requested: true,
      requestedAt: new Date(),
      reason: reason || ''
    };

    await proposal.save();

    res.json(
      ResponseFormatter.success(proposal.deleteRequest, '刪除申請已提交')
    );
  } catch (error) {
    console.error('申請刪除錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('REQUEST_FAILED', '申請刪除失敗', null, 500)
    );
  }
});

// 管理員處理刪除申請
router.post('/:id/approve-delete', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json(
        ResponseFormatter.error('NOT_FOUND', '提案不存在', null, 404)
      );
    }

    if (!proposal.deleteRequest.requested) {
      return res.status(400).json(
        ResponseFormatter.error('NO_REQUEST', '沒有刪除申請', null, 400)
      );
    }

    proposal.deleteRequest.approvedBy = req.user._id;
    proposal.deleteRequest.deletedAt = new Date();
    await proposal.save();

    // 實際刪除提案
    await Proposal.findByIdAndDelete(req.params.id);

    res.json(
      ResponseFormatter.success(null, '提案刪除申請已核准並執行')
    );
  } catch (error) {
    console.error('核准刪除錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('APPROVE_DELETE_FAILED', '核准刪除失敗', null, 500)
    );
  }
});

// ===========================================
// 搜尋與工具功能
// ===========================================

// 搜尋提案
router.get('/search/advanced', authenticateToken, async (req, res) => {
  try {
    const {
      keyword,
      industry,
      transactionType,
      valuationMin,
      valuationMax,
      revenueMin,
      revenueMax,
      growthRateMin,
      growthRateMax,
      employeeRange,
      location,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // 角色權限限制
    if (req.user.role === 'buyer') {
      query.status = 'published';
    } else if (req.user.role === 'seller') {
      query.creator = req.user._id;
    }

    // 關鍵字搜尋
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { 'company.name': { $regex: keyword, $options: 'i' } },
        { 'company.description': { $regex: keyword, $options: 'i' } },
        { executiveSummary: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // 行業篩選
    if (industry) {
      query.industry = industry;
    }

    // 交易類型篩選
    if (transactionType) {
      query['transaction.type'] = transactionType;
    }

    // 估值範圍篩選
    if (valuationMin || valuationMax) {
      query['transaction.targetValuation.min'] = {};
      if (valuationMin) {
        query['transaction.targetValuation.min'].$gte = parseInt(valuationMin);
      }
      if (valuationMax) {
        query['transaction.targetValuation.max'] = { $lte: parseInt(valuationMax) };
      }
    }

    // 營收範圍篩選
    if (revenueMin || revenueMax) {
      query['financial.annualRevenue.amount'] = {};
      if (revenueMin) {
        query['financial.annualRevenue.amount'].$gte = parseInt(revenueMin);
      }
      if (revenueMax) {
        query['financial.annualRevenue.amount'].$lte = parseInt(revenueMax);
      }
    }

    // 成長率篩選
    if (growthRateMin || growthRateMax) {
      query['financial.growthRate'] = {};
      if (growthRateMin) {
        query['financial.growthRate'].$gte = parseFloat(growthRateMin);
      }
      if (growthRateMax) {
        query['financial.growthRate'].$lte = parseFloat(growthRateMax);
      }
    }

    // 員工規模篩選
    if (employeeRange) {
      query['company.employees'] = employeeRange;
    }

    // 地點篩選
    if (location) {
      query['company.location'] = { $regex: location, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const proposals = await Proposal.find(query)
      .populate('creator', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: skip + proposals.length < total,
      hasPrevPage: parseInt(page) > 1
    };

    res.json(
      ResponseFormatter.success({
        proposals,
        pagination,
        searchCriteria: req.query
      }, '搜尋完成')
    );
  } catch (error) {
    console.error('搜尋錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('SEARCH_FAILED', '搜尋失敗', null, 500)
    );
  }
});

// 獲取買方列表（用於選擇目標買方）
router.get('/buyers/list', authenticateToken, authorize('seller'), async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    const query = {
      role: 'buyer',
      isActive: true
    };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const buyers = await User.find(query)
      .select('email firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: skip + buyers.length < total,
      hasPrevPage: parseInt(page) > 1
    };

    res.json(
      ResponseFormatter.success({
        buyers,
        pagination
      }, '買方列表獲取成功')
    );
  } catch (error) {
    console.error('獲取買方列表錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('FETCH_FAILED', '獲取買方列表失敗', null, 500)
    );
  }
});

// 獲取選項資料（用於前端表單）
router.get('/options/all', (req, res) => {
  try {
    const options = {
      industries: Proposal.getIndustries(),
      employeeRanges: Proposal.getEmployeeRanges(),
      transactionTypes: Proposal.getTransactionTypes(),
      valuationRanges: Proposal.getValuationRanges(),
      statusOptions: Proposal.getStatusOptions()
    };

    res.json(
      ResponseFormatter.success(options, '選項資料獲取成功')
    );
  } catch (error) {
    console.error('獲取選項資料錯誤:', error);
    res.status(500).json(
      ResponseFormatter.error('FETCH_FAILED', '獲取選項資料失敗', null, 500)
    );
  }
});

module.exports = router;