import { supabase } from '@/lib/supabase';
import type {
  WakeWord,
  WakeWordInsert,
  WakeWordUpdate,
  TalkModeSetting,
  TalkModeSettingInsert,
  TalkModeSettingUpdate,
  TranscriptionBackend,
  TranscriptionBackendInsert,
  TranscriptionBackendUpdate,
  TtsProviderSetting,
  TtsProviderSettingInsert,
  TtsProviderSettingUpdate,
  MediaSetting,
  MediaSettingInsert,
  MediaSettingUpdate,
} from '@/types/database';

export const voiceApi = {
  // Wake words
  getWakeWords: async (): Promise<WakeWord[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('wake_words')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as WakeWord[];
  },

  createWakeWord: async (payload: Omit<WakeWordInsert, 'user_id'>): Promise<WakeWord> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: WakeWordInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('wake_words')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as WakeWord;
  },

  updateWakeWord: async (id: string, payload: WakeWordUpdate): Promise<WakeWord> => {
    const { data, error } = await supabase
      .from('wake_words')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as WakeWord;
  },

  deleteWakeWord: async (id: string): Promise<void> => {
    const { error } = await supabase.from('wake_words').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Talk mode settings (per node; node_id null = default)
  getTalkModeSettings: async (): Promise<TalkModeSetting[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('talk_mode_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('node_id', { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TalkModeSetting[];
  },

  getTalkModeSetting: async (nodeId: string | null): Promise<TalkModeSetting | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    let query = supabase
      .from('talk_mode_settings')
      .select('*')
      .eq('user_id', user.id);
    if (nodeId === null) {
      query = query.is('node_id', null);
    } else {
      query = query.eq('node_id', nodeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return data as TalkModeSetting | null;
  },

  upsertTalkModeSetting: async (
    payload: Omit<TalkModeSettingInsert, 'user_id'>
  ): Promise<TalkModeSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row = { ...payload, user_id: user.id, node_id: payload.node_id ?? null };
    const { data, error } = await supabase
      .from('talk_mode_settings')
      .upsert(row as never, { onConflict: 'user_id,node_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TalkModeSetting;
  },

  updateTalkModeSetting: async (id: string, payload: TalkModeSettingUpdate): Promise<TalkModeSetting> => {
    const { data, error } = await supabase
      .from('talk_mode_settings')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TalkModeSetting;
  },

  // Transcription backends (one per user)
  getTranscriptionBackends: async (): Promise<TranscriptionBackend | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('transcription_backends')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as TranscriptionBackend | null;
  },

  upsertTranscriptionBackends: async (payload: Omit<TranscriptionBackendInsert, 'user_id'>): Promise<TranscriptionBackend> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: TranscriptionBackendInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('transcription_backends')
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TranscriptionBackend;
  },

  updateTranscriptionBackends: async (payload: TranscriptionBackendUpdate): Promise<TranscriptionBackend> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('transcription_backends')
      .update(payload as never)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TranscriptionBackend;
  },

  // TTS provider settings (one per user)
  getTtsProviderSetting: async (): Promise<TtsProviderSetting | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('tts_provider_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as TtsProviderSetting | null;
  },

  upsertTtsProviderSetting: async (payload: Omit<TtsProviderSettingInsert, 'user_id'>): Promise<TtsProviderSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: TtsProviderSettingInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('tts_provider_settings')
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TtsProviderSetting;
  },

  updateTtsProviderSetting: async (payload: TtsProviderSettingUpdate): Promise<TtsProviderSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('tts_provider_settings')
      .update(payload as never)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TtsProviderSetting;
  },

  // Media settings (one per user)
  getMediaSetting: async (): Promise<MediaSetting | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('media_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as MediaSetting | null;
  },

  upsertMediaSetting: async (payload: Omit<MediaSettingInsert, 'user_id'>): Promise<MediaSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: MediaSettingInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('media_settings')
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as MediaSetting;
  },

  updateMediaSetting: async (payload: MediaSettingUpdate): Promise<MediaSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('media_settings')
      .update(payload as never)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as MediaSetting;
  },
};
