-- =====================================================
-- Migration: Library skills (browse, install, enable/disable)
-- Created: 2025-02-03T00:00:00Z
-- Tables: library_skills
-- Purpose: Skills Library – installed skills per user with provenance, enable/disable, last run, eligibility
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
-- TABLE: library_skills
-- Purpose: Installed skills from registry per user (metadata, enable toggle, last run, eligibility)
-- =====================================================
CREATE TABLE IF NOT EXISTS library_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  registry_slug TEXT,
  hash TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  binary_requirements JSONB DEFAULT '[]'::jsonb,
  environment_requirements JSONB DEFAULT '[]'::jsonb,
  readme_content TEXT DEFAULT '',
  frontmatter JSONB DEFAULT '{}'::jsonb,
  signature_status TEXT CHECK (signature_status IS NULL OR signature_status IN ('verified', 'unverified', 'quarantined', 'unknown')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  eligibility_status TEXT NOT NULL DEFAULT 'unknown' CHECK (eligibility_status IN ('eligible', 'ineligible', 'unknown')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT library_skills_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS library_skills_user_id_idx ON library_skills(user_id);
CREATE INDEX IF NOT EXISTS library_skills_registry_slug_idx ON library_skills(registry_slug);
CREATE INDEX IF NOT EXISTS library_skills_enabled_idx ON library_skills(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS library_skills_created_at_idx ON library_skills(created_at DESC);

DROP TRIGGER IF EXISTS update_library_skills_updated_at ON library_skills;
CREATE TRIGGER update_library_skills_updated_at
  BEFORE UPDATE ON library_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE library_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_skills_select_own"
  ON library_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "library_skills_insert_own"
  ON library_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_skills_update_own"
  ON library_skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_skills_delete_own"
  ON library_skills FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE library_skills IS 'Installed skills from registry per user: metadata, enable/disable, last run, eligibility';
COMMENT ON COLUMN library_skills.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN library_skills.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN library_skills.registry_slug IS 'Registry identifier for updates and provenance';
COMMENT ON COLUMN library_skills.signature_status IS 'Provenance/signature verification status';
COMMENT ON COLUMN library_skills.eligibility_status IS 'Workspace eligibility (gating checks)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS library_skills CASCADE;
