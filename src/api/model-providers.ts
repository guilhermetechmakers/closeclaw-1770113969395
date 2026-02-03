import { supabase } from '@/lib/supabase';
import type {
  ModelProvider,
  ModelProviderInsert,
  ModelProviderUpdate,
  ModelRequest,
  ModelRequestInsert,
  ModelRequestUpdate,
  UsageMetric,
  UsageMetricInsert,
  ConfigurationOverride,
  ConfigurationOverrideInsert,
  ConfigurationOverrideUpdate,
} from '@/types/database';

export const modelProvidersApi = {
  // Providers
  getProviders: async (): Promise<ModelProvider[]> => {
    const { data, error } = await supabase
      .from('model_providers')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ModelProvider[];
  },

  getProvider: async (id: string): Promise<ModelProvider | null> => {
    const { data, error } = await supabase
      .from('model_providers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as ModelProvider;
  },

  createProvider: async (
    payload: Omit<ModelProviderInsert, 'user_id'>
  ): Promise<ModelProvider> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: ModelProviderInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('model_providers')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelProvider;
  },

  updateProvider: async (
    id: string,
    payload: ModelProviderUpdate
  ): Promise<ModelProvider> => {
    const { data, error } = await supabase
      .from('model_providers')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelProvider;
  },

  deleteProvider: async (id: string): Promise<void> => {
    const { error } = await supabase.from('model_providers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Requests
  getRequests: async (params?: {
    limit?: number;
    providerId?: string;
    status?: string;
  }): Promise<ModelRequest[]> => {
    let query = supabase
      .from('model_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (params?.providerId) query = query.eq('provider_id', params.providerId);
    if (params?.status) query = query.eq('status', params.status);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as ModelRequest[];
  },

  getRequest: async (id: string): Promise<ModelRequest | null> => {
    const { data, error } = await supabase
      .from('model_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as ModelRequest;
  },

  createRequest: async (
    payload: Omit<ModelRequestInsert, 'user_id'>
  ): Promise<ModelRequest> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: ModelRequestInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('model_requests')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelRequest;
  },

  updateRequest: async (
    id: string,
    payload: ModelRequestUpdate
  ): Promise<ModelRequest> => {
    const { data, error } = await supabase
      .from('model_requests')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ModelRequest;
  },

  // Usage metrics
  getUsageMetrics: async (params?: {
    limit?: number;
    providerId?: string;
    since?: string;
  }): Promise<UsageMetric[]> => {
    let query = supabase
      .from('usage_metrics')
      .select('*')
      .order('created_at', { ascending: false });
    if (params?.providerId) query = query.eq('provider_id', params.providerId);
    if (params?.since) query = query.gte('created_at', params.since);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as UsageMetric[];
  },

  getUsageSummary: async (params?: {
    providerId?: string;
    since?: string;
  }): Promise<{
    totalInputTokens: number;
    totalOutputTokens: number;
    requestCount: number;
  }> => {
    const metrics = await modelProvidersApi.getUsageMetrics({
      limit: 10000,
      providerId: params?.providerId,
      since: params?.since,
    });
    const totalInputTokens = metrics.reduce((s, m) => s + m.token_count_input, 0);
    const totalOutputTokens = metrics.reduce(
      (s, m) => s + m.token_count_output,
      0
    );
    const requestIds = new Set(metrics.map((m) => m.request_id));
    return {
      totalInputTokens,
      totalOutputTokens,
      requestCount: requestIds.size,
    };
  },

  createUsageMetric: async (
    payload: Omit<UsageMetricInsert, 'user_id'>
  ): Promise<UsageMetric> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: UsageMetricInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('usage_metrics')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as UsageMetric;
  },

  // Configuration overrides
  getConfigurationOverrides: async (requestId: string | null): Promise<ConfigurationOverride | null> => {
    if (!requestId) return null;
    const { data, error } = await supabase
      .from('configuration_overrides')
      .select('*')
      .eq('request_id', requestId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as ConfigurationOverride;
  },

  getConfigurationOverridesByRequestIds: async (
    requestIds: string[]
  ): Promise<ConfigurationOverride[]> => {
    if (requestIds.length === 0) return [];
    const { data, error } = await supabase
      .from('configuration_overrides')
      .select('*')
      .in('request_id', requestIds)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ConfigurationOverride[];
  },

  upsertConfigurationOverride: async (
    payload: Omit<ConfigurationOverrideInsert, 'user_id'>
  ): Promise<ConfigurationOverride> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: ConfigurationOverrideInsert = {
      ...payload,
      user_id: user.id,
    };
    const { data, error } = await supabase
      .from('configuration_overrides')
      .upsert(
        {
          request_id: row.request_id,
          user_id: row.user_id,
          model_name: row.model_name ?? null,
          temperature: row.temperature ?? null,
          max_tokens: row.max_tokens ?? null,
          parameters: row.parameters ?? {},
        } as never,
        { onConflict: 'request_id' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ConfigurationOverride;
  },

  updateConfigurationOverride: async (
    requestId: string,
    payload: ConfigurationOverrideUpdate
  ): Promise<ConfigurationOverride> => {
    const { data, error } = await supabase
      .from('configuration_overrides')
      .update(payload as never)
      .eq('request_id', requestId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ConfigurationOverride;
  },
};
