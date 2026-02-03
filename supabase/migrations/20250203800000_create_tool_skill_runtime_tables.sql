-- =====================================================
-- Migration: Tool & Skill Runtime tables
-- Created: 2025-02-03T38:00:00Z
-- Tables: runtime_tools, runtime_runs, runtime_outputs, runtime_feedback
-- Purpose: Tool definitions, runs, streaming outputs, and user feedback
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
-- TABLE: runtime_tools
-- Purpose: Structured tool definitions (browser, exec, web_app, media)
-- =====================================================
CREATE TABLE IF NOT EXISTS runtime_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('browser', 'executable', 'web_app', 'media_player', 'custom')),
  parameters JSONB DEFAULT '{}'::jsonb,
  policy_criteria JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT runtime_tools_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS runtime_tools_user_id_idx ON runtime_tools(user_id);
CREATE INDEX IF NOT EXISTS runtime_tools_created_at_idx ON runtime_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS runtime_tools_tool_type_idx ON runtime_tools(tool_type);
CREATE INDEX IF NOT EXISTS runtime_tools_status_idx ON runtime_tools(status) WHERE status = 'active';

DROP TRIGGER IF EXISTS update_runtime_tools_updated_at ON runtime_tools;
CREATE TRIGGER update_runtime_tools_updated_at
  BEFORE UPDATE ON runtime_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE runtime_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runtime_tools_select_own"
  ON runtime_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "runtime_tools_insert_own"
  ON runtime_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_tools_update_own"
  ON runtime_tools FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_tools_delete_own"
  ON runtime_tools FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE runtime_tools IS 'Tool definitions for runtime execution (parameters and policy criteria)';

-- =====================================================
-- TABLE: runtime_runs
-- Purpose: Execution runs (tool or skill), env ref, start/end, status
-- =====================================================
CREATE TABLE IF NOT EXISTS runtime_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES runtime_tools(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES library_skills(id) ON DELETE SET NULL,
  environment_snapshot JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'aborted')),
  policy_compliant BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT runtime_runs_tool_or_skill CHECK (
    (tool_id IS NOT NULL AND skill_id IS NULL) OR (tool_id IS NULL AND skill_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS runtime_runs_user_id_idx ON runtime_runs(user_id);
CREATE INDEX IF NOT EXISTS runtime_runs_tool_id_idx ON runtime_runs(tool_id);
CREATE INDEX IF NOT EXISTS runtime_runs_skill_id_idx ON runtime_runs(skill_id);
CREATE INDEX IF NOT EXISTS runtime_runs_started_at_idx ON runtime_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS runtime_runs_status_idx ON runtime_runs(status);

DROP TRIGGER IF EXISTS update_runtime_runs_updated_at ON runtime_runs;
CREATE TRIGGER update_runtime_runs_updated_at
  BEFORE UPDATE ON runtime_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE runtime_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runtime_runs_select_own"
  ON runtime_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "runtime_runs_insert_own"
  ON runtime_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_runs_update_own"
  ON runtime_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_runs_delete_own"
  ON runtime_runs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE runtime_runs IS 'Tool/skill execution runs with start/end and policy compliance';

-- =====================================================
-- TABLE: runtime_outputs
-- Purpose: Streamed output chunks per run (timestamp, data, format)
-- =====================================================
CREATE TABLE IF NOT EXISTS runtime_outputs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES runtime_runs(id) ON DELETE CASCADE NOT NULL,
  emitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  output_data JSONB DEFAULT '{}'::jsonb,
  output_format TEXT NOT NULL DEFAULT 'json' CHECK (output_format IN ('json', 'text', 'log', 'binary_ref')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS runtime_outputs_run_id_idx ON runtime_outputs(run_id);
CREATE INDEX IF NOT EXISTS runtime_outputs_emitted_at_idx ON runtime_outputs(emitted_at);

ALTER TABLE runtime_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runtime_outputs_select_via_run"
  ON runtime_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM runtime_runs r
      WHERE r.id = runtime_outputs.run_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "runtime_outputs_insert_via_run"
  ON runtime_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM runtime_runs r
      WHERE r.id = runtime_outputs.run_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "runtime_outputs_delete_via_run"
  ON runtime_outputs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM runtime_runs r
      WHERE r.id = runtime_outputs.run_id AND r.user_id = auth.uid()
    )
  );

COMMENT ON TABLE runtime_outputs IS 'Streamed output chunks for tool/skill runs';

-- =====================================================
-- TABLE: runtime_feedback
-- Purpose: User feedback on tool/skill runs
-- =====================================================
CREATE TABLE IF NOT EXISTS runtime_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  run_id UUID REFERENCES runtime_runs(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(run_id)
);

CREATE INDEX IF NOT EXISTS runtime_feedback_user_id_idx ON runtime_feedback(user_id);
CREATE INDEX IF NOT EXISTS runtime_feedback_run_id_idx ON runtime_feedback(run_id);

ALTER TABLE runtime_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runtime_feedback_select_own"
  ON runtime_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "runtime_feedback_insert_own"
  ON runtime_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_feedback_update_own"
  ON runtime_feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runtime_feedback_delete_own"
  ON runtime_feedback FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE runtime_feedback IS 'User feedback on tool/skill run results';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS runtime_feedback CASCADE;
-- DROP TABLE IF EXISTS runtime_outputs CASCADE;
-- DROP TABLE IF EXISTS runtime_runs CASCADE;
-- DROP TABLE IF EXISTS runtime_tools CASCADE;
