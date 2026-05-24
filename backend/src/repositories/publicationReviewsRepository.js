import { pool } from '../db/pool.js';

function rowToReview(row) {
  if (!row) return null;
  return {
    id:               Number(row.id),
    mainTicketNo:     row.main_ticket_no,
    mainTicketId:     row.main_ticket_id,
    submitterId:      row.submitter_id,
    submitterName:    row.submitter_name,
    submitterEmail:   row.submitter_email,
    resourceId:       row.resource_id,
    resourceName:     row.resource_name,
    resourceMetadata: row.resource_metadata ?? {},
    status:           row.status,
    reviewerId:       row.reviewer_id,
    reviewerName:     row.reviewer_name,
    reviewNote:       row.review_note,
    reviewedAt:       row.reviewed_at,
    callbackSent:     row.callback_sent,
    callbackAt:       row.callback_at,
    callbackError:    row.callback_error,
    receivedAt:       row.received_at,
    updatedAt:        row.updated_at,
  };
}

export async function createReview({
  mainTicketNo, mainTicketId,
  submitterId, submitterName, submitterEmail,
  resourceId, resourceName, resourceMetadata,
}) {
  const { rows } = await pool.query(
    `INSERT INTO geo_publication_reviews
       (main_ticket_no, main_ticket_id,
        submitter_id, submitter_name, submitter_email,
        resource_id, resource_name, resource_metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (main_ticket_no) DO UPDATE SET
       resource_metadata = EXCLUDED.resource_metadata,
       status            = 'pending',
       callback_sent     = FALSE,
       callback_error    = NULL,
       updated_at        = now()
     RETURNING *`,
    [mainTicketNo, String(mainTicketId),
     submitterId, submitterName ?? null, submitterEmail ?? null,
     resourceId ?? null, resourceName ?? null, JSON.stringify(resourceMetadata ?? {})]
  );
  return rowToReview(rows[0]);
}

export async function listReviews({ status, limit = 20, offset = 0 } = {}) {
  const params = [];
  const conditions = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countParams = [...params];
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT * FROM geo_publication_reviews ${where}
     ORDER BY received_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM geo_publication_reviews ${where}`,
    countParams
  );
  return {
    total: Number(countRows[0].total),
    items: rows.map(rowToReview),
  };
}

export async function getReviewById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM geo_publication_reviews WHERE id = $1`,
    [id]
  );
  return rowToReview(rows[0] ?? null);
}

export async function getReviewByTicketNo(ticketNo) {
  const { rows } = await pool.query(
    `SELECT * FROM geo_publication_reviews WHERE main_ticket_no = $1`,
    [ticketNo]
  );
  return rowToReview(rows[0] ?? null);
}

export async function startReview(id, { reviewerId, reviewerName }) {
  const { rows } = await pool.query(
    `UPDATE geo_publication_reviews
     SET  status        = 'reviewing',
          reviewer_id   = $2,
          reviewer_name = $3,
          updated_at    = now()
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [id, reviewerId, reviewerName]
  );
  return rowToReview(rows[0] ?? null);
}

export async function approveReview(id, { reviewerId, reviewerName, note }) {
  const { rows } = await pool.query(
    `UPDATE geo_publication_reviews
     SET  status        = 'approved',
          reviewer_id   = $2,
          reviewer_name = $3,
          review_note   = $4,
          reviewed_at   = now(),
          updated_at    = now()
     WHERE id = $1 AND status = 'reviewing'
     RETURNING *`,
    [id, reviewerId, reviewerName, note ?? null]
  );
  return rowToReview(rows[0] ?? null);
}

export async function rejectReview(id, { reviewerId, reviewerName, note }) {
  const { rows } = await pool.query(
    `UPDATE geo_publication_reviews
     SET  status        = 'rejected',
          reviewer_id   = $2,
          reviewer_name = $3,
          review_note   = $4,
          reviewed_at   = now(),
          updated_at    = now()
     WHERE id = $1 AND status = 'reviewing'
     RETURNING *`,
    [id, reviewerId, reviewerName, note]
  );
  return rowToReview(rows[0] ?? null);
}

export async function returnReview(id, { reviewerId, reviewerName, note }) {
  const { rows } = await pool.query(
    `UPDATE geo_publication_reviews
     SET  status        = 'returned',
          reviewer_id   = $2,
          reviewer_name = $3,
          review_note   = $4,
          reviewed_at   = now(),
          updated_at    = now()
     WHERE id = $1 AND status = 'reviewing'
     RETURNING *`,
    [id, reviewerId, reviewerName, note]
  );
  return rowToReview(rows[0] ?? null);
}

export async function markCallbackSent(id, success, errorMsg = null) {
  await pool.query(
    `UPDATE geo_publication_reviews
     SET  callback_sent  = $2,
          callback_at    = now(),
          callback_error = $3,
          updated_at     = now()
     WHERE id = $1`,
    [id, success, errorMsg]
  );
}

export async function getStats() {
  const [{ rows: byStatusRows }, { rows: totalRows }] = await Promise.all([
    pool.query(`SELECT status, COUNT(*) AS cnt FROM geo_publication_reviews GROUP BY status`),
    pool.query(`SELECT COUNT(*) AS cnt FROM geo_publication_reviews`),
  ]);
  const byStatus = Object.fromEntries(byStatusRows.map(r => [r.status, Number(r.cnt)]));
  return {
    total:     Number(totalRows[0].cnt),
    pending:   byStatus['pending']   ?? 0,
    reviewing: byStatus['reviewing'] ?? 0,
    approved:  byStatus['approved']  ?? 0,
    rejected:  byStatus['rejected']  ?? 0,
    returned:  byStatus['returned']  ?? 0,
  };
}
