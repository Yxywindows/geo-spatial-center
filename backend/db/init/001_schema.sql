CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS resources (
  id                       BIGSERIAL PRIMARY KEY,
  source_id                TEXT NOT NULL UNIQUE,
  resources_id             TEXT,
  name                     TEXT NOT NULL,
  name_en                  TEXT,
  description              TEXT,
  detailed_description     TEXT,
  resource_type            TEXT,
  resource_type_name       TEXT,
  template_name            TEXT,
  subjects                 TEXT[] NOT NULL DEFAULT '{}',
  keywords                 TEXT[] NOT NULL DEFAULT '{}',
  authors                  JSONB,
  organization_name        TEXT,
  region                   TEXT,
  data_time                TEXT,
  doi                      TEXT,
  license                  TEXT,
  privacy_type             TEXT,
  privacy_condition        TEXT,
  storage_num              BIGINT,
  file_count               INTEGER,
  structured_count         INTEGER,
  visit_num                INTEGER NOT NULL DEFAULT 0,
  download_num             INTEGER NOT NULL DEFAULT 0,
  follow_num               INTEGER NOT NULL DEFAULT 0,
  status                   TEXT,
  release_type             TEXT,
  version                  TEXT,
  logo_url                 TEXT,
  file_formats             JSONB,
  suffix_storage           JSONB,
  corresponding_author_name  TEXT,
  corresponding_author_email TEXT,
  unit_name                TEXT,
  unit_address             TEXT,
  unit_postal_code         TEXT,
  approve_time             DATE,
  create_time              DATE
);

CREATE INDEX IF NOT EXISTS idx_res_name_trgm ON resources USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_res_keywords   ON resources USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_res_subjects   ON resources USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_res_privacy    ON resources(privacy_type);
CREATE INDEX IF NOT EXISTS idx_res_type       ON resources(resource_type_name);
CREATE INDEX IF NOT EXISTS idx_res_org        ON resources(organization_name);
CREATE INDEX IF NOT EXISTS idx_res_create     ON resources(create_time DESC NULLS LAST);
