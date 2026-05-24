/**
 * seedGeoRequests.js
 *
 * 向 geo_access_requests 表写入演示种子数据。
 * 这些记录对应主中心 seedAccessSystem.js 中被分发的申请，
 * 覆盖分中心侧的三种状态：pending / approved / rejected。
 *
 * 运行：node src/scripts/seedGeoRequests.js
 * 或：  npm run db:seed
 *
 * 幂等：ON CONFLICT (main_request_no) DO NOTHING，重复运行安全。
 * 前提：geo_spatial 数据库 schema 已就绪（npm run db:migrate）。
 */

import crypto from 'node:crypto';
import { pool } from '../db/pool.js';

function makeToken(suffix) {
  return `tok-geo-2026-${suffix}-${crypto.randomBytes(4).toString('hex')}`;
}

const now = new Date();
const d = (offsetDays, h = 10) => {
  const t = new Date(now);
  t.setDate(t.getDate() + offsetDays);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

// 与主中心 seedAccessSystem.js 中 REQUEST_DEFS 的 dispatched 申请对应
const GEO_REQUESTS = [
  // REQ-20260510-000003  status: pending（分中心尚未审批）
  {
    main_request_no: 'REQ-20260510-000003',
    main_request_id: 'pending_in_main',
    user_id: 'u-user-001',
    user_name: '张三',
    user_institution: '南京大学地球科学与工程学院',
    user_email: 'zhangsan@test.cn',
    user_phone: '13800000002',
    resource_id: 'c88b03700109474183cbeec8d472a2d5',
    resource_name: '中国天山康古尔—黄山剪切带构造演化数据集',
    purpose: '学术研究，分析天山造山带成矿系统演化历史。',
    status: 'pending',
    reviewer_note: null,
    reviewed_at: null,
    download_token: null,
    download_url: null,
    token_expires_at: null,
    download_count: 0,
    max_downloads: 3,
    allowed_ips: null,
    callback_sent: false,
    received_at: d(-10),
    updated_at: d(-10),
  },

  // REQ-20260515-000004  status: approved（有效令牌，未下载）
  {
    main_request_no: 'REQ-20260515-000004',
    main_request_id: 'approved_in_main',
    user_id: 'u-user-002',
    user_name: '李伟',
    user_institution: '南京师范大学地理科学学院',
    user_email: 'liwei@nnu.edu.cn',
    user_phone: '13800000003',
    resource_id: '1cf380c41de84cee81a73108eaabdfe6',
    resource_name: '熔体-橄榄岩相互作用引发的玄武岩Mg-Fe同位素数据集',
    purpose: '地球化学研究，探讨镁铁同位素动力学分馏机制。',
    status: 'approved',
    reviewer_note: '已核实申请人机构资质，同意下载，有效期 30 天，最多下载 3 次。',
    reviewed_at: d(-3),
    download_token: 'tok-geo-2026-abc123def456',   // 与主中心种子数据一致
    download_url: 'http://localhost:3002/api/download/tok-geo-2026-abc123def456',
    token_expires_at: d(10),
    download_count: 0,
    max_downloads: 3,
    allowed_ips: ['202.119.32.10'],
    callback_sent: true,
    received_at: d(-6),
    updated_at: d(-3),
  },

  // REQ-20260518-000005  status: rejected
  {
    main_request_no: 'REQ-20260518-000005',
    main_request_id: 'rejected_in_main',
    user_id: 'u-user-003',
    user_name: '王小明',
    user_institution: '某高校在读学生',
    user_email: 'wxm@student.cn',
    user_phone: '13800000004',
    resource_id: 'a1fb6a55ea794739b66c51482ceb635a',
    resource_name: '古新世-始新世海相浅水碳酸盐岩锂同位素数据集',
    purpose: '课堂教学案例使用。',
    status: 'rejected',
    reviewer_note: '申请人未提供所在院系导师证明，无法核实教学用途，本次拒绝，请补充证明后重新申请。',
    reviewed_at: d(-1),
    download_token: null,
    download_url: null,
    token_expires_at: null,
    download_count: 0,
    max_downloads: 3,
    allowed_ips: null,
    callback_sent: true,
    received_at: d(-3),
    updated_at: d(-1),
  },

  // REQ-20260520-000006  status: approved（已下载 1 次）
  {
    main_request_no: 'REQ-20260520-000006',
    main_request_id: 'downloaded_in_main',
    user_id: 'u-user-001',
    user_name: '张三',
    user_institution: '南京大学地球科学与工程学院',
    user_email: 'zhangsan@test.cn',
    user_phone: '13800000002',
    resource_id: 'f6141004015747c58bc9f04c9cac3fe5',
    resource_name: '全新世岛屿碳酸盐铀同位素数据集',
    purpose: '地球化学方向研究生论文数据支撑。',
    status: 'approved',
    reviewer_note: '同意，有效期 30 天。',
    reviewed_at: d(-5),
    download_token: 'tok-geo-2026-finished789',    // 与主中心种子数据一致
    download_url: 'http://localhost:3002/api/download/tok-geo-2026-finished789',
    token_expires_at: d(25),
    download_count: 1,
    max_downloads: 3,
    allowed_ips: ['192.168.1.101'],
    callback_sent: true,
    received_at: d(-8),
    updated_at: d(-2),
  },

  // REQ-20260520-000007  status: approved（令牌已过期，主中心侧标记为 expired）
  {
    main_request_no: 'REQ-20260520-000007',
    main_request_id: 'expired_in_main',
    user_id: 'u-user-002',
    user_name: '李伟',
    user_institution: '南京大学地球科学与工程学院',
    user_email: 'liwei@nnu.edu.cn',
    user_phone: '13800000003',
    resource_id: 'a04e30a9a735491aaa6a25aabb5df71d',
    resource_name: '成冰纪斯图特冰期与马里诺冰期铊同位素数据集',
    purpose: '古海洋化学重建研究。',
    status: 'approved',
    reviewer_note: '同意，有效期 30 天。',
    reviewed_at: d(-35),
    download_token: 'tok-geo-2026-expired-old',   // 与主中心种子数据一致
    download_url: 'http://localhost:3002/api/download/tok-geo-2026-expired-old',
    token_expires_at: d(-5),   // 已过期
    download_count: 0,
    max_downloads: 3,
    allowed_ips: ['202.119.32.10'],
    callback_sent: true,
    received_at: d(-40),
    updated_at: d(-35),
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let inserted = 0;
    for (const r of GEO_REQUESTS) {
      const { rowCount } = await client.query(
        `INSERT INTO geo_access_requests (
           main_request_no, main_request_id,
           user_id, user_name, user_institution, user_email, user_phone,
           resource_id, resource_name, purpose,
           status, reviewer_note, reviewed_at,
           download_token, download_url, token_expires_at,
           download_count, max_downloads, allowed_ips,
           callback_sent, received_at, updated_at
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
           $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
         )
         ON CONFLICT (main_request_no) DO NOTHING`,
        [
          r.main_request_no, r.main_request_id,
          r.user_id, r.user_name, r.user_institution, r.user_email, r.user_phone,
          r.resource_id, r.resource_name, r.purpose,
          r.status, r.reviewer_note, r.reviewed_at,
          r.download_token, r.download_url, r.token_expires_at,
          r.download_count, r.max_downloads, r.allowed_ips,
          r.callback_sent, r.received_at, r.updated_at,
        ],
      );
      if (rowCount > 0) {
        console.log(`  [${r.status.padEnd(8)}] ${r.main_request_no}`);
        inserted++;
      } else {
        console.log(`  [skip]     ${r.main_request_no} (already exists)`);
      }
    }

    await client.query('COMMIT');
    console.log(`\n✓ geo_access_requests seed complete (${inserted} inserted)`);
    console.log('\n  Pending  : REQ-20260510-000003 (awaiting subcenter review)');
    console.log('  Approved : REQ-20260515-000004 (token valid, not yet downloaded)');
    console.log('  Rejected : REQ-20260518-000005');
    console.log('  Approved : REQ-20260520-000006 (downloaded 1 time)');
    console.log('  Approved : REQ-20260520-000007 (token expired)\n');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .catch((err) => {
    console.error('seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
