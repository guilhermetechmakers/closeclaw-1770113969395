import { supabase } from '@/lib/supabase';
import type {
  BrowserProfile,
  BrowserProfileInsert,
  BrowserProfileUpdate,
  BrowserTab,
  BrowserTabInsert,
  BrowserTabUpdate,
  BrowserScript,
  BrowserScriptInsert,
  BrowserScriptUpdate,
  BrowserCaptureRecord,
  BrowserCaptureRecordInsert,
  BrowserCdpToken,
  BrowserCdpTokenInsert,
  BrowserCdpTokenUpdate,
} from '@/types/database';

export const browserApi = {
  // Browser profiles
  getProfiles: async (): Promise<BrowserProfile[]> => {
    const { data, error } = await supabase
      .from('browser_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserProfile[];
  },

  getProfile: async (id: string): Promise<BrowserProfile | null> => {
    const { data, error } = await supabase
      .from('browser_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as BrowserProfile;
  },

  createProfile: async (payload: Omit<BrowserProfileInsert, 'user_id'>): Promise<BrowserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: BrowserProfileInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('browser_profiles')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserProfile;
  },

  updateProfile: async (id: string, payload: BrowserProfileUpdate): Promise<BrowserProfile> => {
    const { data, error } = await supabase
      .from('browser_profiles')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserProfile;
  },

  deleteProfile: async (id: string): Promise<void> => {
    const { error } = await supabase.from('browser_profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Browser tabs
  getTabs: async (profileId: string | null): Promise<BrowserTab[]> => {
    if (!profileId) return [];
    const { data, error } = await supabase
      .from('browser_tabs')
      .select('*')
      .eq('browser_profile_id', profileId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserTab[];
  },

  getTab: async (id: string): Promise<BrowserTab | null> => {
    const { data, error } = await supabase
      .from('browser_tabs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as BrowserTab;
  },

  upsertTabs: async (profileId: string, tabs: Omit<BrowserTabInsert, 'browser_profile_id'>[]): Promise<BrowserTab[]> => {
    const rows: BrowserTabInsert[] = tabs.map((t) => ({ ...t, browser_profile_id: profileId }));
    const { data, error } = await supabase
      .from('browser_tabs')
      .upsert(rows as never, { onConflict: 'id' })
      .select();
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserTab[];
  },

  updateTab: async (id: string, payload: BrowserTabUpdate): Promise<BrowserTab> => {
    const { data, error } = await supabase
      .from('browser_tabs')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserTab;
  },

  deleteTab: async (id: string): Promise<void> => {
    const { error } = await supabase.from('browser_tabs').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Browser scripts
  getScripts: async (): Promise<BrowserScript[]> => {
    const { data, error } = await supabase
      .from('browser_scripts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserScript[];
  },

  getScript: async (id: string): Promise<BrowserScript | null> => {
    const { data, error } = await supabase
      .from('browser_scripts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as BrowserScript;
  },

  createScript: async (payload: Omit<BrowserScriptInsert, 'user_id'>): Promise<BrowserScript> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: BrowserScriptInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('browser_scripts')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserScript;
  },

  updateScript: async (id: string, payload: BrowserScriptUpdate): Promise<BrowserScript> => {
    const { data, error } = await supabase
      .from('browser_scripts')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserScript;
  },

  deleteScript: async (id: string): Promise<void> => {
    const { error } = await supabase.from('browser_scripts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Capture records
  getCaptureRecords: async (profileId: string | null, params?: { limit?: number; type?: string }): Promise<BrowserCaptureRecord[]> => {
    if (!profileId) return [];
    let query = supabase
      .from('browser_capture_records')
      .select('*')
      .eq('browser_profile_id', profileId)
      .order('created_at', { ascending: false });
    if (params?.type) query = query.eq('capture_type', params.type);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserCaptureRecord[];
  },

  createCaptureRecord: async (payload: Omit<BrowserCaptureRecordInsert, 'browser_profile_id'> & { browser_profile_id: string }): Promise<BrowserCaptureRecord> => {
    const { data, error } = await supabase
      .from('browser_capture_records')
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserCaptureRecord;
  },

  deleteCaptureRecord: async (id: string): Promise<void> => {
    const { error } = await supabase.from('browser_capture_records').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // CDP tokens
  getCdpTokens: async (): Promise<BrowserCdpToken[]> => {
    const { data, error } = await supabase
      .from('browser_cdp_tokens')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrowserCdpToken[];
  },

  getCdpToken: async (id: string): Promise<BrowserCdpToken | null> => {
    const { data, error } = await supabase
      .from('browser_cdp_tokens')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as BrowserCdpToken;
  },

  createCdpToken: async (payload: Omit<BrowserCdpTokenInsert, 'user_id'>): Promise<BrowserCdpToken> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: BrowserCdpTokenInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('browser_cdp_tokens')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserCdpToken;
  },

  updateCdpToken: async (id: string, payload: BrowserCdpTokenUpdate): Promise<BrowserCdpToken> => {
    const { data, error } = await supabase
      .from('browser_cdp_tokens')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as BrowserCdpToken;
  },

  deleteCdpToken: async (id: string): Promise<void> => {
    const { error } = await supabase.from('browser_cdp_tokens').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
