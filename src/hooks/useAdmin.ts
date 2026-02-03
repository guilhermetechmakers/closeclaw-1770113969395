import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin';
import type {
  AdminWorkspaceInsert,
  AdminWorkspaceUpdate,
  AdminWorkspaceMemberInsert,
  AdminWorkspaceMemberUpdate,
  AdminLicenseInsert,
  AdminLicenseUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const ADMIN_KEYS = {
  all: ['admin'] as const,
  workspaces: () => [...ADMIN_KEYS.all, 'workspaces'] as const,
  workspace: (id: string) => [...ADMIN_KEYS.all, 'workspace', id] as const,
  workspaceMembers: (workspaceId: string) =>
    [...ADMIN_KEYS.all, 'workspace-members', workspaceId] as const,
  allMembers: () => [...ADMIN_KEYS.all, 'members'] as const,
  licenses: (params?: { workspace_id?: string; user_id?: string }) =>
    [...ADMIN_KEYS.all, 'licenses', params] as const,
  license: (id: string) => [...ADMIN_KEYS.all, 'license', id] as const,
  analytics: (params?: {
    workspace_id?: string | null;
    metric_type?: string;
    from?: string;
    to?: string;
    limit?: number;
  }) => [...ADMIN_KEYS.all, 'analytics', params] as const,
};

export function useAdminWorkspaces() {
  return useQuery({
    queryKey: ADMIN_KEYS.workspaces(),
    queryFn: () => safeGet(() => adminApi.getWorkspaces(), []),
  });
}

export function useAdminWorkspace(id: string | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.workspace(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => adminApi.getWorkspace(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateAdminWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminWorkspaceInsert) => adminApi.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.workspaces() });
      toast.success('Workspace created');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create workspace');
    },
  });
}

export function useUpdateAdminWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminWorkspaceUpdate }) =>
      adminApi.updateWorkspace(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.workspaces() });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.workspace(id) });
      toast.success('Workspace updated');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update workspace');
    },
  });
}

export function useDeleteAdminWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.workspaces() });
      toast.success('Workspace deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete workspace');
    },
  });
}

export function useAdminWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.workspaceMembers(workspaceId ?? ''),
    queryFn: () =>
      workspaceId
        ? safeGet(() => adminApi.getWorkspaceMembers(workspaceId), [])
        : Promise.resolve([]),
    enabled: !!workspaceId,
  });
}

export function useAdminAllMembers() {
  return useQuery({
    queryKey: ADMIN_KEYS.allMembers(),
    queryFn: () => safeGet(() => adminApi.getAllMembers(), []),
  });
}

export function useAddAdminWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminWorkspaceMemberInsert) =>
      adminApi.addWorkspaceMember(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allMembers() });
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.workspaceMembers(variables.workspace_id),
      });
      toast.success('User added to workspace');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to add user');
    },
  });
}

export function useUpdateAdminWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      workspaceId: _workspaceId,
    }: {
      id: string;
      data: AdminWorkspaceMemberUpdate;
      workspaceId: string;
    }) => adminApi.updateWorkspaceMember(id, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allMembers() });
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.workspaceMembers(workspaceId),
      });
      toast.success('Member updated');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update member');
    },
  });
}

export function useRemoveAdminWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; workspaceId: string }) =>
      adminApi.removeWorkspaceMember(id),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allMembers() });
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.workspaceMembers(workspaceId),
      });
      toast.success('Member removed');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to remove member');
    },
  });
}

export function useAdminLicenses(params?: {
  workspace_id?: string;
  user_id?: string;
}) {
  return useQuery({
    queryKey: ADMIN_KEYS.licenses(params),
    queryFn: () => safeGet(() => adminApi.getLicenses(params), []),
  });
}

export function useAdminLicense(id: string | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.license(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => adminApi.getLicense(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateAdminLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminLicenseInsert) => adminApi.createLicense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.licenses() });
      toast.success('License created');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create license');
    },
  });
}

export function useUpdateAdminLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminLicenseUpdate }) =>
      adminApi.updateLicense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.licenses() });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.license(id) });
      toast.success('License updated');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update license');
    },
  });
}

export function useDeleteAdminLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.licenses() });
      toast.success('License deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete license');
    },
  });
}

export function useAdminAnalytics(params?: {
  workspace_id?: string | null;
  metric_type?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(params),
    queryFn: () => safeGet(() => adminApi.getAnalyticsMetrics(params), []),
  });
}
