-- =====================================================
-- Migration: Channels and adapters (channels, adapter_configurations, delivery_logs)
-- Created: 2025-02-03T22:00:00Z
-- Tables: channels, adapter_configurations, delivery_logs
-- Purpose: Channel adapters management – channels list, adapter config, delivery logs
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
-- TABLE: channels
-- Purpose: Connected chat channel adapters (provider, status, last event, success rate)
-- =====================================================
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('whatsapp', 'telegram', 'slack', 'discord')),
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'provisioning')),
  last_event_at TIMESTAMPTZ,
  success_rate NUMERIC(5,2) DEFAULT 100.00 CHECK (success_rate >= 0 AND success_rate <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT channels_provider_not_empty CHECK (length(trim(provider)) > 0)
);

CREATE INDEX IF NOT EXISTS channels_user_id_idx ON channels(user_id);
CREATE INDEX IF NOT EXISTS channels_provider_idx ON channels(provider);
CREATE INDEX IF NOT EXISTS channels_status_idx ON channels(status);
CREATE INDEX IF NOT EXISTS channels_last_event_at_idx ON channels(last_event_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select_own"
  ON channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "channels_insert_own"
  ON channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "channels_update_own"
  ON channels FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "channels_delete_own"
  ON channels FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE channels IS 'Connected chat channel adapters (provider, status, last event, success rate)';

-- =====================================================
-- TABLE: adapter_configurations
-- Purpose: Per-channel config (DM policy, group policy, mention gating, webhook, polling)
-- =====================================================
CREATE TABLE IF NOT EXISTS adapter_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  dm_policy TEXT NOT NULL DEFAULT 'pairing' CHECK (dm_policy IN ('pairing', 'allowlist', 'open', 'disabled')),
  group_policy TEXT NOT NULL DEFAULT 'mention' CHECK (group_policy IN ('mention', 'open', 'disabled')),
  mention_gating BOOLEAN NOT NULL DEFAULT true,
  webhook_url TEXT,
  polling_interval_seconds INTEGER CHECK (polling_interval_seconds IS NULL OR polling_interval_seconds > 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT adapter_configurations_channel_unique UNIQUE (channel_id)
);

CREATE INDEX IF NOT EXISTS adapter_configurations_channel_id_idx ON adapter_configurations(channel_id);

DROP TRIGGER IF EXISTS update_adapter_configurations_updated_at ON adapter_configurations;
CREATE TRIGGER update_adapter_configurations_updated_at
  BEFORE UPDATE ON adapter_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE adapter_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adapter_configurations_select_own"
  ON adapter_configurations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = adapter_configurations.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "adapter_configurations_insert_own"
  ON adapter_configurations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = adapter_configurations.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "adapter_configurations_update_own"
  ON adapter_configurations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = adapter_configurations.channel_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = adapter_configurations.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "adapter_configurations_delete_own"
  ON adapter_configurations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = adapter_configurations.channel_id AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE adapter_configurations IS 'Per-channel config: DM policy, group policy, mention gating, webhook, polling';

-- =====================================================
-- TABLE: delivery_logs
-- Purpose: Inbound/outbound event log with success and error details
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT delivery_logs_event_type_not_empty CHECK (length(trim(event_type)) > 0)
);

CREATE INDEX IF NOT EXISTS delivery_logs_channel_id_idx ON delivery_logs(channel_id);
CREATE INDEX IF NOT EXISTS delivery_logs_created_at_idx ON delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS delivery_logs_event_type_idx ON delivery_logs(event_type);

ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_logs_select_own"
  ON delivery_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = delivery_logs.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "delivery_logs_insert_own"
  ON delivery_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = delivery_logs.channel_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "delivery_logs_delete_own"
  ON delivery_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels c
      WHERE c.id = delivery_logs.channel_id AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE delivery_logs IS 'Inbound/outbound delivery events with success and error details';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS delivery_logs CASCADE;
-- DROP TABLE IF EXISTS adapter_configurations CASCADE;
-- DROP TABLE IF EXISTS channels CASCADE;
