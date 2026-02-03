-- =====================================================
-- Migration: Audit logs table (compliance / incident response)
-- Created: 2025-02-03
-- Tables: audit_logs
-- Purpose: Log audit-related actions for compliance and export
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Log of audit actions (run, export, apply_fix, etc.) for compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID REFERENCES security_audits(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT audit_logs_action_not_empty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_audit_id_idx ON audit_logs(audit_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "audit_logs_insert_own"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE audit_logs IS 'Audit activity log for compliance and export (LogID, AuditID, Timestamp, Action, UserID)';
COMMENT ON COLUMN audit_logs.action IS 'Action type: audit_run, export, apply_fix, etc.';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS audit_logs CASCADE;
