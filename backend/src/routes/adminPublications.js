import express from 'express';
import axios from 'axios';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import {
  listReviews,
  getReviewById,
  startReview,
  approveReview,
  rejectReview,
  returnReview,
  markCallbackSent,
  getStats,
} from '../repositories/publicationReviewsRepository.js';

export const adminPublicationsRouter = express.Router();

/** API Key 校验（与现有 admin.js 保持一致） */
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key === config.mainCenterApiKey) { next(); return; }
  const auth = req.headers['authorization'];
  if (auth === `Bearer ${config.mainCenterApiKey}`) { next(); return; }
  res.status(401).json({ error: '未授权' });
}

adminPublicationsRouter.use(requireAdminKey);

/** 提取分中心管理员 ID（前端登录后存于 session，发送时附带） */
function getAdminId(req) {
  return req.body?.adminId ?? req.query?.adminId ?? 'sc_admin';
}

function getAdminName(req) {
  return req.body?.adminName ?? req.query?.adminName ?? '地理空间分中心管理员';
}

// ----------------------------------------------------------
// GET /api/admin/publications/stats — 分中心统计
// ----------------------------------------------------------
adminPublicationsRouter.get('/stats', async (req, res, next) => {
  try {
    res.json(await getStats());
  } catch (err) { next(err); }
});

// ----------------------------------------------------------
// GET /api/admin/publications — 分中心工单列表（可按 status 筛选）
// ----------------------------------------------------------
adminPublicationsRouter.get('/', async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const result = await listReviews({
      status: status || undefined,
      limit:  Number(limit)  || 20,
      offset: Number(offset) || 0,
    });
    res.json(result);
  } catch (err) { next(err); }
});

// ----------------------------------------------------------
// GET /api/admin/publications/:id — 工单详情
// ----------------------------------------------------------
adminPublicationsRouter.get('/:id', async (req, res, next) => {
  try {
    const review = await getReviewById(Number(req.params.id));
    if (!review) { res.status(404).json({ error: '工单不存在' }); return; }

    // 附加 mock 邮件记录
    const { rows: mails } = await pool.query(
      `SELECT * FROM geo_publication_mail_contacts WHERE review_id = $1 ORDER BY sent_at ASC`,
      [review.id]
    );
    review.mailContacts = mails.map(r => ({
      id:             Number(r.id),
      senderName:     r.sender_name,
      recipientEmail: r.recipient_email,
      subject:        r.subject,
      body:           r.body,
      sentAt:         r.sent_at,
    }));

    res.json(review);
  } catch (err) { next(err); }
});

// ----------------------------------------------------------
// POST /api/admin/publications/:id/start — 开始审核
// ----------------------------------------------------------
adminPublicationsRouter.post('/:id/start', async (req, res, next) => {
  try {
    const adminId   = getAdminId(req);
    const adminName = getAdminName(req);

    const updated = await startReview(Number(req.params.id), {
      reviewerId:   adminId,
      reviewerName: adminName,
    });
    if (!updated) {
      res.status(409).json({ error: '工单不存在或当前状态不允许开始审核（仅 pending 可开始）' });
      return;
    }

    res.json(updated);

    // 回调主中心：更新为 subcenter_reviewing
    _callback(updated, 'start_review', null).catch(() => {});
  } catch (err) { next(err); }
});

