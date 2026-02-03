-- =====================================================
-- Migration: Password reset requests (audit)
-- Created: 2025-02-03T14:00:00Z
-- Tables: password_reset_requests
-- Purpose: Audit log for password reset flow; Supabase Auth handles tokens.
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: password_reset_requests
-- Purpose: Track password reset requests and completions for audit.
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'completed', 'expired')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS password_reset_requests_user_id_idx ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS password_reset_requests_request_time_idx ON password_reset_requests(request_time DESC);
CREATE INDEX IF NOT EXISTS password_reset_requests_status_idx ON password_reset_requests(status);

-- Enable Row Level Security
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only read their own rows; insert allowed for own user_id or null (requested)
CREATE POLICY "password_reset_requests_select_own"
  ON password_reset_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "password_reset_requests_insert_own_or_requested"
  ON password_reset_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "password_reset_requests_update_own"
  ON password_reset_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE password_reset_requests IS 'Audit log for password reset requests and completions; Supabase Auth handles tokens.';
COMMENT ON COLUMN password_reset_requests.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN password_reset_requests.user_id IS 'User who requested or completed reset (null when request only, from email flow).';
COMMENT ON COLUMN password_reset_requests.status IS 'requested | completed | expired';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS password_reset_requests CASCADE;
