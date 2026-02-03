import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { channelsApi } from '@/api/channels';
import type {
  ChannelInsert,
  ChannelUpdate,
  AdapterConfigurationInsert,
  DeliveryLogInsert,
  UserMappingInsert,
  UserMappingUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const CHANNELS_KEYS = {
  all: ['channels'] as const,
  list: () => [...CHANNELS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CHANNELS_KEYS.all, 'detail', id] as const,
  adapterConfig: (channelId: string) =>
    [...CHANNELS_KEYS.all, 'adapterConfig', channelId] as const,
  deliveryLogs: (channelId: string | null, params?: { limit?: number; eventType?: string }) =>
    [...CHANNELS_KEYS.all, 'deliveryLogs', channelId, params] as const,
  userMappings: (channelId: string | null) =>
    [...CHANNELS_KEYS.all, 'userMappings', channelId] as const,
  channelAdapterMessages: (
    channelId: string | null,
    params?: { limit?: number; direction?: 'inbound' | 'outbound' }
  ) => [...CHANNELS_KEYS.all, 'channelAdapterMessages', channelId, params] as const,
};

export function useChannels() {
  return useQuery({
    queryKey: CHANNELS_KEYS.list(),
    queryFn: () => safeGet(() => channelsApi.getChannels(), []),
  });
}

export function useChannel(id: string | null) {
  return useQuery({
    queryKey: CHANNELS_KEYS.detail(id ?? ''),
    queryFn: () => (id ? channelsApi.getChannel(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ChannelInsert, 'user_id'>) => channelsApi.createChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.list() });
      toast.success('Channel added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add channel');
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChannelUpdate }) =>
      channelsApi.updateChannel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.detail(id) });
      toast.success('Channel updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update channel');
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelsApi.deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.list() });
      toast.success('Channel removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove channel');
    },
  });
}

export function useAdapterConfig(channelId: string | null) {
  return useQuery({
    queryKey: CHANNELS_KEYS.adapterConfig(channelId ?? ''),
    queryFn: () =>
      channelId ? channelsApi.getAdapterConfig(channelId) : Promise.resolve(null),
    enabled: !!channelId,
  });
}

export function useUpsertAdapterConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdapterConfigurationInsert) =>
      channelsApi.upsertAdapterConfig(payload),
    onSuccess: (_, variables) => {
      const channelId = variables.channel_id;
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.adapterConfig(channelId) });
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.detail(channelId) });
      toast.success('Channel config saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save config');
    },
  });
}

export function useDeliveryLogs(
  channelId: string | null,
  params?: { limit?: number; eventType?: string }
) {
  return useQuery({
    queryKey: CHANNELS_KEYS.deliveryLogs(channelId, params),
    queryFn: () =>
      channelId
        ? channelsApi.getDeliveryLogs(channelId, params)
        : Promise.resolve([]),
    enabled: !!channelId,
  });
}

export function useCreateDeliveryLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliveryLogInsert) => channelsApi.createDeliveryLog(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHANNELS_KEYS.deliveryLogs(variables.channel_id),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to log event');
    },
  });
}

export function useUserMappings(channelId: string | null) {
  return useQuery({
    queryKey: CHANNELS_KEYS.userMappings(channelId),
    queryFn: () =>
      channelId ? channelsApi.getUserMappings(channelId) : Promise.resolve([]),
    enabled: !!channelId,
  });
}

export function useCreateUserMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UserMappingInsert, 'user_id'>) =>
      channelsApi.createUserMapping(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHANNELS_KEYS.userMappings(variables.channel_id),
      });
      toast.success('Identity mapping added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add mapping');
    },
  });
}

export function useUpdateUserMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserMappingUpdate }) =>
      channelsApi.updateUserMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update mapping');
    },
  });
}

export function useDeleteUserMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelsApi.deleteUserMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove mapping');
    },
  });
}

export function useChannelAdapterMessages(
  channelId: string | null,
  params?: { limit?: number; direction?: 'inbound' | 'outbound' }
) {
  return useQuery({
    queryKey: CHANNELS_KEYS.channelAdapterMessages(channelId, params),
    queryFn: () =>
      channelId
        ? channelsApi.getChannelAdapterMessages(channelId, params)
        : Promise.resolve([]),
    enabled: !!channelId,
  });
}

export function useSendTestMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      channelsApi.sendTestMessage(channelId, content),
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({
        queryKey: CHANNELS_KEYS.deliveryLogs(channelId),
      });
      queryClient.invalidateQueries({
        queryKey: CHANNELS_KEYS.channelAdapterMessages(channelId),
      });
      toast.success('Test message sent');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to send test message');
    },
  });
}
