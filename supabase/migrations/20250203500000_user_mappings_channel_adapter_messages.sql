-- =====================================================
-- Migration: User mappings and channel adapter messages
-- Created: 2025-02-03T50:00:00Z
-- Tables: user_mappings, channel_adapter_messages
-- Purpose: Identity mapping per channel; message log for routing and diagnostics
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_mappings
-- Purpose: Map external provider identities to internal user_id per channel
-- =====================================================
CREATE TABLE IF NOT EXISTS user_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_mappings_channel_external_unique UNIQUE (channel_id, external_id),
  CONSTRAINT user_mappings_external_id_not_empty CHECK (length(trim(external_id)) > 0)
);

CREATE INDEX IF NOT EXISTS user_mappings_user_id_idx ON user_mappings(user_id);
CREATE INDEX IF NOT EXISTS user_mappings_channel_id_idx ON user_mappings(channel_id);
CREATE INDEX IF NOT EXISTS user_mappings_external_id_idx ON user_mappings(channel_id, external_id);
CREATE INDEX IF NOT EXISTS user_mappings_status_idx ON user_mappings(status) WHERE status = 'active';

DROP TRIGGER IF EXISTS update_user_mappings_updated_at ON user_mappings;
CREATE TRIGGER update_user_mappings_updated_at
  BEFORE UPDATE ON user_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_mappings_select_own"
  ON user_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_mappings_insert_own"
  ON user_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_mappings_update_own"
  ON user_mappings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_mappings_delete_own"
  ON user_mappings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_mappings IS 'Map external provider identities to internal user_id per channel';

-- =====================================================
-- TABLE: channel_adapter_messages
-- Purpose: Message log for channel routing and diagnostics (content, direction, timestamp)
-- =====================================================
CREATE TABLE IF NOT EXISTS channel_adapter_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_sender_id TEXT,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT channel_adapter_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS channel_adapter_messages_channel_id_idx ON channel_adapter_messages(channel_id);
CREATE INDEX IF NOT EXISTS channel_adapter_messages_created_at_idx ON channel_adapter_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS channel_adapter_messages_direction_idx ON channel_adapter_messages(direction);

ALTER TABLE channel_adapter_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_adapter_messages_select_own"
  ON channel_adapter_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = channel_adapter_messages.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "channel_adapter_messages_insert_own"
  ON channel_adapter_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = channel_adapter_messages.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "channel_adapter_messages_delete_own"
  ON channel_adapter_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = channel_adapter_messages.channel_id AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE channel_adapter_messages IS 'Message log for channel routing and diagnostics';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS channel_adapter_messages CASCADE;
-- DROP TABLE IF EXISTS user_mappings CASCADE;
