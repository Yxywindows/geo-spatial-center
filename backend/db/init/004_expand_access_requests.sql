-- Add extra fields needed for the subcenter admin review view.
-- Fields come in via the dispatch payload from the main center.
ALTER TABLE geo_access_requests
  ADD COLUMN IF NOT EXISTS applicant_ip    TEXT,
  ADD COLUMN IF NOT EXISTS resource_detail TEXT,
  ADD COLUMN IF NOT EXISTS attachment_path TEXT,
  ADD COLUMN IF NOT EXISTS use_scenario    TEXT;
