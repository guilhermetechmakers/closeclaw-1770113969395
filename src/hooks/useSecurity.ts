import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  securityApi,
  type RunAuditResponse,
  type ExportAuditLogsParams,
} from '@/api/security';
import type { SecurityAuditInsert, IncidentActionInsert } from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const SECURITY_KEYS = {
  all: ['security'] as const,
  audits: (params?: { limit?: number; offset?: number }) =>
    [...SECURITY_KEYS.all, 'audits', params] as const,
  audit: (id: string | null) => [...SECURITY_KEYS.all, 'audit', id ?? ''] as const,
  issues: (auditId: string | null) =>
    [...SECURITY_KEYS.all, 'issues', auditId ?? ''] as const,
  incidentActions: (params?: { audit_id?: string; limit?: number }) =>
    [...SECURITY_KEYS.all, 'incident-actions', params] as const,
};

export function useSecurityAudits(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: SECURITY_KEYS.audits(params),
    queryFn: () => safeGet(() => securityApi.getAudits(params), []),
  });
}

export function useSecurityAudit(id: string | null) {
  return useQuery({
    queryKey: SECURITY_KEYS.audit(id),
    queryFn: () =>
      id ? safeGet(() => securityApi.getAudit(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useSecurityIssues(auditId: string | null) {
  return useQuery({
    queryKey: SECURITY_KEYS.issues(auditId),
    queryFn: () =>
      auditId
        ? safeGet(() => securityApi.getIssuesByAuditId(auditId), [])
        : Promise.resolve([]),
    enabled: !!auditId,
  });
}

export function useRunAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => securityApi.runAudit(),
    onSuccess: (data: RunAuditResponse) => {
      queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.all });
      if (data?.audit?.id) {
        queryClient.invalidateQueries({
          queryKey: SECURITY_KEYS.audit(data.audit.id),
        });
        queryClient.invalidateQueries({
          queryKey: SECURITY_KEYS.issues(data.audit.id),
        });
      }
      toast.success('Security audit completed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Audit failed');
    },
  });
}

export function useCreateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SecurityAuditInsert) => securityApi.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.all });
      toast.success('Audit saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save audit');
    },
  });
}

export function useApplyAutoFix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => securityApi.applyAutoFix(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.all });
      toast.success('Auto-fix applied');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Auto-fix failed');
    },
  });
}

export function useIncidentActions(params?: {
  audit_id?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: SECURITY_KEYS.incidentActions(params),
    queryFn: () =>
      safeGet(() => securityApi.getIncidentActions(params), []),
  });
}

export function useCreateIncidentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IncidentActionInsert) =>
      securityApi.createIncidentAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.all });
      toast.success('Action submitted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Action failed');
    },
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params: ExportAuditLogsParams) =>
      securityApi.exportAuditLogs(params),
    onSuccess: (res) => {
      if (res?.download_url) {
        window.open(res.download_url, '_blank');
      }
      toast.success('Export started');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Export failed');
    },
  });
}
