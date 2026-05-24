import { pool } from '../db/pool.js';
import { randomUUID } from 'node:crypto';

export async function listRequests({ status, limit = 20, offset = 0, sort = 'desc' } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'asc' ? 'ASC' : 'DESC';

  const { rows } = await pool.query(
    `SELECT id, main_request_no, user_name, user_institution,
            resource_id, resource_name, purpose, status,
            reviewer_note, reviewed_at, received_at, updated_at,
            callback_sent, download_url
     FROM geo_access_requests
     ${where}
     ORDER BY received_at ${order}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const count = await pool.query(
    `SELECT COUNT(*)::int AS total FROM geo_access_requests ${where}`,
    params,
  );

  return { data: rows, total: count.rows[0].total };
}

export async function getRequestById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM geo_access_requests WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getRequestByMainNo(mainRequestNo) {
  const { rows } = await pool.query(
    `SELECT * FROM geo_access_requests WHERE main_request_no = $1`,
    [mainRequestNo],
  );
  return rows[0] ?? null;
}

export async function receiveDispatch(data) {
  const {
    mainRequestNo, mainRequestId,
    userId, userName, userInstitution, userEmail, userPhone,
    resourceId, resourceName, purpose, useScenario, resourceDetail,
    applicantIp, attachmentPath,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO geo_access_requests (
       main_request_no, main_request_id,
       user_id, user_name, user_institution, user_email, user_phone,
       resource_id, resource_name, purpose, use_scenario, resource_detail,
       applicant_ip, attachment_path,
       status
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending'
     )
     ON CONFLICT (main_request_no) DO NOTHING
     RETURNING id`,
    [
      mainRequestNo, mainRequestId,
      userId, userName, userInstitution, userEmail, userPhone,
      resourceId, resourceName, purpose, useScenario ?? null, resourceDetail ?? null,
      applicantIp ?? null, attachmentPath ?? null,
    ],
  );
  return rows[0] ?? null;
}

export async function approveRequest(id, reviewerNote) {
  const token = `tok-geo-${Date.now()}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const downloadUrl = `http://localhost:3002/api/download/${token}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { rows } = await pool.query(
    `UPDATE geo_access_requests
     SET status = 'approved',
         reviewer_note = $1,
         reviewed_at = now(),
         download_token = $2,
         download_url = $3,
         token_expires_at = $4,
         allowed_ips = CASE
           WHEN applicant_ip IS NOT NULL THEN ARRAY[applicant_ip]
           ELSE allowed_ips
         END,
         updated_at = now()
     WHERE id = $5
     RETURNING *`,
    [reviewerNote, token, downloadUrl, expiresAt.toISOString(), id],
  );
  return rows[0] ?? null;
}

export async function rejectRequest(id, reviewerNote) {
  const { rows } = await pool.query(
    `UPDATE geo_access_requests
     SET status = 'rejected',
         reviewer_note = $1,
         reviewed_at = now(),
         updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [reviewerNote, id],
  );
  return rows[0] ?? null;
}

export async function markCallbackSent(id, success, errorMessage = null) {
  await pool.query(
    `UPDATE geo_access_requests
     SET callback_sent = $1,
         callback_at = now(),
         callback_error = $2,
         updated_at = now()
     WHERE id = $3`,
    [success, errorMessage, id],
  );
}
