import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { secretsApi } from '@/api/secrets';
import type { SecretUpdate, SecretStorageMethod } from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const SECRETS_KEYS = {
  all: ['secrets'] as const,
  list: () => [...SECRETS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...SECRETS_KEYS.all, 'detail', id] as const,
  auditLogs: (limit?: number) =>
    [...SECRETS_KEYS.all, 'auditLogs', limit] as const,
};

export function useSecrets() {
  return useQuery({
    queryKey: SECRETS_KEYS.list(),
    queryFn: () => safeGet(() => secretsApi.getSecrets(), []),
  });
}

export function useSecret(id: string | null) {
  return useQuery({
    queryKey: SECRETS_KEYS.detail(id ?? ''),
    queryFn: () => (id ? secretsApi.getSecret(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      storage_method: SecretStorageMethod;
      value?: string;
      key_reference?: string | null;
    }) => secretsApi.createSecret(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: SECRETS_KEYS.auditLogs(),
      });
      toast.success('Secret created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create secret');
    },
  });
}

export function useUpdateSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SecretUpdate }) =>
      secretsApi.updateSecret(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.detail(id) });
      queryClient.invalidateQueries({
        queryKey: SECRETS_KEYS.auditLogs(),
      });
      toast.success('Secret updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update secret');
    },
  });
}

export function useRotateSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value?: string }) =>
      secretsApi.rotateSecret(id, { value }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.detail(id) });
      queryClient.invalidateQueries({
        queryKey: SECRETS_KEYS.auditLogs(),
      });
      toast.success('Secret rotated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to rotate secret');
    },
  });
}

export function useDeleteSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => secretsApi.deleteSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECRETS_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: SECRETS_KEYS.auditLogs(),
      });
      toast.success('Secret removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove secret');
    },
  });
}

export function useSecretAuditLogs(limit = 50) {
  return useQuery({
    queryKey: SECRETS_KEYS.auditLogs(limit),
    queryFn: () => secretsApi.getAuditLogs(limit),
  });
}
