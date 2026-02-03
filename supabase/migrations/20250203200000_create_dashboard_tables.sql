-- =====================================================
-- Migration: Dashboard tables (activities, runs, cron_jobs, nodes, alerts)
-- Created: 2025-02-03T20:00:00Z
-- Tables: activities, runs, cron_jobs, nodes, alerts
-- Purpose: Dashboard workspace hub data for activity feed, runs, cron, nodes, alerts
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
-- TABLE: activities
-- Purpose: Recent activity feed (messages, tool runs, cron history)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'tool_run', 'cron_run', 'node_event', 'alert')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS activities_activity_type_idx ON activities(activity_type);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "activities_insert_own"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_delete_own"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE activities IS 'Recent activity feed for dashboard (messages, tool runs, cron history)';

-- =====================================================
-- TABLE: runs
-- Purpose: Active and historical agent/skill runs
-- =====================================================
CREATE TABLE IF NOT EXISTS runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'aborted')),
  start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_time TIMESTAMPTZ,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS runs_user_id_idx ON runs(user_id);
CREATE INDEX IF NOT EXISTS runs_status_idx ON runs(status);
CREATE INDEX IF NOT EXISTS runs_start_time_idx ON runs(start_time DESC);

DROP TRIGGER IF EXISTS update_runs_updated_at ON runs;
CREATE TRIGGER update_runs_updated_at
  BEFORE UPDATE ON runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runs_select_own"
  ON runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "runs_insert_own"
  ON runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runs_update_own"
  ON runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runs_delete_own"
  ON runs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE runs IS 'Active and historical agent/skill runs with stream and abort support';

-- =====================================================
-- TABLE: cron_jobs
-- Purpose: Scheduled jobs (cron builder, payload, session target)
-- =====================================================
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schedule TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed')),
  next_run_time TIMESTAMPTZ,
  description TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  session_target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS cron_jobs_user_id_idx ON cron_jobs(user_id);
CREATE INDEX IF NOT EXISTS cron_jobs_next_run_time_idx ON cron_jobs(next_run_time) WHERE next_run_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS cron_jobs_status_idx ON cron_jobs(status);

DROP TRIGGER IF EXISTS update_cron_jobs_updated_at ON cron_jobs;
CREATE TRIGGER update_cron_jobs_updated_at
  BEFORE UPDATE ON cron_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cron_jobs_select_own"
  ON cron_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cron_jobs_insert_own"
  ON cron_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cron_jobs_update_own"
  ON cron_jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cron_jobs_delete_own"
  ON cron_jobs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE cron_jobs IS 'Scheduled cron jobs with payload and session target';

-- =====================================================
-- TABLE: nodes
-- Purpose: Paired devices with capabilities and connection health
-- =====================================================
CREATE TABLE IF NOT EXISTS nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'paired' CHECK (status IN ('paired', 'offline', 'error')),
  capabilities JSONB DEFAULT '[]'::jsonb,
  connection_health TEXT DEFAULT 'unknown' CHECK (connection_health IN ('healthy', 'degraded', 'unknown', 'offline')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS nodes_user_id_idx ON nodes(user_id);
CREATE INDEX IF NOT EXISTS nodes_status_idx ON nodes(status);

DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
CREATE TRIGGER update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nodes_select_own"
  ON nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "nodes_insert_own"
  ON nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nodes_update_own"
  ON nodes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nodes_delete_own"
  ON nodes FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE nodes IS 'Paired devices with capabilities and connection health';

-- =====================================================
-- TABLE: alerts
-- Purpose: Skill alerts and audit findings with resolution status
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  resolution_status TEXT NOT NULL DEFAULT 'open' CHECK (resolution_status IN ('open', 'acknowledged', 'resolved')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);
CREATE INDEX IF NOT EXISTS alerts_node_id_idx ON alerts(node_id) WHERE node_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS alerts_resolution_status_idx ON alerts(resolution_status);
CREATE INDEX IF NOT EXISTS alerts_severity_idx ON alerts(severity);

DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select_own"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "alerts_insert_own"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_update_own"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_delete_own"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE alerts IS 'Skill alerts and audit findings with remediation';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TABLE IF EXISTS nodes CASCADE;
-- DROP TABLE IF EXISTS cron_jobs CASCADE;
-- DROP TABLE IF EXISTS runs CASCADE;
-- DROP TABLE IF EXISTS activities CASCADE;
