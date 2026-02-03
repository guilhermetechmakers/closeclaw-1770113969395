import { supabase } from '@/lib/supabase';
import type {
  AdminWorkspace,
  AdminWorkspaceInsert,
  AdminWorkspaceUpdate,
  AdminWorkspaceMember,
  AdminWorkspaceMemberInsert,
  AdminWorkspaceMemberUpdate,
  AdminLicense,
  AdminLicenseInsert,
  AdminLicenseUpdate,
  AdminAnalyticsMetric,
  AdminAnalyticsMetricInsert,
} from '@/types/database';

const ADMIN_WORKSPACES = 'admin_workspaces';
const ADMIN_WORKSPACE_MEMBERS = 'admin_workspace_members';
const ADMIN_LICENSES = 'admin_licenses';
const ADMIN_ANALYTICS_METRICS = 'admin_analytics_metrics';

export const adminApi = {
  // Workspaces
  getWorkspaces: async (): Promise<AdminWorkspace[]> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACES)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminWorkspace[];
  },

  getWorkspace: async (id: string): Promise<AdminWorkspace | null> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACES)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as AdminWorkspace;
  },

  createWorkspace: async (payload: AdminWorkspaceInsert): Promise<AdminWorkspace> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACES)
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminWorkspace;
  },

  updateWorkspace: async (
    id: string,
    payload: AdminWorkspaceUpdate
  ): Promise<AdminWorkspace> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACES)
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminWorkspace;
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    const { error } = await supabase.from(ADMIN_WORKSPACES).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Workspace members
  getWorkspaceMembers: async (
    workspaceId: string
  ): Promise<AdminWorkspaceMember[]> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACE_MEMBERS)
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminWorkspaceMember[];
  },

  getAllMembers: async (): Promise<AdminWorkspaceMember[]> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACE_MEMBERS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminWorkspaceMember[];
  },

  addWorkspaceMember: async (
    payload: AdminWorkspaceMemberInsert
  ): Promise<AdminWorkspaceMember> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACE_MEMBERS)
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminWorkspaceMember;
  },

  updateWorkspaceMember: async (
    id: string,
    payload: AdminWorkspaceMemberUpdate
  ): Promise<AdminWorkspaceMember> => {
    const { data, error } = await supabase
      .from(ADMIN_WORKSPACE_MEMBERS)
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminWorkspaceMember;
  },

  removeWorkspaceMember: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(ADMIN_WORKSPACE_MEMBERS)
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Licenses
  getLicenses: async (params?: {
    workspace_id?: string;
    user_id?: string;
  }): Promise<AdminLicense[]> => {
    let q = supabase.from(ADMIN_LICENSES).select('*').order('created_at', { ascending: false });
    if (params?.workspace_id) q = q.eq('workspace_id', params.workspace_id);
    if (params?.user_id != null) q = q.eq('user_id', params.user_id);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminLicense[];
  },

  getLicense: async (id: string): Promise<AdminLicense | null> => {
    const { data, error } = await supabase
      .from(ADMIN_LICENSES)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as AdminLicense;
  },

  createLicense: async (payload: AdminLicenseInsert): Promise<AdminLicense> => {
    const { data, error } = await supabase
      .from(ADMIN_LICENSES)
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminLicense;
  },

  updateLicense: async (
    id: string,
    payload: AdminLicenseUpdate
  ): Promise<AdminLicense> => {
    const { data, error } = await supabase
      .from(ADMIN_LICENSES)
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminLicense;
  },

  deleteLicense: async (id: string): Promise<void> => {
    const { error } = await supabase.from(ADMIN_LICENSES).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Analytics metrics
  getAnalyticsMetrics: async (params?: {
    workspace_id?: string | null;
    metric_type?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<AdminAnalyticsMetric[]> => {
    let q = supabase
      .from(ADMIN_ANALYTICS_METRICS)
      .select('*')
      .order('bucket_time', { ascending: false });
    if (params?.workspace_id != null)
      q = params.workspace_id
        ? q.eq('workspace_id', params.workspace_id)
        : q.is('workspace_id', null);
    if (params?.metric_type) q = q.eq('metric_type', params.metric_type);
    if (params?.from) q = q.gte('bucket_time', params.from);
    if (params?.to) q = q.lte('bucket_time', params.to);
    if (params?.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminAnalyticsMetric[];
  },

  insertAnalyticsMetric: async (
    payload: AdminAnalyticsMetricInsert
  ): Promise<AdminAnalyticsMetric> => {
    const { data, error } = await supabase
      .from(ADMIN_ANALYTICS_METRICS)
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AdminAnalyticsMetric;
  },
};
