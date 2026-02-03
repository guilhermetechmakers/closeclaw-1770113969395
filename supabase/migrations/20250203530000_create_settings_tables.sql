-- =====================================================
-- Migration: Settings / Preferences (gateway configuration)
-- Created: 2025-02-03T53:00:00Z
-- Tables: network_settings, remote_access, settings_secrets_prefs, tool_policies, model_defaults
-- Purpose: Global gateway and workspace configuration per user
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
-- TABLE: network_settings
-- Purpose: Bind address, port, TLS options per user
-- =====================================================
CREATE TABLE IF NOT EXISTS network_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bind_address TEXT DEFAULT '0.0.0.0',
  port INTEGER NOT NULL DEFAULT 3000 CHECK (port > 0 AND port < 65536),
  tls_options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS network_settings_user_id_idx ON network_settings(user_id);

DROP TRIGGER IF EXISTS update_network_settings_updated_at ON network_settings;
CREATE TRIGGER update_network_settings_updated_at
  BEFORE UPDATE ON network_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE network_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "network_settings_select_own"
  ON network_settings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "network_settings_insert_own"
  ON network_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "network_settings_update_own"
  ON network_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "network_settings_delete_own"
  ON network_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE network_settings IS 'Gateway network binding and TLS configuration per user';

-- =====================================================
-- TABLE: remote_access
-- Purpose: Tailnet/relay and device pairing policies per user
-- =====================================================
CREATE TABLE IF NOT EXISTS remote_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tailnet_config JSONB DEFAULT '{}'::jsonb,
  relay_settings JSONB DEFAULT '{}'::jsonb,
  pairing_policies JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS remote_access_user_id_idx ON remote_access(user_id);

DROP TRIGGER IF EXISTS update_remote_access_updated_at ON remote_access;
CREATE TRIGGER update_remote_access_updated_at
  BEFORE UPDATE ON remote_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE remote_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "remote_access_select_own"
  ON remote_access FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "remote_access_insert_own"
  ON remote_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "remote_access_update_own"
  ON remote_access FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "remote_access_delete_own"
  ON remote_access FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE remote_access IS 'Tailnet, relay, and device pairing configuration per user';

-- =====================================================
-- TABLE: settings_secrets_prefs
-- Purpose: OS keychain and 1Password integration toggles per user
-- =====================================================
CREATE TABLE IF NOT EXISTS settings_secrets_prefs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  os_keychain_enabled BOOLEAN NOT NULL DEFAULT true,
  onepassword_integration BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS settings_secrets_prefs_user_id_idx ON settings_secrets_prefs(user_id);

DROP TRIGGER IF EXISTS update_settings_secrets_prefs_updated_at ON settings_secrets_prefs;
CREATE TRIGGER update_settings_secrets_prefs_updated_at
  BEFORE UPDATE ON settings_secrets_prefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE settings_secrets_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_secrets_prefs_select_own"
  ON settings_secrets_prefs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "settings_secrets_prefs_insert_own"
  ON settings_secrets_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_secrets_prefs_update_own"
  ON settings_secrets_prefs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_secrets_prefs_delete_own"
  ON settings_secrets_prefs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE settings_secrets_prefs IS 'Keychain and 1Password integration preferences per user';

-- =====================================================
-- TABLE: tool_policies
-- Purpose: Exec allowlist, sandbox mode, Docker config per user
-- =====================================================
CREATE TABLE IF NOT EXISTS tool_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  exec_allowlist JSONB DEFAULT '[]'::jsonb,
  sandbox_mode BOOLEAN NOT NULL DEFAULT true,
  docker_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS tool_policies_user_id_idx ON tool_policies(user_id);

DROP TRIGGER IF EXISTS update_tool_policies_updated_at ON tool_policies;
CREATE TRIGGER update_tool_policies_updated_at
  BEFORE UPDATE ON tool_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tool_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_policies_select_own"
  ON tool_policies FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "tool_policies_insert_own"
  ON tool_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tool_policies_update_own"
  ON tool_policies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tool_policies_delete_own"
  ON tool_policies FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE tool_policies IS 'Exec allowlist, sandbox, and Docker policy per user';

-- =====================================================
-- TABLE: model_defaults
-- Purpose: Provider priority, failover rules, usage caps per user
-- =====================================================
CREATE TABLE IF NOT EXISTS model_defaults (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider_priority JSONB DEFAULT '[]'::jsonb,
  failover_rules JSONB DEFAULT '{}'::jsonb,
  usage_caps JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS model_defaults_user_id_idx ON model_defaults(user_id);

DROP TRIGGER IF EXISTS update_model_defaults_updated_at ON model_defaults;
CREATE TRIGGER update_model_defaults_updated_at
  BEFORE UPDATE ON model_defaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE model_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_defaults_select_own"
  ON model_defaults FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "model_defaults_insert_own"
  ON model_defaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "model_defaults_update_own"
  ON model_defaults FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "model_defaults_delete_own"
  ON model_defaults FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE model_defaults IS 'Default provider priority, failover, and usage caps per user';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS model_defaults CASCADE;
-- DROP TABLE IF EXISTS tool_policies CASCADE;
-- DROP TABLE IF EXISTS settings_secrets_prefs CASCADE;
-- DROP TABLE IF EXISTS remote_access CASCADE;
-- DROP TABLE IF EXISTS network_settings CASCADE;
