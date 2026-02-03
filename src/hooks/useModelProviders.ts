import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { modelProvidersApi } from '@/api/model-providers';
import type {
  ModelProviderInsert,
  ModelProviderUpdate,
  ModelRequestInsert,
  ModelRequestUpdate,
  UsageMetricInsert,
  ConfigurationOverrideInsert,
  ConfigurationOverrideUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const MODEL_PROVIDERS_KEYS = {
  all: ['model-providers'] as const,
  providers: () => [...MODEL_PROVIDERS_KEYS.all, 'providers'] as const,
  provider: (id: string) => [...MODEL_PROVIDERS_KEYS.all, 'provider', id] as const,
  requests: (params?: { limit?: number; providerId?: string; status?: string }) =>
    [...MODEL_PROVIDERS_KEYS.all, 'requests', params] as const,
  request: (id: string) => [...MODEL_PROVIDERS_KEYS.all, 'request', id] as const,
  usageMetrics: (params?: { limit?: number; providerId?: string; since?: string }) =>
    [...MODEL_PROVIDERS_KEYS.all, 'usage-metrics', params] as const,
  usageSummary: (params?: { providerId?: string; since?: string }) =>
    [...MODEL_PROVIDERS_KEYS.all, 'usage-summary', params] as const,
  configOverride: (requestId: string) =>
    [...MODEL_PROVIDERS_KEYS.all, 'config-override', requestId] as const,
};

export function useModelProviders() {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.providers(),
    queryFn: () => safeGet(() => modelProvidersApi.getProviders(), []),
  });
}

export function useModelProvider(id: string | null) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.provider(id ?? ''),
    queryFn: () =>
      id ? modelProvidersApi.getProvider(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateModelProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ModelProviderInsert, 'user_id'>) =>
      modelProvidersApi.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.providers() });
      toast.success('Provider added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add provider');
    },
  });
}

export function useUpdateModelProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModelProviderUpdate }) =>
      modelProvidersApi.updateProvider(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.providers() });
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.provider(id) });
      toast.success('Provider updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update provider');
    },
  });
}

export function useDeleteModelProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modelProvidersApi.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.providers() });
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.requests() });
      toast.success('Provider removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove provider');
    },
  });
}

export function useModelRequests(params?: {
  limit?: number;
  providerId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.requests(params),
    queryFn: () => safeGet(() => modelProvidersApi.getRequests(params), []),
  });
}

export function useModelRequest(id: string | null) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.request(id ?? ''),
    queryFn: () =>
      id ? modelProvidersApi.getRequest(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateModelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ModelRequestInsert, 'user_id'>) =>
      modelProvidersApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.requests() });
      toast.success('Request logged');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to log request');
    },
  });
}

export function useUpdateModelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModelRequestUpdate }) =>
      modelProvidersApi.updateRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.requests() });
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.request(id) });
      toast.success('Request updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update request');
    },
  });
}

export function useUsageMetrics(params?: {
  limit?: number;
  providerId?: string;
  since?: string;
}) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.usageMetrics(params),
    queryFn: () => safeGet(() => modelProvidersApi.getUsageMetrics(params), []),
  });
}

export function useUsageSummary(params?: {
  providerId?: string;
  since?: string;
}) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.usageSummary(params),
    queryFn: () => modelProvidersApi.getUsageSummary(params),
  });
}

export function useCreateUsageMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UsageMetricInsert, 'user_id'>) =>
      modelProvidersApi.createUsageMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.usageMetrics() });
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_KEYS.usageSummary() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record usage');
    },
  });
}

export function useConfigurationOverride(requestId: string | null) {
  return useQuery({
    queryKey: MODEL_PROVIDERS_KEYS.configOverride(requestId ?? ''),
    queryFn: () =>
      requestId
        ? modelProvidersApi.getConfigurationOverrides(requestId)
        : Promise.resolve(null),
    enabled: !!requestId,
  });
}

export function useUpsertConfigurationOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ConfigurationOverrideInsert, 'user_id'>) =>
      modelProvidersApi.upsertConfigurationOverride(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MODEL_PROVIDERS_KEYS.configOverride(variables.request_id),
      });
      toast.success('Configuration saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save configuration');
    },
  });
}

export function useUpdateConfigurationOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: ConfigurationOverrideUpdate;
    }) => modelProvidersApi.updateConfigurationOverride(requestId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({
        queryKey: MODEL_PROVIDERS_KEYS.configOverride(requestId),
      });
      toast.success('Configuration updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update configuration');
    },
  });
}
