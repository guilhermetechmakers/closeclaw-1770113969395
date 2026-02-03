-- =====================================================
-- Migration: Add name and isolation_setting to cron_jobs; create cron_run_history
-- Created: 2025-02-03T27:00:00Z
-- Tables: cron_jobs (alter), cron_run_history (new)
-- Purpose: Job display name, isolation toggle, and run history for Cron Jobs & Scheduler
-- =====================================================

-- Add name to cron_jobs (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cron_jobs' AND column_name = 'name'
  ) THEN
    ALTER TABLE cron_jobs ADD COLUMN name TEXT DEFAULT 'Unnamed job';
    UPDATE cron_jobs SET name = COALESCE(NULLIF(trim(description), ''), 'Unnamed job') WHERE name IS NULL;
    ALTER TABLE cron_jobs ALTER COLUMN name SET DEFAULT 'Unnamed job';
  END IF;
END $$;

-- Add isolation_setting to cron_jobs (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cron_jobs' AND column_name = 'isolation_setting'
  ) THEN
    ALTER TABLE cron_jobs ADD COLUMN isolation_setting BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN cron_jobs.name IS 'Display name for the scheduled job';
COMMENT ON COLUMN cron_jobs.isolation_setting IS 'When true, job runs in isolated environment';

-- =====================================================
-- TABLE: cron_run_history
-- Purpose: Execution history for cron jobs (output, logs, timing)
-- =====================================================
CREATE TABLE IF NOT EXISTS cron_run_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES cron_jobs(id) ON DELETE CASCADE NOT NULL,
  execution_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'aborted')),
  output TEXT,
  log TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS cron_run_history_job_id_idx ON cron_run_history(job_id);
CREATE INDEX IF NOT EXISTS cron_run_history_execution_time_idx ON cron_run_history(execution_time DESC);

ALTER TABLE cron_run_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cron_run_history_select_via_job"
  ON cron_run_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cron_jobs c WHERE c.id = cron_run_history.job_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cron_run_history_insert_via_job"
  ON cron_run_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cron_jobs c WHERE c.id = cron_run_history.job_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cron_run_history_update_via_job"
  ON cron_run_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cron_jobs c WHERE c.id = cron_run_history.job_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cron_jobs c WHERE c.id = cron_run_history.job_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cron_run_history_delete_via_job"
  ON cron_run_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cron_jobs c WHERE c.id = cron_run_history.job_id AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE cron_run_history IS 'Execution history for cron jobs with output and logs';
