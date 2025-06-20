// server/routes/submissions.js
const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const router = express.Router();

const Proposal = require('../models/Proposal');
const ProposalSubmission = require('../models/ProposalSubmission');
const Comment = require('../models/Comment');
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
// 買方查看和互動
// =========================

// 表達對提案的興趣 (買方專用)
router.post('/proposals/:id/interest',
  rateLimiters.api,
  authenticateToken,
  authorize('buyer'),
  param('id').isMongoId().withMessage('無效的提案ID'),
  [
    body('interestLevel').isIn(['very_high', 'high', 'medium', 'low']).withMessage('請選擇有效的興趣程度'),
    body('comments').optional().isString().isLength({ max: 2000 }).withMessage('評論最多2000字符'),
    body('investmentCapacity.min').optional().isFloat({ min: 0 }).withMessage('最小投資金額必須為正數'),
    body('investmentCapacity.max').optional().isFloat({ min: 0 }).withMessage('最大投資金額必須為正數')
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
      
      if (proposal.status !== 'published') {
        return res.status(400).json(
          ResponseFormatter.error('INVALID_STATUS', '只能對已發布的提案表達興趣', null, 400)
        );
      }
      
      // 檢查是否已有發送記錄
      let submission = await ProposalSubmission.findOne({
        proposalId: proposal._id,
        buyerId: req.user._id
      });
      
      if (!submission) {
        // 創建新的發送記錄
        submission = new ProposalSubmission({
          proposalId: proposal._id,
          buyerId: req.user._id,
          sellerId: proposal.sellerId,
          status: 'interested'
        });
      } else {
        // 更新現有記錄
        submission.status = 'interested';
      }
      
      // 更新反饋資訊
      submission.feedback = {
        interestLevel: req.body.interestLevel,
        comments: req.body.comments,
        investmentCapacity: req.body.investmentCapacity
      };
      
      await submission.save();
      await submission.addInteraction('interest', req.body);
      
      // 更新提案統計
      proposal.statistics.interests += 1;
      await proposal.save();
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'EXPRESS_INTEREST',
        resourceType: 'Proposal',
        resourceId: proposal._id,
        details: {
          proposalTitle: proposal.title,
          interestLevel: req.body.interestLevel
        }
      });
      
      res.json(ResponseFormatter.success(submission, '興趣表達成功'));
      
    } catch (error) {
      console.error('Express interest error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '表達興趣失敗', null, 500)
      );
    }
  }
);

// 獲取買方的提案互動記錄
router.get('/buyer/submissions',
  rateLimiters.api,
  authenticateToken,
  authorize('buyer'),
  [
    query('status').optional().isIn(['sent', 'viewed', 'interested', 'questioned', 'nda_signed', 'detail_requested', 'under_negotiation', 'contact_exchanged', 'deal_closed', 'rejected', 'archived']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const query = { buyerId: req.user._id };
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      const submissions = await ProposalSubmission.find(query)
        .populate('proposalId', 'title summary industry financial')
        .populate('sellerId', 'profile email')
        .sort({ 'timestamps.sentAt': -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await ProposalSubmission.countDocuments(query);
      
      res.json(ResponseFormatter.success({
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '互動記錄獲取成功'));
      
    } catch (error) {
      console.error('Get buyer submissions error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取互動記錄失敗', null, 500)
      );
    }
  }
);

// 獲取提案方的發送記錄
router.get('/seller/submissions',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  [
    query('status').optional().isIn(['sent', 'viewed', 'interested', 'questioned', 'nda_signed', 'detail_requested', 'under_negotiation', 'contact_exchanged', 'deal_closed', 'rejected', 'archived']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const query = { sellerId: req.user._id };
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      const submissions = await ProposalSubmission.find(query)
        .populate('proposalId', 'title summary industry')
        .populate('buyerId', 'profile email')
        .sort({ 'timestamps.sentAt': -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await ProposalSubmission.countDocuments(query);
      
      res.json(ResponseFormatter.success({
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '發送記錄獲取成功'));
      
    } catch (error) {
      console.error('Get seller submissions error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取發送記錄失敗', null, 500)
      );
    }
  }
);

// =========================
// NDA 系統
// =========================

// 簽署 NDA (買方專用)
router.post('/submissions/:id/sign-nda',
  rateLimiters.api,
  authenticateToken,
  authorize('buyer'),
  param('id').isMongoId().withMessage('無效的發送記錄ID'),
  [
    body('agreed').isBoolean().custom(value => {
      if (!value) throw new Error('必須同意 NDA 條款');
      return true;
    }),
    body('digitalSignature').notEmpty().withMessage('數位簽名不能為空')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const submission = await ProposalSubmission.findById(req.params.id);
      
      if (!submission) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '發送記錄不存在', null, 404)
        );
      }
      
      // 檢查權限
      if (submission.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權操作此記錄', null, 403)
        );
      }
      
      // 檢查是否已簽署
      if (submission.nda.signedAt) {
        return res.status(400).json(
          ResponseFormatter.error('ALREADY_SIGNED', 'NDA已經簽署', null, 400)
        );
      }
      
      // 更新 NDA 狀態
      await submission.updateStatus('nda_signed', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        digitalSignature: req.body.digitalSignature
      });
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'SIGN_NDA',
        resourceType: 'ProposalSubmission',
        resourceId: submission._id,
        details: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
      
      res.json(ResponseFormatter.success(submission, 'NDA 簽署成功'));
      
    } catch (error) {
      console.error('Sign NDA error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', 'NDA 簽署失敗', null, 500)
      );
    }
  }
);

