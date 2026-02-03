import { supabase } from '@/lib/supabase';
import type {
  PrivacyPolicySetting,
  PrivacyPolicySettingInsert,
  PrivacyPolicySettingUpdate,
  PolicyDocument,
} from '@/types/database';

export const privacyApi = {
  /**
   * Get the current user's privacy/telemetry preferences.
   * Returns null if not authenticated or no row exists.
   */
  getPrivacySettings: async (): Promise<PrivacyPolicySetting | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('privacy_policy_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as PrivacyPolicySetting | null;
  },

  /**
   * Upsert privacy settings for the current user (create or update telemetry opt-out).
   */
  updatePrivacySettings: async (
    payload: PrivacyPolicySettingUpdate
  ): Promise<PrivacyPolicySetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: PrivacyPolicySettingInsert & PrivacyPolicySettingUpdate = {
      user_id: user.id,
      ...payload,
    };
    const { data, error } = await supabase
      .from('privacy_policy_settings')
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PrivacyPolicySetting;
  },

  /**
   * Ensure a row exists for the current user (e.g. on first visit). Idempotent.
   */
  ensurePrivacySettings: async (): Promise<PrivacyPolicySetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const existing = await privacyApi.getPrivacySettings();
    if (existing) return existing;
    const row: PrivacyPolicySettingInsert = { user_id: user.id };
    const { data, error } = await supabase
      .from('privacy_policy_settings')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PrivacyPolicySetting;
  },

  /**
   * Get the latest privacy policy document by effective date (for display and download).
   * Public read; no auth required.
   */
  getCurrentPolicyDocument: async (
    documentType: 'privacy' | 'terms' = 'privacy'
  ): Promise<PolicyDocument | null> => {
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('document_type', documentType)
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as PolicyDocument | null;
  },
};
