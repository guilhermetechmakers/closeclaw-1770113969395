-- =====================================================
-- Migration: Model Provider Abstraction (providers, requests, usage_metrics, configuration_overrides)
-- Created: 2025-02-03T35:00:00Z
-- Tables: model_providers, model_requests, usage_metrics, configuration_overrides
-- Purpose: Centralized AI model provider config, request logging, usage tracking, per-request overrides
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
-- TABLE: model_providers
-- Purpose: Provider definitions (name, endpoint, supported features, priority)
-- =====================================================
CREATE TABLE IF NOT EXISTS model_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL CHECK (slug IN ('openai', 'anthropic', 'local', 'ollama', 'vllm', 'custom')),
  api_endpoint_base TEXT,
  supported_features JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT model_providers_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT model_providers_slug_not_empty CHECK (length(trim(slug)) > 0)
);

CREATE INDEX IF NOT EXISTS model_providers_user_id_idx ON model_providers(user_id);
CREATE INDEX IF NOT EXISTS model_providers_slug_idx ON model_providers(slug);
CREATE INDEX IF NOT EXISTS model_providers_status_idx ON model_providers(status);
CREATE INDEX IF NOT EXISTS model_providers_priority_idx ON model_providers(priority DESC);

DROP TRIGGER IF EXISTS update_model_providers_updated_at ON model_providers;
CREATE TRIGGER update_model_providers_updated_at
  BEFORE UPDATE ON model_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE model_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_providers_select_own"
  ON model_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "model_providers_insert_own"
  ON model_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "model_providers_update_own"
  ON model_providers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "model_providers_delete_own"
  ON model_providers FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE model_providers IS 'AI model provider definitions (name, endpoint, features, priority)';

-- =====================================================
-- TABLE: model_requests
-- Purpose: Log each model request (user, provider, status, metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS model_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  request_metadata JSONB DEFAULT '{}'::jsonb,
  response_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS model_requests_user_id_idx ON model_requests(user_id);
CREATE INDEX IF NOT EXISTS model_requests_provider_id_idx ON model_requests(provider_id);
CREATE INDEX IF NOT EXISTS model_requests_status_idx ON model_requests(status);
CREATE INDEX IF NOT EXISTS model_requests_created_at_idx ON model_requests(created_at DESC);

DROP TRIGGER IF EXISTS update_model_requests_updated_at ON model_requests;
CREATE TRIGGER update_model_requests_updated_at
  BEFORE UPDATE ON model_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE model_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_requests_select_own"
  ON model_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "model_requests_insert_own"
  ON model_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "model_requests_update_own"
  ON model_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "model_requests_delete_own"
  ON model_requests FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE model_requests IS 'Log of each model API request (provider, status, metadata)';

-- =====================================================
-- TABLE: usage_metrics
-- Purpose: Token counts and request frequency per request/user
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES model_requests(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
  token_count_input INTEGER NOT NULL DEFAULT 0 CHECK (token_count_input >= 0),
  token_count_output INTEGER NOT NULL DEFAULT 0 CHECK (token_count_output >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS usage_metrics_user_id_idx ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS usage_metrics_request_id_idx ON usage_metrics(request_id);
CREATE INDEX IF NOT EXISTS usage_metrics_provider_id_idx ON usage_metrics(provider_id);
CREATE INDEX IF NOT EXISTS usage_metrics_created_at_idx ON usage_metrics(created_at DESC);

ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_metrics_select_own"
  ON usage_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_metrics_insert_own"
  ON usage_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_metrics_delete_own"
  ON usage_metrics FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE usage_metrics IS 'Token counts and usage per request for quota and analytics';

-- =====================================================
-- TABLE: configuration_overrides
-- Purpose: Per-request configuration for historical analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS configuration_overrides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES model_requests(id) ON DELETE CASCADE NOT NULL,
  model_name TEXT,
  temperature NUMERIC(3,2) CHECK (temperature IS NULL OR (temperature >= 0 AND temperature <= 2)),
  max_tokens INTEGER CHECK (max_tokens IS NULL OR max_tokens > 0),
  parameters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT configuration_overrides_request_unique UNIQUE (request_id)
);

CREATE INDEX IF NOT EXISTS configuration_overrides_user_id_idx ON configuration_overrides(user_id);
CREATE INDEX IF NOT EXISTS configuration_overrides_request_id_idx ON configuration_overrides(request_id);
CREATE INDEX IF NOT EXISTS configuration_overrides_created_at_idx ON configuration_overrides(created_at DESC);

ALTER TABLE configuration_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuration_overrides_select_own"
  ON configuration_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "configuration_overrides_insert_own"
  ON configuration_overrides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "configuration_overrides_update_own"
  ON configuration_overrides FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "configuration_overrides_delete_own"
  ON configuration_overrides FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE configuration_overrides IS 'Per-request model config (model, temperature, max_tokens) for history';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS configuration_overrides CASCADE;
-- DROP TABLE IF EXISTS usage_metrics CASCADE;
-- DROP TABLE IF EXISTS model_requests CASCADE;
-- DROP TABLE IF EXISTS model_providers CASCADE;
