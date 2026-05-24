import express from 'express';
import { config } from '../config.js';
import { receiveDispatch } from '../repositories/accessRequestsRepository.js';
import { createReview } from '../repositories/publicationReviewsRepository.js';

export const internalRouter = express.Router();

/** Verify request comes from the main center */
function requireMainCenterKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key === config.mainCenterApiKey) {
    next();
    return;
  }
  res.status(401).json({ error: 'unauthorized' });
}

internalRouter.use(requireMainCenterKey);

/**
 * POST /api/internal/receive-dispatch
 * Called by the main center when a new access request is dispatched to this subcenter.
 */
internalRouter.post('/receive-dispatch', async (req, res, next) => {
  try {
    const {
      main_request_no, main_request_id,
      user_id, user_name, user_institution, user_email, user_phone,
      resource_id, resource_name, purpose, use_scenario, resource_detail,
      applicant_ip, attachment_path,
    } = req.body;

    if (!main_request_no || !resource_id) {
      res.status(400).json({ error: 'missing required fields' });
      return;
    }

    const result = await receiveDispatch({
      mainRequestNo: main_request_no,
      mainRequestId: main_request_id,
      userId: user_id,
      userName: user_name,
      userInstitution: user_institution,
      userEmail: user_email,
      userPhone: user_phone,
      resourceId: resource_id,
      resourceName: resource_name,
      purpose,
      useScenario: use_scenario,
      resourceDetail: resource_detail,
      applicantIp: applicant_ip,
      attachmentPath: attachment_path,
    });

    res.status(result ? 201 : 200).json({
      ok: true,
      inserted: Boolean(result),
      main_request_no,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/internal/receive-publication-dispatch
 * Called by main center when a publication ticket is assigned to this subcenter.
 */
internalRouter.post('/receive-publication-dispatch', async (req, res, next) => {
  try {
    const {
      main_ticket_no, main_ticket_id,
      submitter_id, submitter_name, submitter_email,
      resource_id, resource_name, resource_metadata,
      assigned_admin_id,
    } = req.body;

    if (!main_ticket_no || !submitter_id) {
      res.status(400).json({ error: 'missing required fields' });
      return;
    }

    const review = await createReview({
      mainTicketNo:     main_ticket_no,
      mainTicketId:     main_ticket_id,
      submitterId:      submitter_id,
      submitterName:    submitter_name ?? null,
      submitterEmail:   submitter_email ?? null,
      resourceId:       resource_id ?? null,
      resourceName:     resource_name ?? null,
      resourceMetadata: resource_metadata ?? {},
    });

    // If a specific admin was assigned, pre-set reviewer_id
    if (assigned_admin_id && review) {
      const { pool } = await import('../db/pool.js');
      await pool.query(
        `UPDATE geo_publication_reviews SET reviewer_id = $2 WHERE id = $1`,
        [review.id, assigned_admin_id]
      );
    }

    console.log(`[receive-publication-dispatch] created review for ${main_ticket_no}`);
    res.status(201).json({ ok: true, reviewId: review?.id, main_ticket_no });
  } catch (err) {
    next(err);
  }
});
