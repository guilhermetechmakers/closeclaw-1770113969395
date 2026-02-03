import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  runtimeApi,
  type StartRunPayload,
  type PolicyCheckResult,
} from '@/api/runtime';
import type {
  RuntimeToolInsert,
  RuntimeToolUpdate,
  RuntimeFeedbackInsert,
  RuntimeFeedbackUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const RUNTIME_KEYS = {
  all: ['runtime'] as const,
  tools: (params?: { status?: string; type?: string }) =>
    [...RUNTIME_KEYS.all, 'tools', params] as const,
  tool: (id: string) => [...RUNTIME_KEYS.all, 'tool', id] as const,
  runs: (params?: { limit?: number; status?: string; tool_id?: string; skill_id?: string }) =>
    [...RUNTIME_KEYS.all, 'runs', params] as const,
  run: (id: string) => [...RUNTIME_KEYS.all, 'run', id] as const,
  outputs: (runId: string, params?: { limit?: number }) =>
    [...RUNTIME_KEYS.all, 'outputs', runId, params] as const,
  feedback: (runId?: string) => [...RUNTIME_KEYS.all, 'feedback', runId] as const,
  policy: (type: 'tool' | 'skill', id: string) =>
    [...RUNTIME_KEYS.all, 'policy', type, id] as const,
};

export function useRuntimeToolsList(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: RUNTIME_KEYS.tools(params),
    queryFn: () => safeGet(() => runtimeApi.listTools(params), []),
  });
}

export function useRuntimeTool(id: string | null) {
  return useQuery({
    queryKey: RUNTIME_KEYS.tool(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => runtimeApi.getTool(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateRuntimeTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuntimeToolInsert) => runtimeApi.createTool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.tools() });
      toast.success('Tool created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create tool');
    },
  });
}

export function useUpdateRuntimeTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RuntimeToolUpdate }) =>
      runtimeApi.updateTool(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.tools() });
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.tool(id) });
      toast.success('Tool updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update tool');
    },
  });
}

export function useDeleteRuntimeTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runtimeApi.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.tools() });
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.runs() });
      toast.success('Tool deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete tool');
    },
  });
}

export function useRuntimeRunsList(params?: {
  limit?: number;
  status?: string;
  tool_id?: string;
  skill_id?: string;
}) {
  return useQuery({
    queryKey: RUNTIME_KEYS.runs(params),
    queryFn: () => safeGet(() => runtimeApi.listRuns(params), []),
  });
}

export function useRuntimeRun(id: string | null) {
  return useQuery({
    queryKey: RUNTIME_KEYS.run(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => runtimeApi.getRun(id), null) : Promise.resolve(null),
    enabled: !!id,
    refetchInterval: (query) => {
      const run = query.state.data as { status?: string } | null | undefined;
      return run?.status === 'running' ? 2000 : false;
    },
  });
}

export function useStartRuntimeRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartRunPayload) => runtimeApi.startRun(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.runs() });
      toast.success('Run started');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start run');
    },
  });
}

export function useAbortRuntimeRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runtimeApi.abortRun(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.runs() });
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.run(id) });
      toast.success('Run aborted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to abort run');
    },
  });
}

export function useRuntimeOutputs(runId: string | null, params?: { limit?: number }) {
  return useQuery({
    queryKey: RUNTIME_KEYS.outputs(runId ?? '', params),
    queryFn: () =>
      runId
        ? safeGet(() => runtimeApi.listOutputs(runId, params), [])
        : Promise.resolve([]),
    enabled: !!runId,
    refetchInterval: (query) => {
      const runIdFromKey = (query.queryKey[2] as string) ?? '';
      return runIdFromKey ? 1500 : false;
    },
  });
}

export function useRuntimeFeedback(runId: string | null) {
  return useQuery({
    queryKey: RUNTIME_KEYS.feedback(runId ?? undefined),
    queryFn: () =>
      runId
        ? safeGet(() => runtimeApi.getFeedback(runId), null)
        : Promise.resolve(null),
    enabled: !!runId,
  });
}

export function useSubmitRuntimeFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuntimeFeedbackInsert) => runtimeApi.submitFeedback(data),
    onSuccess: (_, { run_id }) => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.feedback(run_id) });
      toast.success('Feedback submitted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit feedback');
    },
  });
}

export function useUpdateRuntimeFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RuntimeFeedbackUpdate;
      runId: string;
    }) => runtimeApi.updateFeedback(id, data),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: RUNTIME_KEYS.feedback(runId) });
      toast.success('Feedback updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update feedback');
    },
  });
}

export function useCheckToolPolicy(toolId: string | null): ReturnType<
  typeof useQuery<PolicyCheckResult>
> {
  return useQuery({
    queryKey: RUNTIME_KEYS.policy('tool', toolId ?? ''),
    queryFn: () =>
      toolId
        ? runtimeApi.checkPolicy(toolId)
        : Promise.resolve({ passed: true, requirements: [] }),
    enabled: !!toolId,
  });
}

export function useCheckSkillPolicy(skillId: string | null): ReturnType<
  typeof useQuery<PolicyCheckResult>
> {
  return useQuery({
    queryKey: RUNTIME_KEYS.policy('skill', skillId ?? ''),
    queryFn: () =>
      skillId
        ? runtimeApi.checkSkillPolicy(skillId)
        : Promise.resolve({ passed: true, requirements: [] }),
    enabled: !!skillId,
  });
}
