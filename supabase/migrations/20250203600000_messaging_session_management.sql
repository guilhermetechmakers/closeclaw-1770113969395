-- =====================================================
-- Migration: Messaging & Session Management
-- Created: 2025-02-03T00:00:00Z
-- Tables: chat_messages (alter), chat_sessions (alter), session_commands (new)
-- Purpose: Canonical message schema (channel, redaction), session routing (shared/isolate), slash commands with permissions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ALTER: chat_messages – add channel and is_redacted
-- Purpose: Canonical message schema for multi-channel ingestion and redaction status
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'channel'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN channel TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'is_redacted'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_redacted BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chat_messages_channel_idx ON chat_messages(channel) WHERE channel IS NOT NULL;
COMMENT ON COLUMN chat_messages.channel IS 'Source channel (e.g. telegram, slack) for canonical schema';
COMMENT ON COLUMN chat_messages.is_redacted IS 'Whether sensitive content was redacted before persistence';

-- =====================================================
-- ALTER: chat_sessions – add routing_type and peer_id
-- Purpose: Session routing – shared main session vs isolated per peer/channel
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_sessions' AND column_name = 'routing_type'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN routing_type TEXT NOT NULL DEFAULT 'shared'
      CHECK (routing_type IN ('shared', 'isolate'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_sessions' AND column_name = 'peer_id'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN peer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chat_sessions_routing_type_idx ON chat_sessions(routing_type);
CREATE INDEX IF NOT EXISTS chat_sessions_peer_id_idx ON chat_sessions(peer_id) WHERE peer_id IS NOT NULL;
COMMENT ON COLUMN chat_sessions.routing_type IS 'shared = main session, isolate = per peer/channel';
COMMENT ON COLUMN chat_sessions.peer_id IS 'Peer/user ID when routing_type is isolate';

-- =====================================================
-- TABLE: session_commands
-- Purpose: Slash command execution log and permissions (e.g. /new, /reset, /stop)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_commands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  command_type TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT session_commands_command_type_not_empty CHECK (length(trim(command_type)) > 0)
);

CREATE INDEX IF NOT EXISTS session_commands_user_id_idx ON session_commands(user_id);
CREATE INDEX IF NOT EXISTS session_commands_session_id_idx ON session_commands(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS session_commands_created_at_idx ON session_commands(created_at DESC);
CREATE INDEX IF NOT EXISTS session_commands_command_type_idx ON session_commands(command_type);

ALTER TABLE session_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_commands_select_own"
  ON session_commands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "session_commands_insert_own"
  ON session_commands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "session_commands_delete_own"
  ON session_commands FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE session_commands IS 'Slash command execution log with permissions (e.g. /new, /reset, /stop)';
COMMENT ON COLUMN session_commands.command_type IS 'Slash command name (e.g. new, reset, stop)';
COMMENT ON COLUMN session_commands.permissions IS 'Permission checks applied at execution time';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS session_commands CASCADE;
-- ALTER TABLE chat_sessions DROP COLUMN IF EXISTS routing_type, DROP COLUMN IF EXISTS peer_id;
-- ALTER TABLE chat_messages DROP COLUMN IF EXISTS channel, DROP COLUMN IF EXISTS is_redacted;
