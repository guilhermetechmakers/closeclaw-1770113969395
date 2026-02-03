-- =====================================================
-- Migration: About / Help page tables
-- Created: 2025-02-03T50:00:00Z
-- Tables: help_faqs, help_doc_links, support_requests, help_changelog
-- Purpose: FAQs, documentation links, support requests, changelog for Help page
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
-- TABLE: help_faqs
-- Purpose: Frequently asked questions (public read)
-- =====================================================
CREATE TABLE IF NOT EXISTS help_faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT help_faqs_question_not_empty CHECK (length(trim(question_text)) > 0),
  CONSTRAINT help_faqs_answer_not_empty CHECK (length(trim(answer_text)) > 0)
);

CREATE INDEX IF NOT EXISTS help_faqs_category_idx ON help_faqs(category);
CREATE INDEX IF NOT EXISTS help_faqs_sort_order_idx ON help_faqs(sort_order);

DROP TRIGGER IF EXISTS update_help_faqs_updated_at ON help_faqs;
CREATE TRIGGER update_help_faqs_updated_at
  BEFORE UPDATE ON help_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE help_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_faqs_select_all"
  ON help_faqs FOR SELECT
  USING (true);

COMMENT ON TABLE help_faqs IS 'FAQ entries for About/Help page; public read';

-- =====================================================
-- TABLE: help_doc_links
-- Purpose: Documentation links (public read)
-- =====================================================
CREATE TABLE IF NOT EXISTS help_doc_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT help_doc_links_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT help_doc_links_url_not_empty CHECK (length(trim(url)) > 0)
);

CREATE INDEX IF NOT EXISTS help_doc_links_category_idx ON help_doc_links(category);
CREATE INDEX IF NOT EXISTS help_doc_links_sort_order_idx ON help_doc_links(sort_order);

DROP TRIGGER IF EXISTS update_help_doc_links_updated_at ON help_doc_links;
CREATE TRIGGER update_help_doc_links_updated_at
  BEFORE UPDATE ON help_doc_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE help_doc_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_doc_links_select_all"
  ON help_doc_links FOR SELECT
  USING (true);

COMMENT ON TABLE help_doc_links IS 'Documentation links for About/Help page; public read';

-- =====================================================
-- TABLE: support_requests
-- Purpose: Support contact form submissions (user_id optional for anon)
-- =====================================================
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  context_info JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT support_requests_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT support_requests_email_not_empty CHECK (length(trim(email)) > 0),
  CONSTRAINT support_requests_description_not_empty CHECK (length(trim(issue_description)) > 0)
);

CREATE INDEX IF NOT EXISTS support_requests_user_id_idx ON support_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_requests_status_idx ON support_requests(status);
CREATE INDEX IF NOT EXISTS support_requests_created_at_idx ON support_requests(created_at DESC);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_requests_insert_any"
  ON support_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "support_requests_select_own"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE support_requests IS 'Support contact form submissions; insert by anyone, select own';

-- =====================================================
-- TABLE: help_changelog
-- Purpose: Changelog entries (public read)
-- =====================================================
CREATE TABLE IF NOT EXISTS help_changelog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version_number TEXT,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT help_changelog_description_not_empty CHECK (length(trim(description)) > 0)
);

CREATE INDEX IF NOT EXISTS help_changelog_date_idx ON help_changelog(date DESC);
CREATE INDEX IF NOT EXISTS help_changelog_created_at_idx ON help_changelog(created_at DESC);

ALTER TABLE help_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_changelog_select_all"
  ON help_changelog FOR SELECT
  USING (true);

COMMENT ON TABLE help_changelog IS 'Changelog for About/Help page; public read';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS help_changelog CASCADE;
-- DROP TABLE IF EXISTS support_requests CASCADE;
-- DROP TABLE IF EXISTS help_doc_links CASCADE;
-- DROP TABLE IF EXISTS help_faqs CASCADE;
