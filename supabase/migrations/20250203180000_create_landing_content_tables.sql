-- =====================================================
-- Migration: Landing page content tables
-- Created: 2025-02-03T18:00:00Z
-- Tables: landing_features, landing_integration_logos, landing_pricing_plans
-- Purpose: CMS-style content for landing page (features, integrations, pricing).
--          Public read; write via service role or future admin.
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
-- TABLE: landing_features
-- Purpose: Feature grid items (name, description, icon)
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT landing_features_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS landing_features_sort_order_idx ON landing_features(sort_order);

DROP TRIGGER IF EXISTS update_landing_features_updated_at ON landing_features;
CREATE TRIGGER update_landing_features_updated_at
  BEFORE UPDATE ON landing_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE landing_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_features_select_public"
  ON landing_features FOR SELECT
  USING (true);

COMMENT ON TABLE landing_features IS 'Landing page feature grid items; public read.';

-- =====================================================
-- TABLE: landing_integration_logos
-- Purpose: Chat and model provider logos for integrations section
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_integration_logos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('chat', 'model')),
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT landing_integration_logos_provider_not_empty CHECK (length(trim(provider_name)) > 0)
);

CREATE INDEX IF NOT EXISTS landing_integration_logos_category_idx ON landing_integration_logos(category);
CREATE INDEX IF NOT EXISTS landing_integration_logos_sort_order_idx ON landing_integration_logos(sort_order);

DROP TRIGGER IF EXISTS update_landing_integration_logos_updated_at ON landing_integration_logos;
CREATE TRIGGER update_landing_integration_logos_updated_at
  BEFORE UPDATE ON landing_integration_logos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE landing_integration_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_integration_logos_select_public"
  ON landing_integration_logos FOR SELECT
  USING (true);

COMMENT ON TABLE landing_integration_logos IS 'Landing page integration logos; public read.';

-- =====================================================
-- TABLE: landing_pricing_plans
-- Purpose: Pricing teaser (plan name, description, price, features)
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_pricing_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT landing_pricing_plans_plan_name_not_empty CHECK (length(trim(plan_name)) > 0)
);

CREATE INDEX IF NOT EXISTS landing_pricing_plans_sort_order_idx ON landing_pricing_plans(sort_order);

DROP TRIGGER IF EXISTS update_landing_pricing_plans_updated_at ON landing_pricing_plans;
CREATE TRIGGER update_landing_pricing_plans_updated_at
  BEFORE UPDATE ON landing_pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE landing_pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_pricing_plans_select_public"
  ON landing_pricing_plans FOR SELECT
  USING (true);

COMMENT ON TABLE landing_pricing_plans IS 'Landing page pricing plans; public read.';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS landing_pricing_plans CASCADE;
-- DROP TABLE IF EXISTS landing_integration_logos CASCADE;
-- DROP TABLE IF EXISTS landing_features CASCADE;
