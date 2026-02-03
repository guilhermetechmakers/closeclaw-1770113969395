import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { browserApi } from '@/api/browser';
import type {
  BrowserProfileInsert,
  BrowserProfileUpdate,
  BrowserTabUpdate,
  BrowserScriptInsert,
  BrowserScriptUpdate,
  BrowserCaptureRecordInsert,
  BrowserCdpTokenInsert,
  BrowserCdpTokenUpdate,
  BrowserCommandInsert,
  BrowserCommandUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const BROWSER_KEYS = {
  all: ['browser'] as const,
  profiles: () => [...BROWSER_KEYS.all, 'profiles'] as const,
  profile: (id: string | null) => [...BROWSER_KEYS.all, 'profile', id ?? ''] as const,
  tabs: (profileId: string | null) => [...BROWSER_KEYS.all, 'tabs', profileId ?? ''] as const,
  tab: (id: string | null) => [...BROWSER_KEYS.all, 'tab', id ?? ''] as const,
  scripts: () => [...BROWSER_KEYS.all, 'scripts'] as const,
  script: (id: string | null) => [...BROWSER_KEYS.all, 'script', id ?? ''] as const,
  captures: (profileId: string | null, params?: { limit?: number; type?: string }) =>
    [...BROWSER_KEYS.all, 'captures', profileId ?? '', params] as const,
  commands: (profileId: string | null) => [...BROWSER_KEYS.all, 'commands', profileId ?? ''] as const,
  command: (id: string | null) => [...BROWSER_KEYS.all, 'command', id ?? ''] as const,
  cdpTokens: () => [...BROWSER_KEYS.all, 'cdpTokens'] as const,
  cdpToken: (id: string | null) => [...BROWSER_KEYS.all, 'cdpToken', id ?? ''] as const,
};

export function useBrowserProfiles() {
  return useQuery({
    queryKey: BROWSER_KEYS.profiles(),
    queryFn: () => safeGet(() => browserApi.getProfiles(), []),
  });
}

export function useBrowserProfile(id: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.profile(id),
    queryFn: () => (id ? browserApi.getProfile(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateBrowserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BrowserProfileInsert, 'user_id'>) => browserApi.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.profiles() });
      toast.success('Profile created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create profile');
    },
  });
}

export function useUpdateBrowserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrowserProfileUpdate }) =>
      browserApi.updateProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.profiles() });
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.profile(id) });
      toast.success('Profile updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });
}

export function useDeleteBrowserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => browserApi.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.profiles() });
      toast.success('Profile removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove profile');
    },
  });
}

export function useBrowserTabs(profileId: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.tabs(profileId),
    queryFn: () => browserApi.getTabs(profileId),
    enabled: !!profileId,
  });
}

export function useBrowserTab(id: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.tab(id),
    queryFn: () => (id ? browserApi.getTab(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useUpdateBrowserTab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrowserTabUpdate }) =>
      browserApi.updateTab(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.tab(id) });
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.tabs(null) });
    },
  });
}

export function useBrowserScripts() {
  return useQuery({
    queryKey: BROWSER_KEYS.scripts(),
    queryFn: () => safeGet(() => browserApi.getScripts(), []),
  });
}

export function useBrowserScript(id: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.script(id),
    queryFn: () => (id ? browserApi.getScript(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateBrowserScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BrowserScriptInsert, 'user_id'>) => browserApi.createScript(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.scripts() });
      toast.success('Script added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add script');
    },
  });
}

export function useUpdateBrowserScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrowserScriptUpdate }) =>
      browserApi.updateScript(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.scripts() });
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.script(id) });
      toast.success('Script updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update script');
    },
  });
}

export function useDeleteBrowserScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => browserApi.deleteScript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.scripts() });
      toast.success('Script removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove script');
    },
  });
}

export function useBrowserCaptureRecords(
  profileId: string | null,
  params?: { limit?: number; type?: string }
) {
  return useQuery({
    queryKey: BROWSER_KEYS.captures(profileId, params),
    queryFn: () => browserApi.getCaptureRecords(profileId, params),
    enabled: !!profileId,
  });
}

export function useCreateBrowserCaptureRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BrowserCaptureRecordInsert) => browserApi.createCaptureRecord(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: BROWSER_KEYS.captures(variables.browser_profile_id),
      });
      toast.success('Capture saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save capture');
    },
  });
}

export function useDeleteBrowserCaptureRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => browserApi.deleteCaptureRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.all });
      toast.success('Capture removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove capture');
    },
  });
}

export function useBrowserCommands(profileId: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.commands(profileId),
    queryFn: () => browserApi.getCommands(profileId),
    enabled: !!profileId,
  });
}

export function useBrowserCommand(id: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.command(id),
    queryFn: () => (id ? browserApi.getCommand(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateBrowserCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BrowserCommandInsert) => browserApi.createCommand(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: BROWSER_KEYS.commands(variables.browser_profile_id),
      });
      toast.success('Command added to queue');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add command');
    },
  });
}

export function useUpdateBrowserCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrowserCommandUpdate }) =>
      browserApi.updateCommand(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.command(id) });
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.all });
      toast.success('Command updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update command');
    },
  });
}

export function useDeleteBrowserCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => browserApi.deleteCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.all });
      toast.success('Command removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove command');
    },
  });
}

export function useBrowserCdpTokens() {
  return useQuery({
    queryKey: BROWSER_KEYS.cdpTokens(),
    queryFn: () => safeGet(() => browserApi.getCdpTokens(), []),
  });
}

export function useBrowserCdpToken(id: string | null) {
  return useQuery({
    queryKey: BROWSER_KEYS.cdpToken(id),
    queryFn: () => (id ? browserApi.getCdpToken(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateBrowserCdpToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BrowserCdpTokenInsert, 'user_id'>) => browserApi.createCdpToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.cdpTokens() });
      toast.success('CDP token added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add CDP token');
    },
  });
}

export function useUpdateBrowserCdpToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrowserCdpTokenUpdate }) =>
      browserApi.updateCdpToken(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.cdpTokens() });
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.cdpToken(id) });
      toast.success('CDP token updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update CDP token');
    },
  });
}

export function useDeleteBrowserCdpToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => browserApi.deleteCdpToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROWSER_KEYS.cdpTokens() });
      toast.success('CDP token removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove CDP token');
    },
  });
}
