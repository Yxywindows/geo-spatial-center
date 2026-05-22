import { pool } from '../db/pool.js';

const LIST_COLS = `
  id, source_id, resources_id, name, name_en,
  description, detailed_description,
  resource_type, resource_type_name, template_name,
  subjects, keywords, authors,
  organization_name, region, data_time,
  doi, license, privacy_type, privacy_condition,
  storage_num, file_count, structured_count,
  visit_num, download_num, follow_num,
  status, release_type, version, logo_url,
  file_formats, suffix_storage,
  corresponding_author_name, corresponding_author_email,
  unit_name, unit_address, unit_postal_code,
  approve_time, create_time
`;

export async function listResources(query) {
  const limit = Math.min(Number(query.limit || 20), 100);
  const offset = Math.max(Number(query.offset || 0), 0);
  const values = [];
  const where = [];

  if (query.q) {
    values.push(`%${query.q}%`);
    const i = values.length;
    where.push(`(
      name ILIKE $${i}
      OR description ILIKE $${i}
      OR organization_name ILIKE $${i}
      OR EXISTS (SELECT 1 FROM unnest(keywords) k WHERE k ILIKE $${i})
      OR EXISTS (SELECT 1 FROM unnest(subjects) s WHERE s ILIKE $${i})
    )`);
  }

  if (query.subject) {
    values.push(query.subject);
    where.push(`$${values.length} = ANY(subjects)`);
  }

  if (query.keyword) {
    values.push(query.keyword);
    where.push(`$${values.length} = ANY(keywords)`);
  }

  if (query.type) {
    values.push(query.type);
    where.push(`resource_type_name = $${values.length}`);
  }

  if (query.privacy) {
    values.push(query.privacy);
    where.push(`privacy_type = $${values.length}`);
  }

  const sortable = new Set(['create_time', 'approve_time', 'visit_num', 'download_num', 'name']);
  const sort = sortable.has(query.sort) ? query.sort : 'create_time';
  const dir = String(query.direction || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  values.push(limit, offset);

  const sql = `
    SELECT ${LIST_COLS}, count(*) OVER() AS total_count
    FROM resources
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${sort} ${dir} NULLS LAST, id DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;

  const result = await pool.query(sql, values);
  const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
  const data = result.rows.map(({ total_count, ...row }) => row);

  return { data, total, limit, offset };
}

export async function getResourceById(sourceId) {
  const result = await pool.query(
    `SELECT ${LIST_COLS} FROM resources WHERE source_id = $1`,
    [sourceId]
  );
  return result.rows[0] ?? null;
}

export async function getStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE privacy_type = 'open')::int AS open_count,
      (SELECT COUNT(DISTINCT s)::int FROM resources, unnest(subjects) s) AS subject_count,
      COUNT(*) FILTER (WHERE resource_type_name = '数据集')::int AS dataset_count,
      COUNT(*) FILTER (WHERE resource_type_name = '论文')::int AS paper_count,
      COUNT(*) FILTER (WHERE resource_type_name = '软件')::int AS software_count
    FROM resources
  `);
  return result.rows[0];
}

export async function getSubjects() {
  const result = await pool.query(`
    SELECT s AS name, COUNT(*)::int AS count
    FROM resources, unnest(subjects) s
    WHERE s IS NOT NULL AND s <> ''
    GROUP BY s
    ORDER BY count DESC
  `);
  return result.rows;
}

export async function getTopKeywords(limit = 50) {
  const result = await pool.query(`
    SELECT k AS word, COUNT(*)::int AS count
    FROM resources, unnest(keywords) k
    WHERE k IS NOT NULL AND k <> ''
    GROUP BY k
    ORDER BY count DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function getResourceTypes() {
  const result = await pool.query(`
    SELECT resource_type_name AS name, COUNT(*)::int AS count
    FROM resources
    WHERE resource_type_name IS NOT NULL
    GROUP BY resource_type_name
    ORDER BY count DESC
  `);
  return result.rows;
}
