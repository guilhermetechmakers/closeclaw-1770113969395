-- =====================================================
-- Migration: Secrets and Keychain (secrets, secret_audit_logs)
-- Created: 2025-02-03T34:00:00Z
-- Tables: secrets, secret_audit_logs
-- Purpose: Secure secrets storage and audit logging for keychain integration
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
-- TABLE: secrets
-- Purpose: Stored secrets (name, encrypted value, storage method); never plaintext
-- =====================================================
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  encrypted_value TEXT,
  storage_method TEXT NOT NULL DEFAULT 'encrypted_fallback' CHECK (
    storage_method IN ('os_keychain', 'onepassword', 'encrypted_fallback')
  ),
  key_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT secrets_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS secrets_user_id_idx ON secrets(user_id);
CREATE INDEX IF NOT EXISTS secrets_created_at_idx ON secrets(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS secrets_user_name_idx ON secrets(user_id, name);

DROP TRIGGER IF EXISTS update_secrets_updated_at ON secrets;
CREATE TRIGGER update_secrets_updated_at
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secrets_select_own"
  ON secrets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "secrets_insert_own"
  ON secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secrets_update_own"
  ON secrets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secrets_delete_own"
  ON secrets FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE secrets IS 'Secrets and keychain entries; encrypted_value or key_reference only, no plaintext';
COMMENT ON COLUMN secrets.encrypted_value IS 'Ciphertext when storage_method is encrypted_fallback; null when using OS keychain or 1Password';
COMMENT ON COLUMN secrets.key_reference IS 'Reference/key identifier for OS keychain or 1Password';

-- =====================================================
-- TABLE: secret_audit_logs
-- Purpose: Audit trail for secret access, rotation, and changes
-- =====================================================
CREATE TABLE IF NOT EXISTS secret_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  secret_id UUID REFERENCES secrets(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT secret_audit_logs_action_not_empty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS secret_audit_logs_user_id_idx ON secret_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS secret_audit_logs_secret_id_idx ON secret_audit_logs(secret_id);
CREATE INDEX IF NOT EXISTS secret_audit_logs_created_at_idx ON secret_audit_logs(created_at DESC);

ALTER TABLE secret_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secret_audit_logs_select_own"
  ON secret_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "secret_audit_logs_insert_own"
  ON secret_audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE secret_audit_logs IS 'Audit log for secret access, rotation, and configuration changes';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS secret_audit_logs CASCADE;
-- DROP TABLE IF EXISTS secrets CASCADE;
