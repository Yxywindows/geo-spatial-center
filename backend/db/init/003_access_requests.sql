-- ============================================================
-- 003_access_requests.sql  分中心数据访问申请接收表
--
-- 由主中心审核通过后通过 HTTP API 分发过来。
-- 分中心管理员在此表中进行审批，审批结果通过回调接口同步回主中心。
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_access_requests (
  id               BIGSERIAL PRIMARY KEY,

  -- 主中心关联
  main_request_no  TEXT NOT NULL UNIQUE,  -- 主中心 access_requests.request_no
  main_request_id  TEXT NOT NULL,         -- 主中心 access_requests.id（字符串）

  -- 申请人信息（由主中心分发时携带）
  user_id          TEXT NOT NULL,         -- 主中心用户 ID
  user_name        TEXT,
  user_institution TEXT,
  user_email       TEXT,
  user_phone       TEXT,

  -- 数据资源
  resource_id      TEXT NOT NULL,         -- geo-spatial resources.source_id
  resource_name    TEXT,
  purpose          TEXT,

  -- 审批
  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',    -- 待审核
      'approved',   -- 已批准
      'rejected'    -- 已拒绝
    )),
  reviewer_note    TEXT,
  reviewed_at      TIMESTAMPTZ,

  -- 下载令牌（审批通过时生成）
  download_token   TEXT UNIQUE,
  download_url     TEXT,
  token_expires_at TIMESTAMPTZ,
  download_count   INT NOT NULL DEFAULT 0,
  max_downloads    INT NOT NULL DEFAULT 3,
  allowed_ips      TEXT[],                -- 绑定 IP 白名单（字符串，含 CIDR）

  -- 回调状态
  callback_sent    BOOL NOT NULL DEFAULT FALSE,
  callback_at      TIMESTAMPTZ,
  callback_error   TEXT,                  -- 最后一次回调失败原因

  received_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gar_main_request_no ON geo_access_requests(main_request_no);
CREATE INDEX IF NOT EXISTS idx_gar_status          ON geo_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_gar_resource_id     ON geo_access_requests(resource_id);
CREATE INDEX IF NOT EXISTS idx_gar_token           ON geo_access_requests(download_token)
  WHERE download_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gar_received_at     ON geo_access_requests(received_at DESC);
