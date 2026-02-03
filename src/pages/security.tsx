import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Play,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  FileWarning,
  Info,
  Lock,
  RefreshCw,
  Download,
  StopCircle,
} from 'lucide-react';
import { useSecurityAudits, useSecurityIssues, useRunAudit, useCreateIncidentAction, useExportAuditLogs, useApplyAutoFix } from '@/hooks/useSecurity';
import type { SecurityIssue, SecurityIssueSeverity } from '@/types/database';
import type { IncidentActionType } from '@/types/database';
import { AuditReportModal } from '@/components/security/audit-report-modal';
import { IncidentActionConfirmationDialog } from '@/components/security/incident-action-confirmation-dialog';
import { SecurityExportDialog } from '@/components/security/security-export-dialog';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<
  SecurityIssueSeverity,
  { label: string; icon: React.ElementType; className: string }
> = {
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    className: 'text-destructive bg-destructive/15 border-destructive/30',
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    className: 'text-warning bg-warning/15 border-warning/30',
  },
  medium: {
    label: 'Medium',
    icon: FileWarning,
    className: 'text-muted-foreground bg-muted/30 border-border',
  },
  low: {
    label: 'Low',
    icon: Info,
    className: 'text-accent bg-accent/15 border-accent/30',
  },
};

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return ts;
  }
}

function riskScoreLabel(score: number): string {
  if (score >= 70) return 'High risk';
  if (score >= 40) return 'Medium risk';
  if (score >= 10) return 'Low risk';
  return 'No critical issues';
}

function riskScoreColor(score: number): string {
  if (score >= 70) return 'text-destructive';
  if (score >= 40) return 'text-warning';
  if (score >= 10) return 'text-accent';
  return 'text-success';
}

