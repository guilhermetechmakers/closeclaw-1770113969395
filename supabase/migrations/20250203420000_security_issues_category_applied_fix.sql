-- =====================================================
-- Migration: Add category and applied_fix to security_issues
-- Created: 2025-02-03
-- Tables: security_issues (modified)
-- Purpose: Category for findings (misconfigurations, risky permissions), AppliedFix for manual remediation
-- =====================================================

-- Category: e.g. misconfigurations, risky_permissions, plaintext_secrets, open_binds
ALTER TABLE security_issues
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE security_issues
  ADD COLUMN IF NOT EXISTS applied_fix TEXT;

CREATE INDEX IF NOT EXISTS security_issues_category_idx ON security_issues(category) WHERE category IS NOT NULL;

COMMENT ON COLUMN security_issues.category IS 'Finding category: misconfigurations, risky_permissions, plaintext_secrets, open_binds';
COMMENT ON COLUMN security_issues.applied_fix IS 'User-applied or auto-applied fix description for compliance';
