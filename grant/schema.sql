PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS grants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  program_url TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  fit TEXT NOT NULL DEFAULT 'unknown' CHECK (fit IN ('unknown', 'high', 'medium', 'low')),
  eligibility TEXT NOT NULL DEFAULT 'unknown' CHECK (eligibility IN ('unknown', 'eligible', 'ineligible', 'needs_verification')),
  deadline TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grant_applications (
  id INTEGER PRIMARY KEY,
  grant_id INTEGER NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  amount INTEGER,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'draft', 'submitted', 'in_discussion', 'rejected', 'accepted', 'awaiting_payout', 'funded')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grant_application_events (
  id INTEGER PRIMARY KEY,
  grant_application_id INTEGER NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_changed', 'message', 'note', 'payout')),
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grant_application_artifacts (
  id INTEGER PRIMARY KEY,
  grant_application_id INTEGER NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('text', 'url', 'file')),
  name TEXT,
  content TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grant_applications_grant_id ON grant_applications(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_application_events_application_id ON grant_application_events(grant_application_id);
CREATE INDEX IF NOT EXISTS idx_grant_application_artifacts_application_id ON grant_application_artifacts(grant_application_id);