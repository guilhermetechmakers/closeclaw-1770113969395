-- =====================================================
-- Migration: Profiles and profile-related tables
-- Created: 2025-02-03T12:00:00Z
-- Tables: profiles, oauth_accounts, device_sessions, api_keys, security_settings
-- Purpose: User profile, connected accounts, sessions, API keys, security prefs
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
-- TABLE: profiles
-- Purpose: Extended user profile (display name, avatar, workspace path)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  workspace_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE profiles IS 'Extended user profile (display name, avatar, workspace path)';

-- =====================================================
-- TABLE: oauth_accounts
-- Purpose: Connected OAuth providers per user
-- =====================================================
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS oauth_accounts_status_idx ON oauth_accounts(status) WHERE status = 'active';

DROP TRIGGER IF EXISTS update_oauth_accounts_updated_at ON oauth_accounts;
CREATE TRIGGER update_oauth_accounts_updated_at
  BEFORE UPDATE ON oauth_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oauth_accounts_select_own"
  ON oauth_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "oauth_accounts_insert_own"
  ON oauth_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "oauth_accounts_update_own"
  ON oauth_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "oauth_accounts_delete_own"
  ON oauth_accounts FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE oauth_accounts IS 'Connected OAuth providers per user';

-- =====================================================
-- TABLE: device_sessions
-- Purpose: Active device sessions for session management
-- =====================================================
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS device_sessions_user_id_idx ON device_sessions(user_id);
CREATE INDEX IF NOT EXISTS device_sessions_last_active_idx ON device_sessions(last_active_at DESC);

ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_sessions_select_own"
  ON device_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "device_sessions_insert_own"
  ON device_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "device_sessions_update_own"
  ON device_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "device_sessions_delete_own"
  ON device_sessions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE device_sessions IS 'Active device sessions for revoke list';

-- =====================================================
-- TABLE: api_keys
-- Purpose: Scoped API keys for integrations (key value stored elsewhere)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT api_keys_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_created_at_idx ON api_keys(created_at DESC);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_select_own"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "api_keys_insert_own"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_update_own"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_delete_own"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE api_keys IS 'Scoped API keys (key value in secrets store)';

-- =====================================================
-- TABLE: security_settings
-- Purpose: 2FA and keychain integration per user
-- =====================================================
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
  keychain_integration_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS security_settings_user_id_idx ON security_settings(user_id);

DROP TRIGGER IF EXISTS update_security_settings_updated_at ON security_settings;
CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_settings_select_own"
  ON security_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "security_settings_insert_own"
  ON security_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "security_settings_update_own"
  ON security_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "security_settings_delete_own"
  ON security_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE security_settings IS '2FA and keychain (e.g. 1Password) integration';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS security_settings CASCADE;
-- DROP TABLE IF EXISTS api_keys CASCADE;
-- DROP TABLE IF EXISTS device_sessions CASCADE;
-- DROP TABLE IF EXISTS oauth_accounts CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
