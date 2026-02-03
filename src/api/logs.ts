import { api } from '@/lib/api';
import type {
  Log,
  LogInsert,
  RunTrace,
  RunTraceInsert,
  RunTraceUpdate,
  LogRetentionSetting,
  LogRetentionSettingInsert,
  LogRetentionSettingUpdate,
  RedactionRule,
  RedactionRuleInsert,
  RedactionRuleUpdate,
  LogSeverity,
} from '@/types/database';

const LOGS_BASE = '/logs';

export interface LogsFilterParams {
  severity?: LogSeverity | LogSeverity[];
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ExportLogsParams {
  format: 'json' | 'csv';
  severity?: LogSeverity | LogSeverity[];
  from?: string;
  to?: string;
  applyRedaction?: boolean;
  logIds?: string[];
}

export const logsApi = {
  getLogs: (params?: LogsFilterParams) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null && v !== '')
            .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
        ).toString()
      : '';
    return api.get<Log[]>(`${LOGS_BASE}${search ? `?${search}` : ''}`);
  },

  getLog: (id: string) =>
    api.get<Log | null>(`${LOGS_BASE}/${id}`),

  createLog: (data: LogInsert) =>
    api.post<Log>(`${LOGS_BASE}`, data),

  getTraceByLogId: (logId: string) =>
    api.get<RunTrace | null>(`${LOGS_BASE}/${logId}/trace`),

  getTrace: (traceId: string) =>
    api.get<RunTrace | null>(`${LOGS_BASE}/traces/${traceId}`),

  createTrace: (data: RunTraceInsert) =>
    api.post<RunTrace>(`${LOGS_BASE}/traces`, data),

  updateTrace: (id: string, data: RunTraceUpdate) =>
    api.patch<RunTrace>(`${LOGS_BASE}/traces/${id}`, data),

  exportLogs: (params: ExportLogsParams) =>
    api.post<{ download_url?: string; blob?: string }>(`${LOGS_BASE}/export`, params),

  getRetentionSettings: () =>
    api.get<LogRetentionSetting | null>(`${LOGS_BASE}/retention`),

  updateRetentionSettings: (data: LogRetentionSettingInsert | LogRetentionSettingUpdate) =>
    api.patch<LogRetentionSetting>(`${LOGS_BASE}/retention`, data),

  createRetentionSettings: (data: LogRetentionSettingInsert) =>
    api.post<LogRetentionSetting>(`${LOGS_BASE}/retention`, data),

  getRedactionRules: () =>
    api.get<RedactionRule[]>(`${LOGS_BASE}/redaction-rules`),

  createRedactionRule: (data: Omit<RedactionRuleInsert, 'user_id'> & { user_id?: string }) =>
    api.post<RedactionRule>(`${LOGS_BASE}/redaction-rules`, data),

  updateRedactionRule: (id: string, data: RedactionRuleUpdate) =>
    api.patch<RedactionRule>(`${LOGS_BASE}/redaction-rules/${id}`, data),

  deleteRedactionRule: (id: string) =>
    api.delete(`${LOGS_BASE}/redaction-rules/${id}`),
};
