import { api } from '@/lib/api';
import type {
  Activity,
  ActivityInsert,
  Run,
  RunInsert,
  RunUpdate,
  CronJob,
  CronJobInsert,
  CronJobUpdate,
  CronRunHistory,
  Node,
  NodeInsert,
  NodeUpdate,
  Alert,
  AlertUpdate,
} from '@/types/database';

const DASHBOARD_BASE = '/dashboard';

export const dashboardApi = {
  // Activities
  getActivities: (params?: { limit?: number; type?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<Activity[]>(
      `${DASHBOARD_BASE}/activities${search ? `?${search}` : ''}`
    );
  },
  getActivity: (id: string) =>
    api.get<Activity | null>(`${DASHBOARD_BASE}/activities/${id}`),
  createActivity: (data: ActivityInsert) =>
    api.post<Activity>(`${DASHBOARD_BASE}/activities`, data),
  deleteActivity: (id: string) =>
    api.delete(`${DASHBOARD_BASE}/activities/${id}`),

  // Runs
  getRuns: (params?: { status?: string; limit?: number }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<Run[]>(
      `${DASHBOARD_BASE}/runs${search ? `?${search}` : ''}`
    );
  },
  getRun: (id: string) =>
    api.get<Run | null>(`${DASHBOARD_BASE}/runs/${id}`),
  createRun: (data: RunInsert) =>
    api.post<Run>(`${DASHBOARD_BASE}/runs`, data),
  updateRun: (id: string, data: RunUpdate) =>
    api.patch<Run>(`${DASHBOARD_BASE}/runs/${id}`, data),
  abortRun: (id: string) =>
    api.post<Run>(`${DASHBOARD_BASE}/runs/${id}/abort`, {}),

  // Cron jobs
  getCronJobs: () =>
    api.get<CronJob[]>(`${DASHBOARD_BASE}/cron-jobs`),
  getCronJob: (id: string) =>
    api.get<CronJob | null>(`${DASHBOARD_BASE}/cron-jobs/${id}`),
  createCronJob: (data: CronJobInsert) =>
    api.post<CronJob>(`${DASHBOARD_BASE}/cron-jobs`, data),
  updateCronJob: (id: string, data: CronJobUpdate) =>
    api.patch<CronJob>(`${DASHBOARD_BASE}/cron-jobs/${id}`, data),
  deleteCronJob: (id: string) =>
    api.delete(`${DASHBOARD_BASE}/cron-jobs/${id}`),
  runCronJobNow: (id: string) =>
    api.post<{ run_id: string }>(`${DASHBOARD_BASE}/cron-jobs/${id}/run-now`, {}),
  getCronRunHistory: (jobId: string, params?: { limit?: number }) => {
    const search = params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return api.get<CronRunHistory[]>(
      `${DASHBOARD_BASE}/cron-jobs/${jobId}/run-history${search ? `?${search}` : ''}`
    );
  },

  // Nodes
  getNodes: () =>
    api.get<Node[]>(`${DASHBOARD_BASE}/nodes`),
  getNode: (id: string) =>
    api.get<Node | null>(`${DASHBOARD_BASE}/nodes/${id}`),
  createNode: (data: NodeInsert) =>
    api.post<Node>(`${DASHBOARD_BASE}/nodes`, data),
  updateNode: (id: string, data: NodeUpdate) =>
    api.patch<Node>(`${DASHBOARD_BASE}/nodes/${id}`, data),
  deleteNode: (id: string) =>
    api.delete(`${DASHBOARD_BASE}/nodes/${id}`),

  // Alerts
  getAlerts: (params?: { resolution_status?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<Alert[]>(
      `${DASHBOARD_BASE}/alerts${search ? `?${search}` : ''}`
    );
  },
  getAlert: (id: string) =>
    api.get<Alert | null>(`${DASHBOARD_BASE}/alerts/${id}`),
  updateAlert: (id: string, data: AlertUpdate) =>
    api.patch<Alert>(`${DASHBOARD_BASE}/alerts/${id}`, data),

  // Quick run (send message to session/channel)
  quickRun: (data: { message: string; target_session_id?: string; target_channel_id?: string }) =>
    api.post<{ run_id: string }>(`${DASHBOARD_BASE}/quick-run`, data),
};
