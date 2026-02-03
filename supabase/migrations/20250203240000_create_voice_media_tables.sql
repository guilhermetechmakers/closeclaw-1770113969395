-- =====================================================
-- Migration: Voice & Media (wake_words, talk_mode_settings, transcription_backends, tts_provider_settings, media_settings)
-- Created: 2025-02-03T24:00:00Z
-- Tables: wake_words, talk_mode_settings, transcription_backends, tts_provider_settings, media_settings
-- Purpose: Voice wake words, talk mode per node, transcription/TTS config, media storage settings
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
-- TABLE: wake_words
-- Purpose: Voice wake words with optional propagation to nodes
-- =====================================================
CREATE TABLE IF NOT EXISTS wake_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  propagate_to_nodes BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT wake_words_word_not_empty CHECK (length(trim(word)) > 0)
);

CREATE INDEX IF NOT EXISTS wake_words_user_id_idx ON wake_words(user_id);
CREATE INDEX IF NOT EXISTS wake_words_status_idx ON wake_words(status);

DROP TRIGGER IF EXISTS update_wake_words_updated_at ON wake_words;
CREATE TRIGGER update_wake_words_updated_at
  BEFORE UPDATE ON wake_words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE wake_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wake_words_select_own"
  ON wake_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "wake_words_insert_own"
  ON wake_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wake_words_update_own"
  ON wake_words FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wake_words_delete_own"
  ON wake_words FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE wake_words IS 'Voice wake words with propagation to connected nodes';

-- =====================================================
-- TABLE: talk_mode_settings
-- Purpose: Talk mode enabled and interrupt sensitivity per node (node_id NULL = default)
-- =====================================================
CREATE TABLE IF NOT EXISTS talk_mode_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id UUID NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  interrupt_sensitivity TEXT NOT NULL DEFAULT 'medium' CHECK (interrupt_sensitivity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT talk_mode_settings_user_node_unique UNIQUE (user_id, node_id)
);

CREATE INDEX IF NOT EXISTS talk_mode_settings_user_id_idx ON talk_mode_settings(user_id);
CREATE INDEX IF NOT EXISTS talk_mode_settings_node_id_idx ON talk_mode_settings(node_id);

DROP TRIGGER IF EXISTS update_talk_mode_settings_updated_at ON talk_mode_settings;
CREATE TRIGGER update_talk_mode_settings_updated_at
  BEFORE UPDATE ON talk_mode_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE talk_mode_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talk_mode_settings_select_own"
  ON talk_mode_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "talk_mode_settings_insert_own"
  ON talk_mode_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "talk_mode_settings_update_own"
  ON talk_mode_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "talk_mode_settings_delete_own"
  ON talk_mode_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE talk_mode_settings IS 'Talk mode and interrupt sensitivity per node';

-- =====================================================
-- TABLE: transcription_backends
-- Purpose: User transcription provider order and CLI fallback (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS transcription_backends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  cli_fallback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS transcription_backends_user_id_idx ON transcription_backends(user_id);

DROP TRIGGER IF EXISTS update_transcription_backends_updated_at ON transcription_backends;
CREATE TRIGGER update_transcription_backends_updated_at
  BEFORE UPDATE ON transcription_backends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE transcription_backends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transcription_backends_select_own"
  ON transcription_backends FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transcription_backends_insert_own"
  ON transcription_backends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transcription_backends_update_own"
  ON transcription_backends FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transcription_backends_delete_own"
  ON transcription_backends FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE transcription_backends IS 'Transcription provider order and CLI fallback per user';

-- =====================================================
-- TABLE: tts_provider_settings
-- Purpose: TTS provider and model selection (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS tts_provider_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'default',
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT tts_provider_settings_provider_not_empty CHECK (length(trim(provider)) > 0)
);

CREATE INDEX IF NOT EXISTS tts_provider_settings_user_id_idx ON tts_provider_settings(user_id);

DROP TRIGGER IF EXISTS update_tts_provider_settings_updated_at ON tts_provider_settings;
CREATE TRIGGER update_tts_provider_settings_updated_at
  BEFORE UPDATE ON tts_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tts_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tts_provider_settings_select_own"
  ON tts_provider_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tts_provider_settings_insert_own"
  ON tts_provider_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tts_provider_settings_update_own"
  ON tts_provider_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tts_provider_settings_delete_own"
  ON tts_provider_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE tts_provider_settings IS 'TTS provider and model per user';

-- =====================================================
-- TABLE: media_settings
-- Purpose: Media retention, size cap, fallback strategy (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS media_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL DEFAULT 30 CHECK (retention_days > 0 AND retention_days <= 3650),
  size_cap_mb INTEGER NOT NULL DEFAULT 1024 CHECK (size_cap_mb > 0 AND size_cap_mb <= 1048576),
  fallback_strategy TEXT NOT NULL DEFAULT 'local' CHECK (fallback_strategy IN ('local', 'cloud', 'none')),
  audio_note_handling TEXT NOT NULL DEFAULT 'store' CHECK (audio_note_handling IN ('store', 'transcribe_and_store', 'transcribe_only', 'discard')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS media_settings_user_id_idx ON media_settings(user_id);

DROP TRIGGER IF EXISTS update_media_settings_updated_at ON media_settings;
CREATE TRIGGER update_media_settings_updated_at
  BEFORE UPDATE ON media_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE media_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_settings_select_own"
  ON media_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "media_settings_insert_own"
  ON media_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_settings_update_own"
  ON media_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_settings_delete_own"
  ON media_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE media_settings IS 'Media retention, size cap, and fallback per user';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS media_settings CASCADE;
-- DROP TABLE IF EXISTS tts_provider_settings CASCADE;
-- DROP TABLE IF EXISTS transcription_backends CASCADE;
-- DROP TABLE IF EXISTS talk_mode_settings CASCADE;
-- DROP TABLE IF EXISTS wake_words CASCADE;