// ----------------------------------------------------------
// POST /api/admin/publications/:id/review — 提交审核结果
// result: APPROVED | REJECTED | RETURNED_FOR_REVISION
// ----------------------------------------------------------
adminPublicationsRouter.post('/:id/review', async (req, res, next) => {
  try {
    const { result, reviewOpinion } = req.body;
    const adminId   = getAdminId(req);
    const adminName = getAdminName(req);

    const VALID = ['APPROVED', 'REJECTED', 'RETURNED_FOR_REVISION'];
    if (!VALID.includes(result)) {
      res.status(400).json({ error: `result 必须是 ${VALID.join(' | ')}` });
      return;
    }
    if ((result === 'REJECTED' || result === 'RETURNED_FOR_REVISION') && !reviewOpinion?.trim()) {
      res.status(400).json({ error: '驳回或退回时必须填写审核意见' });
      return;
    }

    const ctx = { reviewerId: adminId, reviewerName: adminName, note: reviewOpinion ?? null };
    let updated = null;

    if (result === 'APPROVED') {
      // 若仍是 pending，先自动 start_review 再 approve
      const cur = await getReviewById(Number(req.params.id));
      if (cur?.status === 'pending') {
        await startReview(cur.id, { reviewerId: adminId, reviewerName: adminName });
        _callback(cur, 'start_review', null).catch(() => {});
      }
      updated = await approveReview(Number(req.params.id), ctx);
    } else if (result === 'REJECTED') {
      const cur = await getReviewById(Number(req.params.id));
      if (cur?.status === 'pending') {
        await startReview(cur.id, { reviewerId: adminId, reviewerName: adminName });
      }
      updated = await rejectReview(Number(req.params.id), ctx);
    } else {
      const cur = await getReviewById(Number(req.params.id));
      if (cur?.status === 'pending') {
        await startReview(cur.id, { reviewerId: adminId, reviewerName: adminName });
      }
      updated = await returnReview(Number(req.params.id), ctx);
    }

    if (!updated) {
      res.status(409).json({ error: '工单不存在或当前状态不允许提交审核结果' });
      return;
    }

    res.json(updated);

    // 回调主中心
    const actionMap = { approved: 'approve', rejected: 'reject', returned: 'return' };
    _callback(updated, actionMap[updated.status], reviewOpinion).catch(() => {});
  } catch (err) { next(err); }
});

// ----------------------------------------------------------
// POST /api/admin/publications/:id/mock-email — Mock 邮箱联系上传者
// ----------------------------------------------------------
adminPublicationsRouter.post('/:id/mock-email', async (req, res, next) => {
  try {
    const { subject, content } = req.body;
    if (!subject?.trim() || !content?.trim()) {
      res.status(400).json({ error: '主题和内容不能为空' });
      return;
    }
    const adminId   = getAdminId(req);
    const adminName = getAdminName(req);

    const review = await getReviewById(Number(req.params.id));
    if (!review) { res.status(404).json({ error: '工单不存在' }); return; }

    const recipientEmail = review.submitterEmail;
    if (!recipientEmail) {
      res.status(400).json({ error: '上传者未提供邮箱，无法发送 Mock 邮件' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO geo_publication_mail_contacts
         (review_id, sender_id, sender_name, recipient_email, recipient_name, subject, body)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [review.id, adminId, adminName, recipientEmail, review.submitterName ?? null, subject.trim(), content.trim()]
    );

    console.log(`[mock-email] ${adminName} → ${recipientEmail} | ${subject}`);
    res.status(201).json({
      ok:             true,
      isMock:         true,
      recipientEmail,
      subject,
      sentAt:         rows[0].sent_at,
    });
  } catch (err) { next(err); }
});

/** 异步回调主中心 */
async function _callback(review, action, reviewerNote) {
  try {
    await axios.post(
      `${config.mainCenterCallbackUrl.replace('subcenter-callback', 'publication-callback')}`,
      {
        main_ticket_no: review.mainTicketNo,
        action,
        reviewer_note:  reviewerNote ?? null,
      },
      {
        headers: { 'X-API-Key': config.mainCenterApiKey },
        timeout: 8000,
      }
    );
    await markCallbackSent(review.id, true);
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? `${err.code} ${err.message} status=${err.response?.status ?? '?'}`
      : err?.message ?? String(err);
    console.error(`[publication-callback] failed for ${review.mainTicketNo}: ${msg}`);
    await markCallbackSent(review.id, false, msg).catch(() => {});
  }
}
