-- =====================================================
-- Migration: Browser automation command queue
-- Created: 2025-02-03T00:00:00Z
-- Tables: browser_commands
-- Purpose: Per-session command queue (click, type, select, navigate) for deterministic automation
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: browser_commands
-- Purpose: Queued automation commands per browser profile (session)
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_commands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  browser_profile_id UUID REFERENCES browser_profiles(id) ON DELETE CASCADE NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('click', 'type', 'select', 'navigate', 'scroll', 'wait', 'screenshot')),
  parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS browser_commands_profile_id_idx ON browser_commands(browser_profile_id);
CREATE INDEX IF NOT EXISTS browser_commands_created_at_idx ON browser_commands(created_at DESC);
CREATE INDEX IF NOT EXISTS browser_commands_status_idx ON browser_commands(status);
CREATE INDEX IF NOT EXISTS browser_commands_sequence_idx ON browser_commands(browser_profile_id, sequence_order);

DROP TRIGGER IF EXISTS update_browser_commands_updated_at ON browser_commands;
CREATE TRIGGER update_browser_commands_updated_at
  BEFORE UPDATE ON browser_commands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE browser_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "browser_commands_select_own"
  ON browser_commands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_commands.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_commands_insert_own"
  ON browser_commands FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_commands.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_commands_update_own"
  ON browser_commands FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_commands.browser_profile_id AND bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_commands.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "browser_commands_delete_own"
  ON browser_commands FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM browser_profiles bp
      WHERE bp.id = browser_commands.browser_profile_id AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE browser_commands IS 'Queued automation commands per browser profile (click, type, navigate, etc.)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS browser_commands CASCADE;
