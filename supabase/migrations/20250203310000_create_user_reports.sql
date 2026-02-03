-- =====================================================
-- Migration: User reports for error/support feedback
-- Created: 2025-02-03T31:00:00Z
-- Tables: user_reports
-- Purpose: Store user-submitted error reports for support follow-up
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_reports
-- Purpose: User-reported issues (e.g. 500 errors) for support and audit
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_reports_error_type_not_empty CHECK (length(trim(error_type)) > 0),
  CONSTRAINT user_reports_description_not_empty CHECK (length(trim(description)) > 0)
);

CREATE INDEX IF NOT EXISTS user_reports_created_at_idx ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS user_reports_error_type_idx ON user_reports(error_type);
CREATE INDEX IF NOT EXISTS user_reports_user_id_idx ON user_reports(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (anon or authenticated) so 500 page can submit without login
CREATE POLICY "user_reports_insert_any"
  ON user_reports FOR INSERT
  WITH CHECK (true);

-- Users can read only their own reports
CREATE POLICY "user_reports_select_own"
  ON user_reports FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_reports IS 'User-submitted error reports for support and incident tracking';
COMMENT ON COLUMN user_reports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_reports.user_id IS 'Authenticated user if any; NULL for anonymous';
COMMENT ON COLUMN user_reports.error_type IS 'Error code or type (e.g. 500)';
COMMENT ON COLUMN user_reports.description IS 'User-provided description of the issue';
COMMENT ON COLUMN user_reports.contact_email IS 'Optional contact email for follow-up';
COMMENT ON COLUMN user_reports.context IS 'Optional context (URL, referrer, etc.)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS user_reports CASCADE;
