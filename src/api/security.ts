import { api } from '@/lib/api';
import type {
  SecurityAudit,
  SecurityAuditInsert,
  SecurityIssue,
  SecurityIssueInsert,
  IncidentAction,
  IncidentActionInsert,
} from '@/types/database';

const SECURITY_BASE = '/security';

export interface RunAuditResponse {
  audit: SecurityAudit;
  issues: SecurityIssue[];
}

export interface ExportAuditLogsParams {
  format: 'json' | 'csv';
  audit_id?: string;
  from?: string;
  to?: string;
  apply_redaction?: boolean;
}

export const securityApi = {
  /** Run a new security audit (backend executes checks and returns audit + issues) */
  runAudit: () =>
    api.post<RunAuditResponse>(`${SECURITY_BASE}/audit/run`, {}),

  /** List audits for the current user */
  getAudits: (params?: { limit?: number; offset?: number }) => {
    const search =
      params && Object.keys(params).length > 0
        ? new URLSearchParams(
            (Object.entries(params) as [string, number | undefined][])
              .filter(([, v]) => v != null && (typeof v !== 'number' || v !== 0))
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
    return api.get<SecurityAudit[]>(`${SECURITY_BASE}/audits${search ? `?${search}` : ''}`);
  },

  /** Get a single audit by id */
  getAudit: (id: string) =>
    api.get<SecurityAudit | null>(`${SECURITY_BASE}/audits/${id}`),

  /** Create audit (used when backend returns run result) */
  createAudit: (data: SecurityAuditInsert) =>
    api.post<SecurityAudit>(`${SECURITY_BASE}/audits`, data),

  /** Get issues for an audit */
  getIssuesByAuditId: (auditId: string) =>
    api.get<SecurityIssue[]>(`${SECURITY_BASE}/audits/${auditId}/issues`),

  /** Create issue (bulk from run result) */
  createIssue: (data: SecurityIssueInsert) =>
    api.post<SecurityIssue>(`${SECURITY_BASE}/issues`, data),

  /** Apply auto-fix for an issue */
  applyAutoFix: (issueId: string) =>
    api.post<{ success: boolean; message?: string }>(
      `${SECURITY_BASE}/issues/${issueId}/auto-fix`,
      {}
    ),

  /** List incident actions for the user (optional audit filter) */
  getIncidentActions: (params?: { audit_id?: string; limit?: number }) => {
    const search =
      params && Object.keys(params).length > 0
        ? new URLSearchParams(
            (Object.entries(params) as [string, string | number | undefined][])
              .filter(
                ([, v]) =>
                  v != null &&
                  (typeof v !== 'string' || v !== '') &&
                  (typeof v !== 'number' || v !== 0)
              )
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
    return api.get<IncidentAction[]>(`${SECURITY_BASE}/incident-actions${search ? `?${search}` : ''}`);
  },

  /** Create incident action (revoke sessions, rotate secrets, export logs, etc.) */
  createIncidentAction: (data: IncidentActionInsert) =>
    api.post<IncidentAction>(`${SECURITY_BASE}/incident-actions`, data),

  /** Export audit logs for compliance/review */
  exportAuditLogs: (params: ExportAuditLogsParams) =>
    api.post<{ download_url?: string; blob?: string }>(`${SECURITY_BASE}/export`, params),
};