function IssueRow({
  issue,
  isSelected,
  onSelect,
}: {
  issue: SecurityIssue;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.medium;
  const Icon = config.icon;
  const truncated =
    issue.description.length > 120
      ? issue.description.slice(0, 120) + '…'
      : issue.description;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg border px-3 py-2.5 transition-colors hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card/50'
      )}
      aria-pressed={isSelected}
      aria-label={`View details for issue: ${issue.description.slice(0, 50)}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Icon
          className={cn('h-4 w-4 shrink-0', config.className.split(' ')[0])}
          aria-hidden
        />
        <Badge
          variant="secondary"
          className={cn('text-xs font-medium border shrink-0', config.className)}
        >
          {config.label}
        </Badge>
        {issue.auto_fix_available && (
          <Badge variant="outline" className="text-xs shrink-0">
            Auto-fix
          </Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm text-foreground line-clamp-2">{truncated}</p>
    </button>
  );
}

const INCIDENT_ACTIONS: { type: IncidentActionType; label: string; icon: React.ElementType }[] = [
  { type: 'revoke_sessions', label: 'Revoke sessions', icon: Lock },
  { type: 'rotate_secrets', label: 'Rotate secrets', icon: RefreshCw },
  { type: 'export_logs', label: 'Export logs', icon: Download },
  { type: 'stop_blast_radius', label: 'Stop blast radius', icon: StopCircle },
];

export function Security() {
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null);
  const [issueAutoFixEnabled, setIssueAutoFixEnabled] = useState(false);
  const [auditReportOpen, setAuditReportOpen] = useState(false);
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<IncidentActionType | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data: audits = [], isLoading: auditsLoading } = useSecurityAudits({ limit: 10 });
  const latestAudit = audits[0] ?? null;
  const effectiveAuditId = latestAudit?.id ?? null;
  const { data: issues = [], isLoading: issuesLoading } = useSecurityIssues(effectiveAuditId);

  const runAudit = useRunAudit();
  const createIncidentAction = useCreateIncidentAction();
  const exportAuditLogs = useExportAuditLogs();
  const applyAutoFix = useApplyAutoFix();

  const counts = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
  };

  const riskScore = latestAudit?.risk_score ?? 0;

  const handleOpenIssue = (issue: SecurityIssue) => {
    setSelectedIssue(issue);
    setIssueAutoFixEnabled(false);
    setAuditReportOpen(true);
  };

  const handleIncidentActionClick = (type: IncidentActionType) => {
    if (type === 'export_logs') {
      setExportDialogOpen(true);
      return;
    }
    setPendingActionType(type);
    setActionConfirmOpen(true);
  };

  const handleConfirmIncidentAction = (actionType: IncidentActionType) => {
    createIncidentAction.mutate(
      {
        user_id: user?.id ?? '',
        audit_id: effectiveAuditId ?? undefined,
        action_type: actionType,
      },
      {
        onSuccess: () => {
          setPendingActionType(null);
        },
      }
    );
  };

  const handleExport = (params: Parameters<typeof exportAuditLogs.mutate>[0]) => {
    exportAuditLogs.mutate(params, {
      onSuccess: (res) => {
        if (res?.download_url) window.open(res.download_url, '_blank');
      },
    });
  };

  const handleApplyAutoFix = (issueId: string) => {
    applyAutoFix.mutate(issueId, {
      onSuccess: () => {
        setAuditReportOpen(false);
        setSelectedIssue(null);
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header + breadcrumb */}
      <header className="space-y-2">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">Security Audit</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" aria-hidden />
              Security Audit
            </h1>
            <p className="text-muted-foreground mt-1">
              Run automated security checks and manage remediation. Review issues and use incident response actions when needed.
            </p>
          </div>
          <Button
            onClick={() => runAudit.mutate()}
            disabled={runAudit.isPending}
            className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="mr-2 h-4 w-4" />
            {runAudit.isPending ? 'Running…' : 'Run audit'}
          </Button>
        </div>
      </header>

      {/* Audit summary card */}
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Audit summary</CardTitle>
          <CardDescription>
            Overall risk score and issue counts from the latest audit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditsLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : !latestAudit ? (
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-muted-foreground" aria-hidden />
              <div>
                <p className="font-medium text-foreground">No audit yet</p>
                <p className="text-sm text-muted-foreground">
                  Click &quot;Run audit&quot; to get your current risk score and issues.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full border-2 font-semibold text-xl',
                    riskScoreColor(riskScore),
                    riskScore >= 70 && 'border-destructive bg-destructive/10',
                    riskScore >= 40 && riskScore < 70 && 'border-warning bg-warning/10',
                    riskScore < 40 && 'border-success bg-success/10'
                  )}
                >
                  {riskScore}
                </div>
                <div>
                  <p className={cn('font-semibold text-lg', riskScoreColor(riskScore))}>
                    {riskScoreLabel(riskScore)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last run: {formatTimestamp(latestAudit.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {counts.critical > 0 && (
                  <Badge variant="secondary" className="border-destructive/50 text-destructive">
                    {counts.critical} critical
                  </Badge>
                )}
                {counts.high > 0 && (
                  <Badge variant="secondary" className="border-warning/50 text-warning">
                    {counts.high} high
                  </Badge>
                )}
                {counts.medium > 0 && (
                  <Badge variant="secondary" className="text-muted-foreground">
                    {counts.medium} medium
                  </Badge>
                )}
                {counts.low > 0 && (
                  <Badge variant="secondary" className="border-accent/50 text-accent">
                    {counts.low} low
                  </Badge>
                )}
                {issues.length === 0 && (
                  <Badge variant="secondary" className="text-success">
                    No issues
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue list */}
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Issue list</CardTitle>
          <CardDescription>
            Findings from the audit. Click an issue for details and remediation. Auto-fix is available where marked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] rounded-md border border-border">
            <div className="p-3 space-y-2">
              {issuesLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))
              ) : issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileWarning className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No issues</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Checks include plaintext secrets, open binds, and risky skill permissions. Run an audit to see results.
                  </p>
                </div>
              ) : (
                issues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    isSelected={selectedIssue?.id === issue.id}
                    onSelect={() => handleOpenIssue(issue)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Incident response quick actions */}
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Incident response</CardTitle>
          <CardDescription>
            Quick actions to contain threats: revoke sessions, rotate secrets, export logs, or stop blast radius.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INCIDENT_ACTIONS.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => handleIncidentActionClick(type)}
                disabled={createIncidentAction.isPending}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AuditReportModal
        issue={selectedIssue}
        open={auditReportOpen}
        onOpenChange={setAuditReportOpen}
        autoFixEnabled={issueAutoFixEnabled}
        onAutoFixChange={setIssueAutoFixEnabled}
        onApplyAutoFix={handleApplyAutoFix}
        isApplyingAutoFix={applyAutoFix.isPending}
      />
      <IncidentActionConfirmationDialog
        actionType={pendingActionType}
        open={actionConfirmOpen}
        onOpenChange={setActionConfirmOpen}
        onConfirm={handleConfirmIncidentAction}
        isSubmitting={createIncidentAction.isPending}
      />
      <SecurityExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        isExporting={exportAuditLogs.isPending}
      />
    </div>
  );
}
