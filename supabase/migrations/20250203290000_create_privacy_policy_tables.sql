-- =====================================================
-- Migration: Privacy policy settings and policy documents
-- Created: 2025-02-03T29:00:00Z
-- Tables: privacy_policy_settings, policy_documents
-- Purpose: User telemetry opt-out preferences; versioned policy content for display and download
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
-- TABLE: privacy_policy_settings
-- Purpose: Per-user privacy/telemetry preferences (opt-out, last updated)
-- =====================================================
CREATE TABLE IF NOT EXISTS privacy_policy_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  telemetry_opt_out BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS privacy_policy_settings_user_id_idx ON privacy_policy_settings(user_id);

DROP TRIGGER IF EXISTS update_privacy_policy_settings_updated_at ON privacy_policy_settings;
CREATE TRIGGER update_privacy_policy_settings_updated_at
  BEFORE UPDATE ON privacy_policy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE privacy_policy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy_policy_settings_select_own"
  ON privacy_policy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "privacy_policy_settings_insert_own"
  ON privacy_policy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "privacy_policy_settings_update_own"
  ON privacy_policy_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "privacy_policy_settings_delete_own"
  ON privacy_policy_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE privacy_policy_settings IS 'User preferences for telemetry and data collection opt-out';
COMMENT ON COLUMN privacy_policy_settings.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN privacy_policy_settings.telemetry_opt_out IS 'If true, user has opted out of telemetry';

-- =====================================================
-- TABLE: policy_documents
-- Purpose: Versioned privacy policy (and other legal) content for display and download
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_type TEXT NOT NULL DEFAULT 'privacy' CHECK (document_type IN ('privacy', 'terms')),
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS policy_documents_type_version_idx ON policy_documents(document_type, version);
CREATE INDEX IF NOT EXISTS policy_documents_effective_date_idx ON policy_documents(effective_date DESC);

DROP TRIGGER IF EXISTS update_policy_documents_updated_at ON policy_documents;
CREATE TRIGGER update_policy_documents_updated_at
  BEFORE UPDATE ON policy_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to read policy documents for public legal pages
CREATE POLICY "policy_documents_select_all"
  ON policy_documents FOR SELECT
  USING (true);

-- Only service role / backend can insert/update/delete (no policy = no access for anon/auth)
-- For simplicity we allow authenticated users with a specific role to manage; omit INSERT/UPDATE/DELETE
-- so that only service role can write. Application will seed policy via migrations or dashboard.
COMMENT ON TABLE policy_documents IS 'Versioned legal documents (privacy policy, terms) for display and download';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS privacy_policy_settings CASCADE;
-- DROP TABLE IF EXISTS policy_documents CASCADE;
