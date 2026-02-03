-- =====================================================
-- Migration: Webhooks and hooks (webhooks, hook_scripts, payload_templates)
-- Created: 2025-02-03T26:00:00Z
-- Tables: webhooks, hook_scripts, payload_templates
-- Purpose: Inbound webhook endpoints, lifecycle hook scripts, payload transformation templates
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
-- TABLE: webhooks
-- Purpose: Webhook endpoints (route name, token, URL, last received, mapping template)
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_name TEXT NOT NULL,
  token_preview TEXT NOT NULL,
  token_hash TEXT,
  url TEXT NOT NULL,
  last_received_at TIMESTAMPTZ,
  mapping_template TEXT,
  delivery_route TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT webhooks_route_name_not_empty CHECK (length(trim(route_name)) > 0),
  CONSTRAINT webhooks_token_preview_not_empty CHECK (length(trim(token_preview)) > 0)
);

CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS webhooks_created_at_idx ON webhooks(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS webhooks_user_route_idx ON webhooks(user_id, route_name);

DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks_select_own"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "webhooks_insert_own"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_update_own"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_delete_own"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE webhooks IS 'Inbound webhook endpoints: route, token, URL, last received, mapping template';

-- =====================================================
-- TABLE: hook_scripts
-- Purpose: Lifecycle hook scripts (event trigger, script content, language); optional webhook_id
-- =====================================================
CREATE TABLE IF NOT EXISTS hook_scripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_trigger TEXT NOT NULL,
  script_content TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript' CHECK (language IN ('javascript', 'python')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT hook_scripts_event_trigger_not_empty CHECK (length(trim(event_trigger)) > 0)
);

CREATE INDEX IF NOT EXISTS hook_scripts_user_id_idx ON hook_scripts(user_id);
CREATE INDEX IF NOT EXISTS hook_scripts_webhook_id_idx ON hook_scripts(webhook_id);
CREATE INDEX IF NOT EXISTS hook_scripts_event_trigger_idx ON hook_scripts(event_trigger);

DROP TRIGGER IF EXISTS update_hook_scripts_updated_at ON hook_scripts;
CREATE TRIGGER update_hook_scripts_updated_at
  BEFORE UPDATE ON hook_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE hook_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hook_scripts_select_own"
  ON hook_scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hook_scripts_insert_own"
  ON hook_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "hook_scripts_update_own"
  ON hook_scripts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "hook_scripts_delete_own"
  ON hook_scripts FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE hook_scripts IS 'Lifecycle hook scripts (sandboxed JS/Python) per event or per webhook';

-- =====================================================
-- TABLE: payload_templates
-- Purpose: Payload transformation templates linked to webhooks
-- =====================================================
CREATE TABLE IF NOT EXISTS payload_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  template_content TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS payload_templates_user_id_idx ON payload_templates(user_id);
CREATE INDEX IF NOT EXISTS payload_templates_webhook_id_idx ON payload_templates(webhook_id);
CREATE UNIQUE INDEX IF NOT EXISTS payload_templates_webhook_unique ON payload_templates(webhook_id);

DROP TRIGGER IF EXISTS update_payload_templates_updated_at ON payload_templates;
CREATE TRIGGER update_payload_templates_updated_at
  BEFORE UPDATE ON payload_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE payload_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payload_templates_select_own"
  ON payload_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payload_templates_insert_own"
  ON payload_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payload_templates_update_own"
  ON payload_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payload_templates_delete_own"
  ON payload_templates FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE payload_templates IS 'Payload transformation templates per webhook';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS payload_templates CASCADE;
-- DROP TABLE IF EXISTS hook_scripts CASCADE;
-- DROP TABLE IF EXISTS webhooks CASCADE;
