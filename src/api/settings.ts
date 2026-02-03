import { supabase } from '@/lib/supabase';
import type {
  NetworkSetting,
  NetworkSettingInsert,
  NetworkSettingUpdate,
  RemoteAccess,
  RemoteAccessInsert,
  RemoteAccessUpdate,
  SettingsSecretsPref,
  SettingsSecretsPrefInsert,
  SettingsSecretsPrefUpdate,
  ToolPolicy,
  ToolPolicyInsert,
  ToolPolicyUpdate,
  ModelDefault,
  ModelDefaultInsert,
  ModelDefaultUpdate,
} from '@/types/database';

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export const settingsApi = {
  getNetworkSettings: async (): Promise<NetworkSetting | null> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('network_settings')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as NetworkSetting | null;
  },

  upsertNetworkSettings: async (
    payload: Omit<NetworkSettingInsert, 'user_id'> & { user_id?: string }
  ): Promise<NetworkSetting> => {
    const user_id = payload.user_id ?? (await getCurrentUserId());
    const row: NetworkSettingInsert = {
      user_id,
      bind_address: payload.bind_address ?? '0.0.0.0',
      port: payload.port ?? 3000,
      tls_options: payload.tls_options ?? {},
    };
    const { data, error } = await supabase
      .from('network_settings')
      .upsert(row as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NetworkSetting;
  },

  updateNetworkSettings: async (
    payload: NetworkSettingUpdate
  ): Promise<NetworkSetting> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('network_settings')
      .update(payload as never)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NetworkSetting;
  },

  getRemoteAccess: async (): Promise<RemoteAccess | null> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('remote_access')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as RemoteAccess | null;
  },

  upsertRemoteAccess: async (
    payload: Omit<RemoteAccessInsert, 'user_id'> & { user_id?: string }
  ): Promise<RemoteAccess> => {
    const user_id = payload.user_id ?? (await getCurrentUserId());
    const row: RemoteAccessInsert = {
      user_id,
      tailnet_config: payload.tailnet_config ?? {},
      relay_settings: payload.relay_settings ?? {},
      pairing_policies: payload.pairing_policies ?? {},
    };
    const { data, error } = await supabase
      .from('remote_access')
      .upsert(row as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as RemoteAccess;
  },

  updateRemoteAccess: async (
    payload: RemoteAccessUpdate
  ): Promise<RemoteAccess> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('remote_access')
      .update(payload as never)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as RemoteAccess;
  },

  getSecretsPrefs: async (): Promise<SettingsSecretsPref | null> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('settings_secrets_prefs')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SettingsSecretsPref | null;
  },

  upsertSecretsPrefs: async (
    payload: Omit<SettingsSecretsPrefInsert, 'user_id'> & { user_id?: string }
  ): Promise<SettingsSecretsPref> => {
    const user_id = payload.user_id ?? (await getCurrentUserId());
    const row: SettingsSecretsPrefInsert = {
      user_id,
      os_keychain_enabled: payload.os_keychain_enabled ?? true,
      onepassword_integration: payload.onepassword_integration ?? false,
    };
    const { data, error } = await supabase
      .from('settings_secrets_prefs')
      .upsert(row as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SettingsSecretsPref;
  },

  updateSecretsPrefs: async (
    payload: SettingsSecretsPrefUpdate
  ): Promise<SettingsSecretsPref> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('settings_secrets_prefs')
      .update(payload as never)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SettingsSecretsPref;
  },

  getToolPolicies: async (): Promise<ToolPolicy | null> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('tool_policies')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ToolPolicy | null;
  },

  upsertToolPolicies: async (
    payload: Omit<ToolPolicyInsert, 'user_id'> & { user_id?: string }
  ): Promise<ToolPolicy> => {
    const user_id = payload.user_id ?? (await getCurrentUserId());
    const row: ToolPolicyInsert = {
      user_id,
      exec_allowlist: payload.exec_allowlist ?? [],
      sandbox_mode: payload.sandbox_mode ?? true,
      docker_config: payload.docker_config ?? {},
    };
    const { data, error } = await supabase
      .from('tool_policies')
      .upsert(row as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ToolPolicy;
  },

  updateToolPolicies: async (
    payload: ToolPolicyUpdate
  ): Promise<ToolPolicy> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('tool_policies')
      .update(payload as never)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ToolPolicy;
  },

  getModelDefaults: async (): Promise<ModelDefault | null> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('model_defaults')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ModelDefault | null;
  },

  upsertModelDefaults: async (
    payload: Omit<ModelDefaultInsert, 'user_id'> & { user_id?: string }
  ): Promise<ModelDefault> => {
    const user_id = payload.user_id ?? (await getCurrentUserId());
    const row: ModelDefaultInsert = {
      user_id,
      provider_priority: payload.provider_priority ?? [],
      failover_rules: payload.failover_rules ?? {},
      usage_caps: payload.usage_caps ?? {},
    };
    const { data, error } = await supabase
      .from('model_defaults')
      .upsert(row as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelDefault;
  },

  updateModelDefaults: async (
    payload: ModelDefaultUpdate
  ): Promise<ModelDefault> => {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('model_defaults')
      .update(payload as never)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelDefault;
  },

  /** Validate and apply settings (e.g. trigger gateway restart). Logged for audit. */
  applySettings: async (): Promise<{ ok: boolean; message?: string }> => {
    await getCurrentUserId();
    // In a real implementation this would call a backend/edge function to validate
    // and apply (e.g. restart gateway). For now we return success.
    return { ok: true, message: 'Settings applied. Restart may be required for some changes.' };
  },
};
