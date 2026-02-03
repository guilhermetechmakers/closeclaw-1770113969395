-- =====================================================
-- Migration: Scheduling, Webhooks & Hooks enhancements + Gmail Pub/Sub
-- Created: 2025-02-03T00:00:00Z
-- Tables: webhooks (alter), hook_scripts (alter), gmail_pubsub_settings (new)
-- Purpose: rate_limit on webhooks; execution_status/last_execution_time on hook_scripts; Gmail Pub/Sub settings
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
-- ALTER: webhooks - add rate_limit (requests per minute)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webhooks' AND column_name = 'rate_limit'
  ) THEN
    ALTER TABLE webhooks ADD COLUMN rate_limit INTEGER;
    COMMENT ON COLUMN webhooks.rate_limit IS 'Max requests per minute; NULL = no limit';
  END IF;
END $$;

-- =====================================================
-- ALTER: hook_scripts - add execution_status, last_execution_time
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hook_scripts' AND column_name = 'execution_status'
  ) THEN
    ALTER TABLE hook_scripts ADD COLUMN execution_status TEXT
      CHECK (execution_status IS NULL OR execution_status IN ('idle', 'success', 'failed', 'running'));
    COMMENT ON COLUMN hook_scripts.execution_status IS 'Last run status: idle, success, failed, running';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hook_scripts' AND column_name = 'last_execution_time'
  ) THEN
    ALTER TABLE hook_scripts ADD COLUMN last_execution_time TIMESTAMPTZ;
    COMMENT ON COLUMN hook_scripts.last_execution_time IS 'When the hook script was last executed';
  END IF;
END $$;

-- =====================================================
-- TABLE: gmail_pubsub_settings
-- Purpose: Gmail Pub/Sub integration config (push handler, credentials reference, test state)
-- =====================================================
CREATE TABLE IF NOT EXISTS gmail_pubsub_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'default',
  configuration_details JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_tested_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT gmail_pubsub_settings_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS gmail_pubsub_settings_user_id_idx ON gmail_pubsub_settings(user_id);
CREATE INDEX IF NOT EXISTS gmail_pubsub_settings_is_active_idx ON gmail_pubsub_settings(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS update_gmail_pubsub_settings_updated_at ON gmail_pubsub_settings;
CREATE TRIGGER update_gmail_pubsub_settings_updated_at
  BEFORE UPDATE ON gmail_pubsub_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE gmail_pubsub_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gmail_pubsub_settings_select_own"
  ON gmail_pubsub_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gmail_pubsub_settings_insert_own"
  ON gmail_pubsub_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gmail_pubsub_settings_update_own"
  ON gmail_pubsub_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gmail_pubsub_settings_delete_own"
  ON gmail_pubsub_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE gmail_pubsub_settings IS 'Gmail Pub/Sub integration: config, push handler URL, active flag, last tested';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- ALTER TABLE webhooks DROP COLUMN IF EXISTS rate_limit;
-- ALTER TABLE hook_scripts DROP COLUMN IF EXISTS execution_status;
-- ALTER TABLE hook_scripts DROP COLUMN IF EXISTS last_execution_time;
-- DROP TABLE IF EXISTS gmail_pubsub_settings CASCADE;
