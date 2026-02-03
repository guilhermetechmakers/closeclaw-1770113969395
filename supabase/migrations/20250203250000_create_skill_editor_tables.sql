-- =====================================================
-- Migration: Skill Editor tables (skills, skill_test_runs, skill_versions)
-- Created: 2025-02-03T25:00:00Z
-- Tables: skills, skill_test_runs, skill_versions
-- Purpose: Skills workspace for SKILL.md editing, test runs, and versioning
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
-- TABLE: skills
-- Purpose: Skill definitions (SKILL.md content, name, version)
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0.0',
  frontmatter JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT skills_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS skills_user_id_idx ON skills(user_id);
CREATE INDEX IF NOT EXISTS skills_created_at_idx ON skills(created_at DESC);
CREATE INDEX IF NOT EXISTS skills_status_idx ON skills(status) WHERE status != 'archived';

DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_own"
  ON skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skills_insert_own"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_update_own"
  ON skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_delete_own"
  ON skills FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE skills IS 'Skill definitions with SKILL.md content and frontmatter for Skill Editor';

-- =====================================================
-- TABLE: skill_test_runs
-- Purpose: Sandbox test run results (logs, outputs) per skill
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_test_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'aborted')),
  logs TEXT,
  outputs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS skill_test_runs_skill_id_idx ON skill_test_runs(skill_id);
CREATE INDEX IF NOT EXISTS skill_test_runs_user_id_idx ON skill_test_runs(user_id);
CREATE INDEX IF NOT EXISTS skill_test_runs_created_at_idx ON skill_test_runs(created_at DESC);

DROP TRIGGER IF EXISTS update_skill_test_runs_updated_at ON skill_test_runs;
CREATE TRIGGER update_skill_test_runs_updated_at
  BEFORE UPDATE ON skill_test_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE skill_test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_test_runs_select_own"
  ON skill_test_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skill_test_runs_insert_own"
  ON skill_test_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_test_runs_update_own"
  ON skill_test_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_test_runs_delete_own"
  ON skill_test_runs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE skill_test_runs IS 'Test run results for skills (sandbox execution logs and outputs)';

-- =====================================================
-- TABLE: skill_versions
-- Purpose: Version history for skills (version_number, changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_number TEXT NOT NULL,
  changes TEXT,
  content_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT skill_versions_version_not_empty CHECK (length(trim(version_number)) > 0)
);

CREATE INDEX IF NOT EXISTS skill_versions_skill_id_idx ON skill_versions(skill_id);
CREATE INDEX IF NOT EXISTS skill_versions_user_id_idx ON skill_versions(user_id);
CREATE INDEX IF NOT EXISTS skill_versions_created_at_idx ON skill_versions(created_at DESC);

ALTER TABLE skill_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_versions_select_own"
  ON skill_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skill_versions_insert_own"
  ON skill_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_versions_delete_own"
  ON skill_versions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE skill_versions IS 'Version history for skills with change notes';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS skill_versions CASCADE;
-- DROP TABLE IF EXISTS skill_test_runs CASCADE;
-- DROP TABLE IF EXISTS skills CASCADE;
