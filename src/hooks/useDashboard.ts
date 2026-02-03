import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dashboardApi } from '@/api/dashboard';
import type {
  ActivityInsert,
  RunUpdate,
  CronJobInsert,
  CronJobUpdate,
  NodeUpdate,
  AlertUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  activities: (params?: { limit?: number; type?: string }) =>
    [...DASHBOARD_KEYS.all, 'activities', params] as const,
  activity: (id: string) => [...DASHBOARD_KEYS.all, 'activity', id] as const,
  runs: (params?: { status?: string }) =>
    [...DASHBOARD_KEYS.all, 'runs', params] as const,
  run: (id: string) => [...DASHBOARD_KEYS.all, 'run', id] as const,
  cronJobs: () => [...DASHBOARD_KEYS.all, 'cron-jobs'] as const,
  cronJob: (id: string) => [...DASHBOARD_KEYS.all, 'cron-job', id] as const,
  cronRunHistory: (jobId: string, params?: { limit?: number }) =>
    [...DASHBOARD_KEYS.all, 'cron-run-history', jobId, params] as const,
  nodes: () => [...DASHBOARD_KEYS.all, 'nodes'] as const,
  node: (id: string) => [...DASHBOARD_KEYS.all, 'node', id] as const,
  alerts: (params?: { resolution_status?: string }) =>
    [...DASHBOARD_KEYS.all, 'alerts', params] as const,
  alert: (id: string) => [...DASHBOARD_KEYS.all, 'alert', id] as const,
};

// Activities
export function useActivities(params?: { limit?: number; type?: string }) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.activities(params),
    queryFn: () => safeGet(() => dashboardApi.getActivities(params), []),
  });
}

export function useActivity(id: string | null) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.activity(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => dashboardApi.getActivity(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityInsert) => dashboardApi.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.activities() });
      toast.success('Activity recorded');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record activity');
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.activities() });
      toast.success('Activity removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove activity');
    },
  });
}

// Runs
export function useRuns(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.runs(params),
    queryFn: () => safeGet(() => dashboardApi.getRuns(params), []),
  });
}

export function useRun(id: string | null) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.run(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => dashboardApi.getRun(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useAbortRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.abortRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.runs() });
      toast.success('Run aborted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to abort run');
    },
  });
}

export function useUpdateRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RunUpdate }) =>
      dashboardApi.updateRun(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.runs() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.run(id) });
      toast.success('Run updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update run');
    },
  });
}

// Cron jobs
export function useCronJobs() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.cronJobs(),
    queryFn: () => safeGet(() => dashboardApi.getCronJobs(), []),
  });
}

export function useCronJob(id: string | null) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.cronJob(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => dashboardApi.getCronJob(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateCronJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CronJobInsert) => dashboardApi.createCronJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronJobs() });
      toast.success('Cron job created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create cron job');
    },
  });
}

export function useUpdateCronJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CronJobUpdate }) =>
      dashboardApi.updateCronJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronJobs() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronJob(id) });
      toast.success('Cron job updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update cron job');
    },
  });
}

export function useDeleteCronJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteCronJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronJobs() });
      toast.success('Cron job deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete cron job');
    },
  });
}

export function useCronRunHistory(jobId: string | null, params?: { limit?: number }) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.cronRunHistory(jobId ?? '', params),
    queryFn: () =>
      jobId
        ? safeGet(() => dashboardApi.getCronRunHistory(jobId, params), [])
        : Promise.resolve([]),
    enabled: !!jobId,
  });
}

export function useRunCronJobNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.runCronJobNow(id),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronJobs() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.cronRunHistory(jobId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.runs() });
      toast.success('Job started');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to run job');
    },
  });
}

// Nodes
export function useNodes() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.nodes(),
    queryFn: () => safeGet(() => dashboardApi.getNodes(), []),
  });
}

export function useNode(id: string | null) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.node(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => dashboardApi.getNode(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NodeUpdate }) =>
      dashboardApi.updateNode(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.nodes() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.node(id) });
      toast.success('Node updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update node');
    },
  });
}

// Alerts
export function useAlerts(params?: { resolution_status?: string }) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.alerts(params),
    queryFn: () => safeGet(() => dashboardApi.getAlerts(params), []),
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlertUpdate }) =>
      dashboardApi.updateAlert(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.alerts() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.alert(id) });
      toast.success('Alert updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update alert');
    },
  });
}

// Quick run
export function useQuickRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      message: string;
      target_session_id?: string;
      target_channel_id?: string;
    }) => dashboardApi.quickRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.activities() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.runs() });
      toast.success('Message sent');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to send message');
    },
  });
}
