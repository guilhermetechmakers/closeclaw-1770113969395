-- =====================================================
-- Migration: Error logs for 404 and client error analytics
-- Created: 2025-02-03T30:00:00Z
-- Tables: error_logs
-- Purpose: Log 404 and other client errors for analytics and troubleshooting
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: error_logs
-- Purpose: Store 404 and client error occurrences (URL attempted, referrer, user context)
-- =====================================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  error_code TEXT NOT NULL,
  url_attempted TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT error_logs_error_code_not_empty CHECK (length(trim(error_code)) > 0),
  CONSTRAINT error_logs_url_attempted_not_empty CHECK (length(trim(url_attempted)) > 0)
);

CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_error_code_idx ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to insert so 404s are logged when user is not logged in
CREATE POLICY "error_logs_insert_any"
  ON error_logs FOR INSERT
  WITH CHECK (true);

-- Users can only read their own error log entries; anonymous entries (user_id NULL) are admin-only
CREATE POLICY "error_logs_select_own"
  ON error_logs FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE error_logs IS 'Client error occurrences (e.g. 404) for analytics and troubleshooting';
COMMENT ON COLUMN error_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN error_logs.error_code IS 'Error code (e.g. 404, 500)';
COMMENT ON COLUMN error_logs.url_attempted IS 'URL that triggered the error';
COMMENT ON COLUMN error_logs.user_id IS 'Authenticated user if any; NULL for anonymous';
COMMENT ON COLUMN error_logs.referrer_url IS 'HTTP Referer when error occurred';
COMMENT ON COLUMN error_logs.user_agent IS 'User-Agent string for diagnostics';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS error_logs CASCADE;
