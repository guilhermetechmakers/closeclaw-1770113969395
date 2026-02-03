import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsApi } from '@/api/settings';
import type {
  NetworkSettingUpdate,
  RemoteAccessUpdate,
  SettingsSecretsPrefUpdate,
  ToolPolicyUpdate,
  ModelDefaultUpdate,
} from '@/types/database';

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
  network: () => [...SETTINGS_KEYS.all, 'network'] as const,
  remoteAccess: () => [...SETTINGS_KEYS.all, 'remoteAccess'] as const,
  secretsPrefs: () => [...SETTINGS_KEYS.all, 'secretsPrefs'] as const,
  toolPolicies: () => [...SETTINGS_KEYS.all, 'toolPolicies'] as const,
  modelDefaults: () => [...SETTINGS_KEYS.all, 'modelDefaults'] as const,
};

function safeGet<T>(fn: () => Promise<T | null>, fallback: T | null): Promise<T | null> {
  return fn().catch(() => fallback);
}

export function useNetworkSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.network(),
    queryFn: () => safeGet(() => settingsApi.getNetworkSettings(), null),
  });
}

export function useUpsertNetworkSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { bind_address?: string; port?: number; tls_options?: Record<string, unknown> }) =>
      settingsApi.upsertNetworkSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.network() });
      toast.success('Network settings saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save network settings');
    },
  });
}

export function useUpdateNetworkSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NetworkSettingUpdate) =>
      settingsApi.updateNetworkSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.network() });
      toast.success('Network settings updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update network settings');
    },
  });
}

export function useRemoteAccess() {
  return useQuery({
    queryKey: SETTINGS_KEYS.remoteAccess(),
    queryFn: () => safeGet(() => settingsApi.getRemoteAccess(), null),
  });
}

export function useUpsertRemoteAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      tailnet_config?: Record<string, unknown>;
      relay_settings?: Record<string, unknown>;
      pairing_policies?: Record<string, unknown>;
    }) => settingsApi.upsertRemoteAccess(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.remoteAccess() });
      toast.success('Remote access settings saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save remote access settings');
    },
  });
}

export function useUpdateRemoteAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoteAccessUpdate) =>
      settingsApi.updateRemoteAccess(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.remoteAccess() });
      toast.success('Remote access updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update remote access');
    },
  });
}

export function useSecretsPrefs() {
  return useQuery({
    queryKey: SETTINGS_KEYS.secretsPrefs(),
    queryFn: () => safeGet(() => settingsApi.getSecretsPrefs(), null),
  });
}

export function useUpsertSecretsPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      os_keychain_enabled?: boolean;
      onepassword_integration?: boolean;
    }) => settingsApi.upsertSecretsPrefs(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.secretsPrefs() });
      toast.success('Secrets preferences saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save secrets preferences');
    },
  });
}

export function useUpdateSecretsPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettingsSecretsPrefUpdate) =>
      settingsApi.updateSecretsPrefs(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.secretsPrefs() });
      toast.success('Secrets preferences updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update secrets preferences');
    },
  });
}

export function useToolPolicies() {
  return useQuery({
    queryKey: SETTINGS_KEYS.toolPolicies(),
    queryFn: () => safeGet(() => settingsApi.getToolPolicies(), null),
  });
}

export function useUpsertToolPolicies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      exec_allowlist?: string[];
      sandbox_mode?: boolean;
      docker_config?: Record<string, unknown>;
    }) => settingsApi.upsertToolPolicies(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.toolPolicies() });
      toast.success('Tool policies saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save tool policies');
    },
  });
}

export function useUpdateToolPolicies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ToolPolicyUpdate) =>
      settingsApi.updateToolPolicies(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.toolPolicies() });
      toast.success('Tool policies updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update tool policies');
    },
  });
}

export function useModelDefaults() {
  return useQuery({
    queryKey: SETTINGS_KEYS.modelDefaults(),
    queryFn: () => safeGet(() => settingsApi.getModelDefaults(), null),
  });
}

export function useUpsertModelDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      provider_priority?: string[];
      failover_rules?: Record<string, unknown>;
      usage_caps?: Record<string, unknown>;
    }) => settingsApi.upsertModelDefaults(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.modelDefaults() });
      toast.success('Model defaults saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save model defaults');
    },
  });
}

export function useUpdateModelDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ModelDefaultUpdate) =>
      settingsApi.updateModelDefaults(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.modelDefaults() });
      toast.success('Model defaults updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update model defaults');
    },
  });
}

export function useApplySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => settingsApi.applySettings(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.all });
      if (result.message) toast.success(result.message);
      else toast.success('Settings applied');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to apply settings');
    },
  });
}
