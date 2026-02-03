import { api } from '@/lib/api';
import type {
  RuntimeTool,
  RuntimeToolInsert,
  RuntimeToolUpdate,
  RuntimeRun,
  RuntimeRunUpdate,
  RuntimeOutput,
  RuntimeOutputInsert,
  RuntimeFeedback,
  RuntimeFeedbackInsert,
  RuntimeFeedbackUpdate,
} from '@/types/database';

const RUNTIME_BASE = '/runtime';
const TOOLS_BASE = `${RUNTIME_BASE}/tools`;
const RUNS_BASE = `${RUNTIME_BASE}/runs`;
const FEEDBACK_BASE = `${RUNTIME_BASE}/feedback`;

export interface PolicyCheckResult {
  passed: boolean;
  message?: string;
  requirements?: { id: string; label: string; met: boolean; message?: string }[];
}

export interface StartRunPayload {
  tool_id?: string;
  skill_id?: string;
  parameters?: Record<string, unknown>;
  env?: Record<string, string>;
}

export interface StartRunResult {
  run_id: string;
  status: RuntimeRun['status'];
  policy_compliant: boolean;
}

export const runtimeApi = {
  // Tools
  listTools: (params?: { status?: string; type?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<RuntimeTool[]>(
      `${TOOLS_BASE}${search ? `?${search}` : ''}`
    );
  },
  getTool: (id: string) =>
    api.get<RuntimeTool | null>(`${TOOLS_BASE}/${id}`),
  createTool: (data: RuntimeToolInsert) =>
    api.post<RuntimeTool>(TOOLS_BASE, data),
  updateTool: (id: string, data: RuntimeToolUpdate) =>
    api.patch<RuntimeTool>(`${TOOLS_BASE}/${id}`, data),
  deleteTool: (id: string) =>
    api.delete(`${TOOLS_BASE}/${id}`),
  checkPolicy: (toolId: string) =>
    api.get<PolicyCheckResult>(`${TOOLS_BASE}/${toolId}/check-policy`),
  checkSkillPolicy: (skillId: string) =>
    api.get<PolicyCheckResult>(`${RUNTIME_BASE}/skills/${skillId}/check-policy`),

  // Runs
  listRuns: (params?: { limit?: number; status?: string; tool_id?: string; skill_id?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)] as [string, string])
        ).toString()
      : '';
    return api.get<RuntimeRun[]>(
      `${RUNS_BASE}${search ? `?${search}` : ''}`
    );
  },
  getRun: (id: string) =>
    api.get<RuntimeRun | null>(`${RUNS_BASE}/${id}`),
  startRun: (payload: StartRunPayload) =>
    api.post<StartRunResult>(`${RUNS_BASE}/start`, payload),
  abortRun: (id: string) =>
    api.post<RuntimeRun>(`${RUNS_BASE}/${id}/abort`, {}),
  updateRun: (id: string, data: RuntimeRunUpdate) =>
    api.patch<RuntimeRun>(`${RUNS_BASE}/${id}`, data),

  // Outputs (streamed per run)
  listOutputs: (runId: string, params?: { limit?: number }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string])
        ).toString()
      : '';
    return api.get<RuntimeOutput[]>(
      `${RUNS_BASE}/${runId}/outputs${search ? `?${search}` : ''}`
    );
  },
  createOutput: (runId: string, data: Omit<RuntimeOutputInsert, 'run_id'>) =>
    api.post<RuntimeOutput>(`${RUNS_BASE}/${runId}/outputs`, data),

  // Feedback
  getFeedback: (runId: string) =>
    api.get<RuntimeFeedback | null>(`${FEEDBACK_BASE}?run_id=${encodeURIComponent(runId)}`),
  listFeedback: (params?: { run_id?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<RuntimeFeedback[]>(
      `${FEEDBACK_BASE}${search ? `?${search}` : ''}`
    );
  },
  submitFeedback: (data: RuntimeFeedbackInsert) =>
    api.post<RuntimeFeedback>(FEEDBACK_BASE, data),
  updateFeedback: (id: string, data: RuntimeFeedbackUpdate) =>
    api.patch<RuntimeFeedback>(`${FEEDBACK_BASE}/${id}`, data),
};
