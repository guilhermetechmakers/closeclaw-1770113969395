-- =====================================================
-- Migration: Security Audit tables (security_audits, security_issues, incident_actions)
-- Created: 2025-02-03T32:00:00Z
-- Tables: security_audits, security_issues, incident_actions
-- Purpose: Security Audit page - audit sessions, issues, incident response actions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: security_audits
-- Purpose: Each audit session with risk score and timestamp
-- =====================================================
CREATE TABLE IF NOT EXISTS security_audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS security_audits_user_id_idx ON security_audits(user_id);
CREATE INDEX IF NOT EXISTS security_audits_created_at_idx ON security_audits(created_at DESC);

DROP TRIGGER IF EXISTS update_security_audits_updated_at ON security_audits;
CREATE TRIGGER update_security_audits_updated_at
  BEFORE UPDATE ON security_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE security_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_audits_select_own"
  ON security_audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "security_audits_insert_own"
  ON security_audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "security_audits_update_own"
  ON security_audits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "security_audits_delete_own"
  ON security_audits FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE security_audits IS 'Security audit sessions with risk score for Security Audit page';
COMMENT ON COLUMN security_audits.risk_score IS 'Overall risk score 0-100 from automated checks';

-- =====================================================
-- TABLE: security_issues
-- Purpose: Identified issues per audit (severity, remediation, auto-fix)
-- =====================================================
CREATE TABLE IF NOT EXISTS security_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID REFERENCES security_audits(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  affected_files TEXT[] DEFAULT '{}',
  remediation TEXT,
  auto_fix_available BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT security_issues_description_not_empty CHECK (length(trim(description)) > 0)
);

CREATE INDEX IF NOT EXISTS security_issues_audit_id_idx ON security_issues(audit_id);
CREATE INDEX IF NOT EXISTS security_issues_severity_idx ON security_issues(severity);

DROP TRIGGER IF EXISTS update_security_issues_updated_at ON security_issues;
CREATE TRIGGER update_security_issues_updated_at
  BEFORE UPDATE ON security_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE security_issues ENABLE ROW LEVEL SECURITY;

-- Users can only access issues for their own audits
CREATE POLICY "security_issues_select_own"
  ON security_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM security_audits sa
      WHERE sa.id = security_issues.audit_id AND sa.user_id = auth.uid()
    )
  );

CREATE POLICY "security_issues_insert_own"
  ON security_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM security_audits sa
      WHERE sa.id = security_issues.audit_id AND sa.user_id = auth.uid()
    )
  );

CREATE POLICY "security_issues_update_own"
  ON security_issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM security_audits sa
      WHERE sa.id = security_issues.audit_id AND sa.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM security_audits sa
      WHERE sa.id = security_issues.audit_id AND sa.user_id = auth.uid()
    )
  );

CREATE POLICY "security_issues_delete_own"
  ON security_issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM security_audits sa
      WHERE sa.id = security_issues.audit_id AND sa.user_id = auth.uid()
    )
  );

COMMENT ON TABLE security_issues IS 'Security findings per audit with severity and remediation';
COMMENT ON COLUMN security_issues.auto_fix_available IS 'Whether this issue can be auto-fixed safely';

-- =====================================================
-- TABLE: incident_actions
-- Purpose: Log of incident response actions (revoke, rotate, export)
-- =====================================================
CREATE TABLE IF NOT EXISTS incident_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID REFERENCES security_audits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('revoke_sessions', 'rotate_secrets', 'export_logs', 'stop_blast_radius', 'quarantine_skill')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS incident_actions_user_id_idx ON incident_actions(user_id);
CREATE INDEX IF NOT EXISTS incident_actions_audit_id_idx ON incident_actions(audit_id);
CREATE INDEX IF NOT EXISTS incident_actions_created_at_idx ON incident_actions(created_at DESC);

DROP TRIGGER IF EXISTS update_incident_actions_updated_at ON incident_actions;
CREATE TRIGGER update_incident_actions_updated_at
  BEFORE UPDATE ON incident_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE incident_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incident_actions_select_own"
  ON incident_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "incident_actions_insert_own"
  ON incident_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incident_actions_update_own"
  ON incident_actions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incident_actions_delete_own"
  ON incident_actions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE incident_actions IS 'Incident response actions (revoke sessions, rotate secrets, export logs)';
COMMENT ON COLUMN incident_actions.action_type IS 'Type of incident response action';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS incident_actions CASCADE;
-- DROP TABLE IF EXISTS security_issues CASCADE;
-- DROP TABLE IF EXISTS security_audits CASCADE;
