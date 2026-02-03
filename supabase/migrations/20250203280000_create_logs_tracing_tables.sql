-- =====================================================
-- Migration: Logs & Tracing tables (logs, run_traces, log_retention_settings)
-- Created: 2025-02-03T28:00:00Z
-- Tables: logs, run_traces, log_retention_settings
-- Purpose: Structured logs, per-run traces, retention settings for Logs & Tracing page
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
-- TABLE: logs
-- Purpose: Structured log entries (severity, message, redacted copy, optional trace)
-- =====================================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  redacted_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT logs_message_not_empty CHECK (length(trim(message)) > 0)
);

CREATE INDEX IF NOT EXISTS logs_user_id_idx ON logs(user_id);
CREATE INDEX IF NOT EXISTS logs_timestamp_idx ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS logs_severity_idx ON logs(severity);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select_own"
  ON logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "logs_insert_own"
  ON logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "logs_delete_own"
  ON logs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE logs IS 'Structured log entries for monitoring and diagnostics';
COMMENT ON COLUMN logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN logs.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN logs.redacted_message IS 'Message with sensitive data redacted for export';

-- =====================================================
-- TABLE: run_traces
-- Purpose: Per-run trace: tool invocations and model calls linked to a log entry
-- =====================================================
CREATE TABLE IF NOT EXISTS run_traces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  log_id UUID REFERENCES logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_invocation JSONB DEFAULT '[]'::jsonb,
  model_calls JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT run_traces_log_id_unique UNIQUE (log_id)
);

CREATE INDEX IF NOT EXISTS run_traces_user_id_idx ON run_traces(user_id);
CREATE INDEX IF NOT EXISTS run_traces_log_id_idx ON run_traces(log_id);
CREATE INDEX IF NOT EXISTS run_traces_created_at_idx ON run_traces(created_at DESC);

DROP TRIGGER IF EXISTS update_run_traces_updated_at ON run_traces;
CREATE TRIGGER update_run_traces_updated_at
  BEFORE UPDATE ON run_traces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE run_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_traces_select_own"
  ON run_traces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "run_traces_insert_own"
  ON run_traces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "run_traces_update_own"
  ON run_traces FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "run_traces_delete_own"
  ON run_traces FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE run_traces IS 'Per-run trace: tool invocation → model calls → outputs';
COMMENT ON COLUMN run_traces.log_id IS 'Log entry this trace belongs to';
COMMENT ON COLUMN run_traces.duration_ms IS 'Total run duration in milliseconds';

-- =====================================================
-- TABLE: log_retention_settings
-- Purpose: Per-user log retention period and purge settings
-- =====================================================
CREATE TABLE IF NOT EXISTS log_retention_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  retention_period_days INTEGER NOT NULL DEFAULT 30 CHECK (retention_period_days > 0 AND retention_period_days <= 3650),
  purge_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_log_retention_settings_updated_at ON log_retention_settings;
CREATE TRIGGER update_log_retention_settings_updated_at
  BEFORE UPDATE ON log_retention_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE log_retention_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_retention_settings_select_own"
  ON log_retention_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "log_retention_settings_insert_own"
  ON log_retention_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "log_retention_settings_update_own"
  ON log_retention_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE log_retention_settings IS 'User log retention and purge preferences';
COMMENT ON COLUMN log_retention_settings.retention_period_days IS 'Keep logs for this many days before purge';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS log_retention_settings CASCADE;
-- DROP TABLE IF EXISTS run_traces CASCADE;
-- DROP TABLE IF EXISTS logs CASCADE;
