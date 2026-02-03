-- =====================================================
-- Migration: Terms of Service – user agreements and decline feedback
-- Created: 2025-02-03T00:00:00Z
-- Tables: user_agreements, terms_decline_feedback
-- Purpose: Record user acceptance/declination of terms (version = policy_documents id); capture feedback when declining
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
-- TABLE: user_agreements
-- Purpose: Records user acceptance or declination of a terms version (policy_documents id)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_agreements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  policy_document_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'declined')),
  agreed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_agreements_policy_document_fk
    FOREIGN KEY (policy_document_id) REFERENCES policy_documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS user_agreements_user_id_idx ON user_agreements(user_id);
CREATE INDEX IF NOT EXISTS user_agreements_policy_document_id_idx ON user_agreements(policy_document_id);
CREATE INDEX IF NOT EXISTS user_agreements_agreed_at_idx ON user_agreements(agreed_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS user_agreements_user_version_unique
  ON user_agreements(user_id, policy_document_id);

DROP TRIGGER IF EXISTS update_user_agreements_updated_at ON user_agreements;
CREATE TRIGGER update_user_agreements_updated_at
  BEFORE UPDATE ON user_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_agreements_select_own"
  ON user_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_agreements_insert_own"
  ON user_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_agreements_update_own"
  ON user_agreements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE user_agreements IS 'User acceptance or declination of terms versions (policy_documents)';
COMMENT ON COLUMN user_agreements.policy_document_id IS 'Terms version (references policy_documents where document_type=terms)';
COMMENT ON COLUMN user_agreements.status IS 'accepted or declined';

-- =====================================================
-- TABLE: terms_decline_feedback
-- Purpose: Optional feedback when a user declines the terms (comments, linked to agreement)
-- =====================================================
CREATE TABLE IF NOT EXISTS terms_decline_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_agreement_id UUID REFERENCES user_agreements(id) ON DELETE SET NULL,
  comments TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS terms_decline_feedback_user_id_idx ON terms_decline_feedback(user_id);
CREATE INDEX IF NOT EXISTS terms_decline_feedback_created_at_idx ON terms_decline_feedback(created_at DESC);

ALTER TABLE terms_decline_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terms_decline_feedback_select_own"
  ON terms_decline_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "terms_decline_feedback_insert_own"
  ON terms_decline_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE terms_decline_feedback IS 'Feedback submitted when user declines terms of service';
COMMENT ON COLUMN terms_decline_feedback.user_agreement_id IS 'Optional link to the declined agreement record';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS terms_decline_feedback CASCADE;
-- DROP TABLE IF EXISTS user_agreements CASCADE;
