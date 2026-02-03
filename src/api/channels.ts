import { supabase } from '@/lib/supabase';
import type {
  Channel,
  ChannelInsert,
  ChannelUpdate,
  AdapterConfiguration,
  AdapterConfigurationInsert,
  AdapterConfigurationUpdate,
  DeliveryLog,
  DeliveryLogInsert,
} from '@/types/database';

export const channelsApi = {
  // Channels
  getChannels: async (): Promise<Channel[]> => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('last_event_at', { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Channel[];
  },

  getChannel: async (id: string): Promise<Channel | null> => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Channel;
  },

  createChannel: async (payload: Omit<ChannelInsert, 'user_id'>): Promise<Channel> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: ChannelInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('channels')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Channel;
  },

  updateChannel: async (id: string, payload: ChannelUpdate): Promise<Channel> => {
    const { data, error } = await supabase
      .from('channels')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Channel;
  },

  deleteChannel: async (id: string): Promise<void> => {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Adapter configurations (one per channel)
  getAdapterConfig: async (channelId: string): Promise<AdapterConfiguration | null> => {
    const { data, error } = await supabase
      .from('adapter_configurations')
      .select('*')
      .eq('channel_id', channelId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as AdapterConfiguration;
  },

  upsertAdapterConfig: async (payload: AdapterConfigurationInsert): Promise<AdapterConfiguration> => {
    const existing = await channelsApi.getAdapterConfig(payload.channel_id);
    if (existing) {
      const { data, error } = await supabase
        .from('adapter_configurations')
        .update({
          dm_policy: payload.dm_policy,
          group_policy: payload.group_policy,
          mention_gating: payload.mention_gating,
          webhook_url: payload.webhook_url ?? existing.webhook_url,
          polling_interval_seconds: payload.polling_interval_seconds ?? existing.polling_interval_seconds,
        } as never)
        .eq('channel_id', payload.channel_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as AdapterConfiguration;
    }
    const insertRow: AdapterConfigurationInsert = {
      channel_id: payload.channel_id,
      dm_policy: payload.dm_policy ?? 'pairing',
      group_policy: payload.group_policy ?? 'mention',
      mention_gating: payload.mention_gating ?? true,
      webhook_url: payload.webhook_url ?? null,
      polling_interval_seconds: payload.polling_interval_seconds ?? null,
    };
    const { data, error } = await supabase
      .from('adapter_configurations')
      .insert(insertRow as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdapterConfiguration;
  },

  updateAdapterConfig: async (
    channelId: string,
    payload: AdapterConfigurationUpdate
  ): Promise<AdapterConfiguration> => {
    const { data, error } = await supabase
      .from('adapter_configurations')
      .update(payload as never)
      .eq('channel_id', channelId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdapterConfiguration;
  },

  // Delivery logs
  getDeliveryLogs: async (
    channelId: string | null,
    params?: { limit?: number; eventType?: string }
  ): Promise<DeliveryLog[]> => {
    if (!channelId) return [];
    let query = supabase
      .from('delivery_logs')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    if (params?.eventType) query = query.eq('event_type', params.eventType);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as DeliveryLog[];
  },

  createDeliveryLog: async (payload: DeliveryLogInsert): Promise<DeliveryLog> => {
    const { data, error } = await supabase
      .from('delivery_logs')
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as DeliveryLog;
  },
};