// 獲取 NDA 範本
router.get('/nda-template',
  rateLimiters.api,
  authenticateToken,
  async (req, res) => {
    try {
      const ndaTemplate = {
        title: '保密協議 (Non-Disclosure Agreement)',
        content: `
本保密協議（以下簡稱"協議"）由以下雙方簽署：

甲方：提案媒合平台用戶（提案方）
乙方：提案媒合平台用戶（買方）

鑑於甲方擬向乙方揭露某些保密資訊，為保護甲方的合法權益，雙方同意遵守以下條款：

一、保密資訊定義
1. 本協議所稱保密資訊是指甲方透過本平台向乙方揭露的所有商業資訊，包括但不限於：
   - 商業計劃和策略
   - 財務資訊和數據
   - 技術資料和專有技術
   - 客戶資訊和市場數據
   - 營運模式和流程
   - 其他標記為保密的資訊

二、保密義務
1. 乙方承諾對甲方提供的保密資訊嚴格保密
2. 不得向任何第三方洩露保密資訊
3. 不得將保密資訊用於本協議目的以外的用途
4. 採取合理的保護措施防止保密資訊洩露

三、例外情況
以下情況不受本協議約束：
1. 公開可得的資訊
2. 乙方已知的資訊（簽署前）
3. 第三方合法提供的資訊
4. 法律法規要求揭露的資訊

四、協議期限
本協議自簽署之日起生效，有效期為5年。

五、違約責任
如乙方違反本協議，應承擔相應的法律責任，包括但不限於：
1. 停止洩露行為
2. 賠償甲方損失
3. 承擔法律後果

六、爭議解決
因本協議產生的爭議，雙方應首先協商解決；協商不成的，
提交有管轄權的法院解決。

七、其他條款
1. 本協議的修改必須經雙方書面同意
2. 本協議受中華民國法律管轄
3. 本協議為雙方就保密事項的完整約定

甲方（提案方）：________________________
簽署日期：_____________________________

乙方（買方）：__________________________
簽署日期：_____________________________
        `,
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };
      
      res.json(ResponseFormatter.success(ndaTemplate, 'NDA 範本獲取成功'));
      
    } catch (error) {
      console.error('Get NDA template error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取 NDA 範本失敗', null, 500)
      );
    }
  }
);

// =========================
// 評論系統
// =========================

// 添加評論/提問 (買方對提案的評論)
router.post('/submissions/:id/comments',
  rateLimiters.api,
  authenticateToken,
  param('id').isMongoId().withMessage('無效的發送記錄ID'),
  [
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('評論內容必須在1-2000字符之間'),
    body('type').isIn(['question', 'clarification', 'concern', 'interest', 'feedback']).withMessage('請選擇有效的評論類型'),
    body('requiresResponse').optional().isBoolean(),
    body('isPrivate').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const submission = await ProposalSubmission.findById(req.params.id)
        .populate('proposalId', 'title sellerId')
        .populate('buyerId', 'profile email');
      
      if (!submission) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '發送記錄不存在', null, 404)
        );
      }
      
      // 檢查權限 - 只有相關的買方或提案方可以評論
      const canComment = req.user._id.toString() === submission.buyerId._id.toString() ||
                        req.user._id.toString() === submission.sellerId.toString();
      
      if (!canComment) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權在此提案下評論', null, 403)
        );
      }
      
      // 創建評論
      const comment = new Comment({
        submissionId: submission._id,
        authorId: req.user._id,
        content: req.body.content,
        type: req.body.type,
        requiresResponse: req.body.requiresResponse || false,
        isPrivate: req.body.isPrivate || false
      });
      
      await comment.save();
      
      // 更新發送記錄狀態
      if (req.body.type === 'question' && submission.status === 'viewed') {
        await submission.updateStatus('questioned');
      }
      
      // 添加互動記錄
      await submission.addInteraction('question', {
        commentId: comment._id,
        type: req.body.type
      });
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'ADD_COMMENT',
        resourceType: 'ProposalSubmission',
        resourceId: submission._id,
        details: {
          commentType: req.body.type,
          requiresResponse: req.body.requiresResponse
        }
      });
      
      const populatedComment = await Comment.findById(comment._id)
        .populate('authorId', 'profile email role');
      
      res.status(201).json(ResponseFormatter.success(populatedComment, '評論添加成功'));
      
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '添加評論失敗', null, 500)
      );
    }
  }
);

