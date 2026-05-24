-- ============================================================
-- 005_publication_reviews.sql
-- 数据多级发布审核系统：地理空间分中心表（geo_spatial 数据库）
--
-- 所有 DDL 使用 IF NOT EXISTS，可在已运行容器上安全执行：
--   docker exec -i <geo-spatial-postgres-container> psql \
--     -U geo_spatial -d geo_spatial \
--     < geo-spatial-center/backend/db/init/005_publication_reviews.sql
--
-- 状态机（分中心视角，简化为 5 态）：
--   pending     → reviewing  （分中心开始审核）
--   reviewing   → approved   （通过，触发回调 main center → approved）
--   reviewing   → rejected   （驳回，触发回调 main center → rejected）
--   reviewing   → returned   （退回，触发回调 main center → returned_for_revision）
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_publication_reviews (
  id                BIGSERIAL    PRIMARY KEY,

  -- 主中心关联（唯一键，避免重复分发）
  main_ticket_no    TEXT         NOT NULL UNIQUE,              -- publication_tickets.ticket_no
  main_ticket_id    TEXT         NOT NULL,                     -- publication_tickets.id（字符串存储）

  -- 申请人信息（冗余，避免跨库查询）
  submitter_id      TEXT         NOT NULL,
  submitter_name    TEXT,
  submitter_email   TEXT,

  -- 资源信息（冗余）
  resource_id       TEXT,
  resource_name     TEXT,
  resource_metadata JSONB        NOT NULL DEFAULT '{}'::jsonb,

  -- 分中心视角状态机（5 态）
  status            TEXT         NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending',     -- 已收到，等待开始审核
                        'reviewing',   -- 审核中
                        'approved',    -- 已通过
                        'rejected',    -- 已驳回
                        'returned'     -- 已退回修改
                      )),
  reviewer_id       TEXT,                                      -- 分中心管理员 ID
  reviewer_name     TEXT,
  review_note       TEXT,
  reviewed_at       TIMESTAMPTZ,

  -- 主中心回调状态
  callback_sent     BOOL         NOT NULL DEFAULT FALSE,
  callback_at       TIMESTAMPTZ,
  callback_error    TEXT,

  received_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gpr_status      ON geo_publication_reviews(status);
CREATE INDEX IF NOT EXISTS idx_gpr_reviewer_id ON geo_publication_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_gpr_received_at ON geo_publication_reviews(received_at DESC);

-- ----------------------------------------------------------
-- geo_publication_mail_contacts — 分中心 Mock 邮件记录
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS geo_publication_mail_contacts (
  id              BIGSERIAL    PRIMARY KEY,
  review_id       BIGINT       NOT NULL REFERENCES geo_publication_reviews(id) ON DELETE CASCADE,
  sender_id       TEXT,                                      -- 分中心管理员 ID
  sender_name     TEXT,
  recipient_email TEXT         NOT NULL,
  recipient_name  TEXT,
  subject         TEXT         NOT NULL,
  body            TEXT         NOT NULL,
  is_mock         BOOL         NOT NULL DEFAULT TRUE,
  sent_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gpmc_review_id ON geo_publication_mail_contacts(review_id);
CREATE INDEX IF NOT EXISTS idx_gpmc_sent_at   ON geo_publication_mail_contacts(sent_at DESC);
