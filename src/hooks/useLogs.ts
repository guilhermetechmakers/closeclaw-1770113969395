import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logsApi, type LogsFilterParams, type ExportLogsParams } from '@/api/logs';
import type {
  LogInsert,
  RunTraceInsert,
  RunTraceUpdate,
  LogRetentionSettingInsert,
  LogRetentionSettingUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const LOGS_KEYS = {
  all: ['logs'] as const,
  list: (params?: LogsFilterParams) =>
    [...LOGS_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...LOGS_KEYS.all, 'detail', id] as const,
  traceByLogId: (logId: string) =>
    [...LOGS_KEYS.all, 'trace', logId] as const,
  trace: (traceId: string) =>
    [...LOGS_KEYS.all, 'trace-id', traceId] as const,
  retention: () => [...LOGS_KEYS.all, 'retention'] as const,
};

export function useLogs(params?: LogsFilterParams) {
  return useQuery({
    queryKey: LOGS_KEYS.list(params),
    queryFn: () => safeGet(() => logsApi.getLogs(params), []),
  });
}

export function useLog(id: string | null) {
  return useQuery({
    queryKey: LOGS_KEYS.detail(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => logsApi.getLog(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LogInsert) => logsApi.createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_KEYS.all });
      toast.success('Log created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create log');
    },
  });
}

export function useTraceByLogId(logId: string | null) {
  return useQuery({
    queryKey: LOGS_KEYS.traceByLogId(logId ?? ''),
    queryFn: () =>
      logId
        ? safeGet(() => logsApi.getTraceByLogId(logId), null)
        : Promise.resolve(null),
    enabled: !!logId,
  });
}

export function useTrace(traceId: string | null) {
  return useQuery({
    queryKey: LOGS_KEYS.trace(traceId ?? ''),
    queryFn: () =>
      traceId
        ? safeGet(() => logsApi.getTrace(traceId), null)
        : Promise.resolve(null),
    enabled: !!traceId,
  });
}

export function useCreateTrace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RunTraceInsert) => logsApi.createTrace(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOGS_KEYS.all });
      if (variables.log_id) {
        queryClient.invalidateQueries({
          queryKey: LOGS_KEYS.traceByLogId(variables.log_id),
        });
      }
      toast.success('Trace created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create trace');
    },
  });
}

export function useUpdateTrace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RunTraceUpdate }) =>
      logsApi.updateTrace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_KEYS.all });
      toast.success('Trace updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update trace');
    },
  });
}

export function useExportLogs() {
  return useMutation({
    mutationFn: (params: ExportLogsParams) => logsApi.exportLogs(params),
    onSuccess: () => {
      toast.success('Export started');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Export failed');
    },
  });
}

export function useRetentionSettings() {
  return useQuery({
    queryKey: LOGS_KEYS.retention(),
    queryFn: () =>
      safeGet(() => logsApi.getRetentionSettings(), null),
  });
}

export function useUpdateRetentionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LogRetentionSettingUpdate) =>
      logsApi.updateRetentionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_KEYS.retention() });
      toast.success('Retention settings updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update retention settings');
    },
  });
}

export function useCreateRetentionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LogRetentionSettingInsert) =>
      logsApi.createRetentionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_KEYS.retention() });
      toast.success('Retention settings saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save retention settings');
    },
  });
}
