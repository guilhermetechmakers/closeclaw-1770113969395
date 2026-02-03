-- =====================================================
-- Migration: Browser automation (profiles, tabs, scripts, captures, CDP tokens)
-- Created: 2025-02-03T23:00:00Z
-- Tables: browser_profiles, browser_tabs, browser_scripts, browser_capture_records, browser_cdp_tokens
-- Purpose: Managed Chromium profile, tab inspection, automation scripts, captures, CDP connector
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
-- TABLE: browser_profiles
-- Purpose: Managed Chromium profile per workspace (status, footprint path, isolation)
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'starting', 'stopping', 'error')),
  footprint_path TEXT,
  is_isolated BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS browser_profiles_user_id_idx ON browser_profiles(user_id);
CREATE INDEX IF NOT EXISTS browser_profiles_status_idx ON browser_profiles(status);
CREATE INDEX IF NOT EXISTS browser_profiles_created_at_idx ON browser_profiles(created_at DESC);

DROP TRIGGER IF EXISTS update_browser_profiles_updated_at ON browser_profiles;
CREATE TRIGGER update_browser_profiles_updated_at
  BEFORE UPDATE ON browser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE browser_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_profiles_select_own"
  ON browser_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "browser_profiles_insert_own"
  ON browser_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_profiles_update_own"
  ON browser_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_profiles_delete_own"
  ON browser_profiles FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE browser_profiles IS 'Managed Chromium profile per workspace (status, footprint path, isolation)';

-- =====================================================
-- TABLE: browser_tabs
-- Purpose: Open tabs for a browser profile (URL, snapshot for thumbnails)
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_tabs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  browser_profile_id UUID REFERENCES browser_profiles(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  url TEXT NOT NULL DEFAULT '',
  title TEXT,
  snapshot_url TEXT,
  snapshot_data TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS browser_tabs_profile_id_idx ON browser_tabs(browser_profile_id);
CREATE INDEX IF NOT EXISTS browser_tabs_updated_at_idx ON browser_tabs(updated_at DESC);

DROP TRIGGER IF EXISTS update_browser_tabs_updated_at ON browser_tabs;
CREATE TRIGGER update_browser_tabs_updated_at
  BEFORE UPDATE ON browser_tabs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE browser_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_tabs_select_own"
  ON browser_tabs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_tabs.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_tabs_insert_own"
  ON browser_tabs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_tabs.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_tabs_update_own"
  ON browser_tabs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_tabs.browser_profile_id AND bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_tabs.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_tabs_delete_own"
  ON browser_tabs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_tabs.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE browser_tabs IS 'Open tabs for a browser profile (URL, snapshot for thumbnails)';

-- =====================================================
-- TABLE: browser_scripts
-- Purpose: Uploaded automation scripts (name, execution status, logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_scripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  execution_status TEXT NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  script_content TEXT,
  last_run_at TIMESTAMPTZ,
  last_run_log TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT browser_scripts_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS browser_scripts_user_id_idx ON browser_scripts(user_id);
CREATE INDEX IF NOT EXISTS browser_scripts_status_idx ON browser_scripts(execution_status);
CREATE INDEX IF NOT EXISTS browser_scripts_created_at_idx ON browser_scripts(created_at DESC);

DROP TRIGGER IF EXISTS update_browser_scripts_updated_at ON browser_scripts;
CREATE TRIGGER update_browser_scripts_updated_at
  BEFORE UPDATE ON browser_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE browser_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_scripts_select_own"
  ON browser_scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "browser_scripts_insert_own"
  ON browser_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_scripts_update_own"
  ON browser_scripts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_scripts_delete_own"
  ON browser_scripts FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE browser_scripts IS 'Uploaded automation scripts (name, execution status, logs)';

-- =====================================================
-- TABLE: browser_capture_records
-- Purpose: Screenshot, PDF, DOM snapshot records per profile
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_capture_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  browser_profile_id UUID REFERENCES browser_profiles(id) ON DELETE CASCADE NOT NULL,
  capture_type TEXT NOT NULL CHECK (capture_type IN ('screenshot', 'pdf', 'dom')),
  file_path TEXT,
  file_url TEXT,
  tab_id UUID REFERENCES browser_tabs(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS browser_capture_records_profile_id_idx ON browser_capture_records(browser_profile_id);
CREATE INDEX IF NOT EXISTS browser_capture_records_created_at_idx ON browser_capture_records(created_at DESC);
CREATE INDEX IF NOT EXISTS browser_capture_records_type_idx ON browser_capture_records(capture_type);

ALTER TABLE browser_capture_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_capture_records_select_own"
  ON browser_capture_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_capture_records.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_capture_records_insert_own"
  ON browser_capture_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_capture_records.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_capture_records_delete_own"
  ON browser_capture_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_capture_records.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE browser_capture_records IS 'Screenshot, PDF, DOM snapshot records per profile';

-- =====================================================
-- TABLE: browser_cdp_tokens
-- Purpose: CDP connector config (sensitive token redacted; local vs node proxy)
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_cdp_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  browser_profile_id UUID REFERENCES browser_profiles(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'local' CHECK (connection_type IN ('local', 'node_proxy')),
  token_preview TEXT,
  config_json JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS browser_cdp_tokens_user_id_idx ON browser_cdp_tokens(user_id);
CREATE INDEX IF NOT EXISTS browser_cdp_tokens_profile_id_idx ON browser_cdp_tokens(browser_profile_id);

DROP TRIGGER IF EXISTS update_browser_cdp_tokens_updated_at ON browser_cdp_tokens;
CREATE TRIGGER update_browser_cdp_tokens_updated_at
  BEFORE UPDATE ON browser_cdp_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE browser_cdp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_cdp_tokens_select_own"
  ON browser_cdp_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "browser_cdp_tokens_insert_own"
  ON browser_cdp_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_cdp_tokens_update_own"
  ON browser_cdp_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "browser_cdp_tokens_delete_own"
  ON browser_cdp_tokens FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE browser_cdp_tokens IS 'CDP connector config (sensitive token redacted; local vs node proxy)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS browser_cdp_tokens CASCADE;
-- DROP TABLE IF EXISTS browser_capture_records CASCADE;
-- DROP TABLE IF EXISTS browser_scripts CASCADE;
-- DROP TABLE IF EXISTS browser_tabs CASCADE;
-- DROP TABLE IF EXISTS browser_profiles CASCADE;
