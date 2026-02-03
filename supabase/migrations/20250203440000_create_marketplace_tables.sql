-- =====================================================
-- Migration: Payments & Marketplace tables
-- Created: 2025-02-03T44:00:00Z
-- Tables: marketplace_skills, marketplace_transactions, marketplace_licenses
-- Purpose: Catalog of purchasable skills, transactions, and user licenses
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
-- TABLE: marketplace_skills
-- Purpose: Catalog of curated/signed skills available for purchase
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  provider_id TEXT,
  image_url TEXT,
  is_subscription BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT marketplace_skills_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS marketplace_skills_category_idx ON marketplace_skills(category);
CREATE INDEX IF NOT EXISTS marketplace_skills_status_idx ON marketplace_skills(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS marketplace_skills_created_at_idx ON marketplace_skills(created_at DESC);

DROP TRIGGER IF EXISTS update_marketplace_skills_updated_at ON marketplace_skills;
CREATE TRIGGER update_marketplace_skills_updated_at
  BEFORE UPDATE ON marketplace_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE marketplace_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_skills_select_authenticated"
  ON marketplace_skills FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE marketplace_skills IS 'Catalog of premium skills available in the marketplace';

-- =====================================================
-- TABLE: marketplace_transactions
-- Purpose: Purchase and subscription payment records
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES marketplace_skills(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  stripe_payment_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS marketplace_transactions_user_id_idx ON marketplace_transactions(user_id);
CREATE INDEX IF NOT EXISTS marketplace_transactions_skill_id_idx ON marketplace_transactions(skill_id);
CREATE INDEX IF NOT EXISTS marketplace_transactions_status_idx ON marketplace_transactions(status);
CREATE INDEX IF NOT EXISTS marketplace_transactions_created_at_idx ON marketplace_transactions(created_at DESC);

DROP TRIGGER IF EXISTS update_marketplace_transactions_updated_at ON marketplace_transactions;
CREATE TRIGGER update_marketplace_transactions_updated_at
  BEFORE UPDATE ON marketplace_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_transactions_select_own"
  ON marketplace_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "marketplace_transactions_insert_own"
  ON marketplace_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE marketplace_transactions IS 'User purchase and subscription transaction records';

-- =====================================================
-- TABLE: marketplace_licenses
-- Purpose: User license entitlements for purchased skills
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES marketplace_skills(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES marketplace_transactions(id) ON DELETE SET NULL,
  activation_status TEXT NOT NULL DEFAULT 'active' CHECK (activation_status IN ('active', 'inactive', 'expired')),
  expiration_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS marketplace_licenses_user_id_idx ON marketplace_licenses(user_id);
CREATE INDEX IF NOT EXISTS marketplace_licenses_skill_id_idx ON marketplace_licenses(skill_id);
CREATE INDEX IF NOT EXISTS marketplace_licenses_activation_status_idx ON marketplace_licenses(activation_status);
CREATE INDEX IF NOT EXISTS marketplace_licenses_expiration_date_idx ON marketplace_licenses(expiration_date);

DROP TRIGGER IF EXISTS update_marketplace_licenses_updated_at ON marketplace_licenses;
CREATE TRIGGER update_marketplace_licenses_updated_at
  BEFORE UPDATE ON marketplace_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE marketplace_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_licenses_select_own"
  ON marketplace_licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "marketplace_licenses_update_own"
  ON marketplace_licenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE marketplace_licenses IS 'User license entitlements for purchased marketplace skills';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS marketplace_licenses CASCADE;
-- DROP TABLE IF EXISTS marketplace_transactions CASCADE;
-- DROP TABLE IF EXISTS marketplace_skills CASCADE;
