import express from 'express';
import axios from 'axios';
import { config } from '../config.js';
import {
  approveRequest,
  getRequestById,
  listRequests,
  markCallbackSent,
  rejectRequest,
} from '../repositories/accessRequestsRepository.js';

export const adminRouter = express.Router();

/** Very simple API-key guard for demo purposes */
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key === config.mainCenterApiKey) {
    next();
    return;
  }
  // Also accept a session cookie / localStorage token from the frontend
  const authHeader = req.headers['authorization'];
  if (authHeader === `Bearer ${config.mainCenterApiKey}`) {
    next();
    return;
  }
  res.status(401).json({ error: '未授权' });
}

adminRouter.use(requireAdminKey);

/** GET /api/admin/requests?status=&sort=&limit=&offset= */
adminRouter.get('/requests', async (req, res, next) => {
  try {
    const { status, sort, limit, offset } = req.query;
    const result = await listRequests({
      status: status || undefined,
      sort: sort === 'asc' ? 'asc' : 'desc',
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/** GET /api/admin/requests/:id */
adminRouter.get('/requests/:id', async (req, res, next) => {
  try {
    const req_ = await getRequestById(Number(req.params.id));
    if (!req_) {
      res.status(404).json({ error: '申请不存在' });
      return;
    }
    res.json(req_);
  } catch (err) {
    next(err);
  }
});

async function postCallback(req_, action, extra = {}) {
  try {
    await axios.post(
      config.mainCenterCallbackUrl,
      {
        main_request_no: req_.main_request_no,
        action,
        download_url: req_.download_url ?? null,
        download_token: req_.download_token ?? null,
        token_expires_at: req_.token_expires_at ?? null,
        allowed_ips: req_.allowed_ips ?? null,
        reviewer_note: req_.reviewer_note ?? null,
        ...extra,
      },
      {
        headers: { 'X-API-Key': config.mainCenterApiKey },
        timeout: 8000,
      },
    );
    await markCallbackSent(req_.id, true);
    return true;
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? [
          err.code,
          err.message,
          err.response?.status ? `status=${err.response.status}` : '',
          err.response?.data
            ? `response=${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`
            : '',
        ].filter(Boolean).join(' ')
      : err?.message ?? String(err);
    console.error(`[callback] failed for ${req_.main_request_no}: ${msg}`);
    await markCallbackSent(req_.id, false, msg);
    return false;
  }
}

/** POST /api/admin/requests/:id/approve  Body: { reviewerNote } */
adminRouter.post('/requests/:id/approve', async (req, res, next) => {
  try {
    const { reviewerNote } = req.body;
    const updated = await approveRequest(Number(req.params.id), reviewerNote ?? null);
    if (!updated) {
      res.status(404).json({ error: '申请不存在' });
      return;
    }
    const callbackSynced = await postCallback(updated, 'approve');
    res.json({ ok: true, callbackSynced, data: updated });
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/requests/:id/reject  Body: { reviewerNote } */
adminRouter.post('/requests/:id/reject', async (req, res, next) => {
  try {
    const { reviewerNote } = req.body;
    if (!reviewerNote || !reviewerNote.trim()) {
      res.status(400).json({ error: '驳回理由不能为空' });
      return;
    }
    const updated = await rejectRequest(Number(req.params.id), reviewerNote.trim());
    if (!updated) {
      res.status(404).json({ error: '申请不存在' });
      return;
    }
    const callbackSynced = await postCallback(updated, 'reject', { rejection_reason: reviewerNote.trim() });
    res.json({ ok: true, callbackSynced, data: updated });
  } catch (err) {
    next(err);
  }
});