// 獲取評論列表
router.get('/submissions/:id/comments',
  rateLimiters.api,
  authenticateToken,
  param('id').isMongoId().withMessage('無效的發送記錄ID'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const submission = await ProposalSubmission.findById(req.params.id);
      
      if (!submission) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '發送記錄不存在', null, 404)
        );
      }
      
      // 檢查查看權限
      const canView = req.user._id.toString() === submission.buyerId.toString() ||
                     req.user._id.toString() === submission.sellerId.toString() ||
                     req.user.role === 'admin';
      
      if (!canView) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權查看此評論', null, 403)
        );
      }
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 構建查詢條件
      const query = { submissionId: submission._id };
      
      // 非管理員不能看私有評論（除非是自己的）
      if (req.user.role !== 'admin') {
        query.$or = [
          { isPrivate: false },
          { authorId: req.user._id }
        ];
      }
      
      const comments = await Comment.find(query)
        .populate('authorId', 'profile email role')
        .populate('replies')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Comment.countDocuments(query);
      
      // 標記為已讀
      await Comment.updateMany(
        {
          submissionId: submission._id,
          'readBy.userId': { $ne: req.user._id }
        },
        {
          $push: {
            readBy: {
              userId: req.user._id,
              readAt: new Date()
            }
          }
        }
      );
      
      res.json(ResponseFormatter.success({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, '評論列表獲取成功'));
      
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取評論列表失敗', null, 500)
      );
    }
  }
);

// 回覆評論
router.post('/comments/:id/reply',
  rateLimiters.api,
  authenticateToken,
  param('id').isMongoId().withMessage('無效的評論ID'),
  [
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('回覆內容必須在1-2000字符之間')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const parentComment = await Comment.findById(req.params.id)
        .populate('submissionId');
      
      if (!parentComment) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '評論不存在', null, 404)
        );
      }
      
      const submission = parentComment.submissionId;
      
      // 檢查回覆權限
      const canReply = req.user._id.toString() === submission.buyerId.toString() ||
                      req.user._id.toString() === submission.sellerId.toString();
      
      if (!canReply) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權回覆此評論', null, 403)
        );
      }
      
      // 創建回覆
      const reply = new Comment({
        submissionId: submission._id,
        authorId: req.user._id,
        content: req.body.content,
        type: 'feedback',
        parentId: parentComment._id
      });
      
      await reply.save();
      
      // 標記原評論為已回答
      if (parentComment.requiresResponse) {
        parentComment.isAnswered = true;
        await parentComment.save();
      }
      
      const populatedReply = await Comment.findById(reply._id)
        .populate('authorId', 'profile email role');
      
      res.status(201).json(ResponseFormatter.success(populatedReply, '回覆添加成功'));
      
    } catch (error) {
      console.error('Reply comment error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '回覆評論失敗', null, 500)
      );
    }
  }
);

// =========================
// 聯絡資訊交換
// =========================

// 請求交換聯絡資訊 (買方專用)
router.post('/submissions/:id/request-contact',
  rateLimiters.api,
  authenticateToken,
  authorize('buyer'),
  param('id').isMongoId().withMessage('無效的發送記錄ID'),
  [
    body('message').optional().isString().isLength({ max: 500 }).withMessage('訊息最多500字符')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const submission = await ProposalSubmission.findById(req.params.id);
      
      if (!submission) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '發送記錄不存在', null, 404)
        );
      }
      
      // 檢查權限
      if (submission.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權操作此記錄', null, 403)
        );
      }
      
      // 檢查是否已簽署 NDA
      if (!submission.nda.signedAt) {
        return res.status(400).json(
          ResponseFormatter.error('NDA_REQUIRED', '請先簽署 NDA', null, 400)
        );
      }
      
      // 檢查是否已請求過
      if (submission.contactExchange.requestedAt) {
        return res.status(400).json(
          ResponseFormatter.error('ALREADY_REQUESTED', '已請求過聯絡資訊交換', null, 400)
        );
      }
      
      // 更新請求狀態
      submission.contactExchange.requestedAt = new Date();
      await submission.updateStatus('detail_requested');
      
      // 添加互動記錄
      await submission.addInteraction('contact_request', {
        message: req.body.message
      });
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'REQUEST_CONTACT',
        resourceType: 'ProposalSubmission',
        resourceId: submission._id,
        details: {
          message: req.body.message
        }
      });
      
      res.json(ResponseFormatter.success(submission, '聯絡資訊交換請求已發送'));
      
    } catch (error) {
      console.error('Request contact error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '請求聯絡資訊失敗', null, 500)
      );
    }
  }
);

