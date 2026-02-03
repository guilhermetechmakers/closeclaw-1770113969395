-- =====================================================
-- Migration: Chat tables (chat_sessions, chat_messages, tool_invocations)
-- Created: 2025-02-03T21:00:00Z
-- Tables: chat_sessions, chat_messages, tool_invocations
-- Purpose: Chat session UI – sessions, messages, tool invocation cards
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
-- TABLE: chat_sessions
-- Purpose: User chat sessions (start timestamp, status, settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New session',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  settings JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chat_sessions_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_started_at_idx ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions_select_own"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_insert_own"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions_update_own"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions_delete_own"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE chat_sessions IS 'Chat sessions for workspace hub (status, settings, start time)';

-- =====================================================
-- TABLE: chat_messages
-- Purpose: Messages in a session (sender, text, timestamp, attachment links)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant', 'system')),
  text TEXT NOT NULL,
  attachment_links JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON chat_messages(sender_id) WHERE sender_id IS NOT NULL;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_own"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert_own"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_delete_own"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid()
    )
  );

COMMENT ON TABLE chat_messages IS 'Messages in a chat session with sender, text, attachments';

-- =====================================================
-- TABLE: tool_invocations
-- Purpose: Tool invocation cards (session, invocation data, output, status)
-- =====================================================
CREATE TABLE IF NOT EXISTS tool_invocations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  invocation_data JSONB DEFAULT '{}'::jsonb,
  output JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'approved', 'denied')),
  run_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT tool_invocations_tool_name_not_empty CHECK (length(trim(tool_name)) > 0)
);

CREATE INDEX IF NOT EXISTS tool_invocations_session_id_idx ON tool_invocations(session_id);
CREATE INDEX IF NOT EXISTS tool_invocations_message_id_idx ON tool_invocations(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS tool_invocations_status_idx ON tool_invocations(status);
CREATE INDEX IF NOT EXISTS tool_invocations_created_at_idx ON tool_invocations(created_at DESC);

DROP TRIGGER IF EXISTS update_tool_invocations_updated_at ON tool_invocations;
CREATE TRIGGER update_tool_invocations_updated_at
  BEFORE UPDATE ON tool_invocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tool_invocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_invocations_select_own"
  ON tool_invocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = tool_invocations.session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "tool_invocations_insert_own"
  ON tool_invocations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = tool_invocations.session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "tool_invocations_update_own"
  ON tool_invocations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = tool_invocations.session_id AND cs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = tool_invocations.session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "tool_invocations_delete_own"
  ON tool_invocations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = tool_invocations.session_id AND cs.user_id = auth.uid()
    )
  );

COMMENT ON TABLE tool_invocations IS 'Tool invocation cards per session (streaming output, approve/deny)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS tool_invocations CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS chat_sessions CASCADE;
