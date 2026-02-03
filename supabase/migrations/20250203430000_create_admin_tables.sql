-- =====================================================
-- Migration: Admin & Analytics tables (workspaces, members, licenses, metrics)
-- Created: 2025-02-03T43:00:00Z
-- Tables: admin_workspaces, admin_workspace_members, admin_licenses, admin_analytics_metrics
-- Purpose: Multi-workspace management, user provisioning, license controls, analytics
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
-- TABLE: admin_workspaces
-- Purpose: Workspace definitions for multi-tenant admin
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  active_users_count INTEGER DEFAULT 0 NOT NULL,
  configuration_details JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT admin_workspaces_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS admin_workspaces_status_idx ON admin_workspaces(status);
CREATE INDEX IF NOT EXISTS admin_workspaces_created_at_idx ON admin_workspaces(created_at DESC);

DROP TRIGGER IF EXISTS update_admin_workspaces_updated_at ON admin_workspaces;
CREATE TRIGGER update_admin_workspaces_updated_at
  BEFORE UPDATE ON admin_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE admin_workspaces ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users; in production restrict via app_metadata.role = 'admin'
CREATE POLICY "admin_workspaces_select_authenticated"
  ON admin_workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_workspaces_insert_authenticated"
  ON admin_workspaces FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_workspaces_update_authenticated"
  ON admin_workspaces FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_workspaces_delete_authenticated"
  ON admin_workspaces FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE admin_workspaces IS 'Admin workspaces for multi-tenant management';

-- =====================================================
-- TABLE: admin_workspace_members
-- Purpose: User assignments to workspaces (roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES admin_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS admin_workspace_members_workspace_id_idx ON admin_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS admin_workspace_members_user_id_idx ON admin_workspace_members(user_id);

DROP TRIGGER IF EXISTS update_admin_workspace_members_updated_at ON admin_workspace_members;
CREATE TRIGGER update_admin_workspace_members_updated_at
  BEFORE UPDATE ON admin_workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE admin_workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_workspace_members_select_authenticated"
  ON admin_workspace_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_workspace_members_insert_authenticated"
  ON admin_workspace_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_workspace_members_update_authenticated"
  ON admin_workspace_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_workspace_members_delete_authenticated"
  ON admin_workspace_members FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE admin_workspace_members IS 'User workspace assignments and roles';

-- =====================================================
-- TABLE: admin_licenses
-- Purpose: License allocation per workspace/user
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES admin_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('seat', 'pro', 'enterprise', 'trial')),
  expiry_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_licenses_workspace_id_idx ON admin_licenses(workspace_id);
CREATE INDEX IF NOT EXISTS admin_licenses_user_id_idx ON admin_licenses(user_id);
CREATE INDEX IF NOT EXISTS admin_licenses_expiry_date_idx ON admin_licenses(expiry_date);

DROP TRIGGER IF EXISTS update_admin_licenses_updated_at ON admin_licenses;
CREATE TRIGGER update_admin_licenses_updated_at
  BEFORE UPDATE ON admin_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE admin_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_licenses_select_authenticated"
  ON admin_licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_licenses_insert_authenticated"
  ON admin_licenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_licenses_update_authenticated"
  ON admin_licenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_licenses_delete_authenticated"
  ON admin_licenses FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE admin_licenses IS 'License allocations for workspaces and users';

-- =====================================================
-- TABLE: admin_analytics_metrics
-- Purpose: Aggregated metrics for analytics dashboards
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_analytics_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES admin_workspaces(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  bucket_time TIMESTAMPTZ NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_analytics_metrics_workspace_id_idx ON admin_analytics_metrics(workspace_id);
CREATE INDEX IF NOT EXISTS admin_analytics_metrics_metric_type_idx ON admin_analytics_metrics(metric_type);
CREATE INDEX IF NOT EXISTS admin_analytics_metrics_bucket_time_idx ON admin_analytics_metrics(bucket_time DESC);

ALTER TABLE admin_analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_analytics_metrics_select_authenticated"
  ON admin_analytics_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_analytics_metrics_insert_authenticated"
  ON admin_analytics_metrics FOR INSERT TO authenticated WITH CHECK (true);

COMMENT ON TABLE admin_analytics_metrics IS 'Analytics metrics for admin dashboards (sessions, runs, skill installs)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS admin_analytics_metrics CASCADE;
-- DROP TABLE IF EXISTS admin_licenses CASCADE;
-- DROP TABLE IF EXISTS admin_workspace_members CASCADE;
-- DROP TABLE IF EXISTS admin_workspaces CASCADE;