// 批准聯絡資訊交換 (提案方專用)
router.post('/submissions/:id/approve-contact',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  param('id').isMongoId().withMessage('無效的發送記錄ID'),
  [
    body('sellerContact.email').isEmail().withMessage('請提供有效的電子郵件'),
    body('sellerContact.phone').optional().isString(),
    body('sellerContact.company').notEmpty().withMessage('公司名稱不能為空'),
    body('sellerContact.position').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const submission = await ProposalSubmission.findById(req.params.id)
        .populate('buyerId', 'profile email');
      
      if (!submission) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', '發送記錄不存在', null, 404)
        );
      }
      
      // 檢查權限
      if (submission.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(
          ResponseFormatter.error('FORBIDDEN', '無權操作此記錄', null, 403)
        );
      }
      
      // 檢查是否已請求
      if (!submission.contactExchange.requestedAt) {
        return res.status(400).json(
          ResponseFormatter.error('NO_REQUEST', '買方尚未請求聯絡資訊交換', null, 400)
        );
      }
      
      // 檢查是否已批准過
      if (submission.contactExchange.approvedAt) {
        return res.status(400).json(
          ResponseFormatter.error('ALREADY_APPROVED', '已批准過聯絡資訊交換', null, 400)
        );
      }
      
      // 設定聯絡資訊
      submission.contactExchange.exchangedContacts = {
        buyerContact: {
          email: submission.buyerId.email,
          company: submission.buyerId.profile?.company,
          phone: submission.buyerId.profile?.contactInfo?.phone,
          position: submission.buyerId.profile?.position
        },
        sellerContact: req.body.sellerContact
      };
      
      await submission.updateStatus('contact_exchanged', {
        approvedBy: req.user._id
      });
      
      // 記錄操作日誌
      await AuditLog.create({
        userId: req.user._id,
        action: 'APPROVE_CONTACT',
        resourceType: 'ProposalSubmission',
        resourceId: submission._id
      });
      
      res.json(ResponseFormatter.success(submission, '聯絡資訊交換已批准'));
      
    } catch (error) {
      console.error('Approve contact error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '批准聯絡資訊交換失敗', null, 500)
      );
    }
  }
);

// =========================
// 統計和分析
// =========================

// 獲取發送記錄統計 (提案方專用)
router.get('/seller/analytics',
  rateLimiters.api,
  authenticateToken,
  authorize('seller'),
  async (req, res) => {
    try {
      // 基本統計
      const totalSubmissions = await ProposalSubmission.countDocuments({ sellerId: req.user._id });
      const activeSubmissions = await ProposalSubmission.countDocuments({ 
        sellerId: req.user._id, 
        status: { $in: ['interested', 'questioned', 'nda_signed', 'detail_requested', 'under_negotiation'] }
      });
      const closedDeals = await ProposalSubmission.countDocuments({ 
        sellerId: req.user._id, 
        status: 'deal_closed' 
      });
      
      // 狀態分布
      const statusDistribution = await ProposalSubmission.getAnalytics({ 
        sellerId: req.user._id 
      });
      
      // 平均參與度
      const engagementStats = await ProposalSubmission.aggregate([
        { $match: { sellerId: req.user._id } },
        {
          $group: {
            _id: null,
            avgEngagement: { $avg: '$statistics.engagementScore' },
            avgResponseTime: { $avg: '$statistics.responseTime' },
            totalViews: { $sum: '$statistics.viewCount' },
            totalDownloads: { $sum: '$statistics.downloadCount' }
          }
        }
      ]);
      
      const analytics = {
        overview: {
          totalSubmissions,
          activeSubmissions,
          closedDeals,
          conversionRate: totalSubmissions > 0 ? (closedDeals / totalSubmissions * 100).toFixed(2) : 0
        },
        statusDistribution,
        engagement: engagementStats[0] || {
          avgEngagement: 0,
          avgResponseTime: 0,
          totalViews: 0,
          totalDownloads: 0
        }
      };
      
      res.json(ResponseFormatter.success(analytics, '統計資料獲取成功'));
      
    } catch (error) {
      console.error('Get seller analytics error:', error);
      res.status(500).json(
        ResponseFormatter.error('SERVER_ERROR', '獲取統計資料失敗', null, 500)
      );
    }
  }
);

module.exports = router;