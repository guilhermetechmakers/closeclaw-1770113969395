import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '@/api/profile';
import type { ProfileUpdate, SecuritySettingUpdate } from '@/types/database';

const PROFILE_KEYS = {
  all: ['profile'] as const,
  profile: () => [...PROFILE_KEYS.all, 'detail'] as const,
  oauthAccounts: () => [...PROFILE_KEYS.all, 'oauth-accounts'] as const,
  sessions: () => [...PROFILE_KEYS.all, 'sessions'] as const,
  apiKeys: () => [...PROFILE_KEYS.all, 'api-keys'] as const,
  securitySettings: () => [...PROFILE_KEYS.all, 'security-settings'] as const,
};

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEYS.profile(),
    queryFn: () => safeGet(profileApi.getProfile, null),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdate) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile() });
      toast.success('Profile updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });
}

export function useOAuthAccounts() {
  return useQuery({
    queryKey: PROFILE_KEYS.oauthAccounts(),
    queryFn: () => safeGet(profileApi.getOAuthAccounts, []),
  });
}

export function useUnlinkOAuthAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.unlinkOAuthAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.oauthAccounts() });
      toast.success('Account unlinked');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to unlink account');
    },
  });
}

export function useDeviceSessions() {
  return useQuery({
    queryKey: PROFILE_KEYS.sessions(),
    queryFn: () => safeGet(profileApi.getDeviceSessions, []),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.sessions() });
      toast.success('Session revoked');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to revoke session');
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: PROFILE_KEYS.apiKeys(),
    queryFn: () => safeGet(profileApi.getApiKeys, []),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; scope: string }) =>
      profileApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.apiKeys() });
      toast.success('API key created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create API key');
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.apiKeys() });
      toast.success('API key revoked');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to revoke API key');
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: PROFILE_KEYS.securitySettings(),
    queryFn: () => safeGet(profileApi.getSecuritySettings, null),
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SecuritySettingUpdate) =>
      profileApi.updateSecuritySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROFILE_KEYS.securitySettings(),
      });
      toast.success('Security settings updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update security settings');
    },
  });
}
