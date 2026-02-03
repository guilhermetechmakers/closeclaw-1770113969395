-- =====================================================
-- Migration: Redaction rules for logs/traces
-- Created: 2025-02-03T45:00:00Z
-- Tables: redaction_rules
-- Purpose: Per-user rules for which log/trace fields to redact (privacy compliance)
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
-- TABLE: redaction_rules
-- Purpose: Field-level redaction rules for log/trace export and storage
-- =====================================================
CREATE TABLE IF NOT EXISTS redaction_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  is_redacted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT redaction_rules_field_name_not_empty CHECK (length(trim(field_name)) > 0)
);

CREATE INDEX IF NOT EXISTS redaction_rules_user_id_idx ON redaction_rules(user_id);
CREATE INDEX IF NOT EXISTS redaction_rules_field_name_idx ON redaction_rules(field_name);
CREATE UNIQUE INDEX IF NOT EXISTS redaction_rules_user_field_idx ON redaction_rules(user_id, field_name);

DROP TRIGGER IF EXISTS update_redaction_rules_updated_at ON redaction_rules;
CREATE TRIGGER update_redaction_rules_updated_at
  BEFORE UPDATE ON redaction_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE redaction_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redaction_rules_select_own"
  ON redaction_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "redaction_rules_insert_own"
  ON redaction_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "redaction_rules_update_own"
  ON redaction_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "redaction_rules_delete_own"
  ON redaction_rules FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE redaction_rules IS 'Per-user rules for redacting log/trace fields (privacy compliance)';
COMMENT ON COLUMN redaction_rules.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN redaction_rules.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN redaction_rules.field_name IS 'Log/trace field name to redact (e.g. message, metadata)';
COMMENT ON COLUMN redaction_rules.is_redacted IS 'When true, this field is redacted in export and preview';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS redaction_rules CASCADE;
