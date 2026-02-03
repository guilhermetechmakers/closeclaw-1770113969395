import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { SecurityIssue, SecurityIssueSeverity } from '@/types/database';
import { FileWarning, AlertTriangle, AlertCircle, Info } from 'lucide-react';
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

export interface AuditReportModalProps {
  issue: SecurityIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoFixEnabled?: boolean;
  onAutoFixChange?: (enabled: boolean) => void;
  onApplyAutoFix?: (issueId: string) => void;
  isApplyingAutoFix?: boolean;
}

export function AuditReportModal({
  issue,
  open,
  onOpenChange,
  autoFixEnabled = false,
  onAutoFixChange,
  onApplyAutoFix,
  isApplyingAutoFix = false,
}: AuditReportModalProps) {
  if (!issue) return null;

  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] max-h-[85vh] flex flex-col"
        aria-describedby="audit-issue-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Icon
              className={cn('h-5 w-5 shrink-0', config.className.split(' ')[0])}
              aria-hidden
            />
            <Badge
              variant="secondary"
              className={cn('border text-xs font-medium', config.className)}
            >
              {config.label}
            </Badge>
          </div>
          <DialogTitle className="text-left pt-1">
            Security finding
          </DialogTitle>
          <DialogDescription id="audit-issue-description" className="text-left">
            Details, affected files, and remediation for this issue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] rounded-md border border-border px-3 py-2">
          <div className="space-y-4 pr-2">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-sm text-foreground">{issue.description}</p>
            </div>

            {issue.remediation && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Recommended fix
                </h4>
                <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
                  {issue.remediation}
                </p>
              </div>
            )}

            {issue.affected_files && issue.affected_files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Affected files / configs
                </h4>
                <ul className="text-sm font-mono text-foreground list-disc list-inside space-y-0.5">
                  {issue.affected_files.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {issue.auto_fix_available && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 bg-card/50">
                <div className="space-y-0.5">
                  <Label htmlFor="audit-autofix-toggle" className="text-sm font-medium">
                    Auto-fix available
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Apply safe automated remediation for this issue.
                  </p>
                </div>
                <Switch
                  id="audit-autofix-toggle"
                  checked={autoFixEnabled}
                  onCheckedChange={onAutoFixChange}
                  disabled={isApplyingAutoFix}
                  aria-label="Enable auto-fix for this issue"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {issue.auto_fix_available && (
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => onApplyAutoFix?.(issue.id)}
              disabled={isApplyingAutoFix || !autoFixEnabled}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
            >
              {isApplyingAutoFix ? 'Applying…' : 'Apply auto-fix now'}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
