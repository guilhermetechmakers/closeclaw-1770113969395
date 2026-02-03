import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RemediationConfirmationDialog } from '@/components/security/remediation-confirmation-dialog';
import type { SecurityIssue, SecurityIssueSeverity } from '@/types/database';
import { FileWarning, AlertTriangle, AlertCircle, Info, Wrench } from 'lucide-react';
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
  onApplyManualFix?: (issueId: string, appliedFix: string) => void;
  isApplyingManualFix?: boolean;
}

function formatCategory(cat: string | null | undefined): string {
  if (!cat) return '';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditReportModal({
  issue,
  open,
  onOpenChange,
  autoFixEnabled = false,
  onAutoFixChange,
  onApplyAutoFix,
  isApplyingAutoFix = false,
  onApplyManualFix,
  isApplyingManualFix = false,
}: AuditReportModalProps) {
  const [remediationConfirmOpen, setRemediationConfirmOpen] = useState(false);
  const [manualFixText, setManualFixText] = useState('');

  if (!issue) return null;

  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.medium;
  const Icon = config.icon;
  const isBusy = isApplyingAutoFix || isApplyingManualFix;

  const handleRequestAutoFix = () => {
    setRemediationConfirmOpen(true);
  };

  const handleConfirmAutoFix = () => {
    onApplyAutoFix?.(issue.id);
  };

  const handleSubmitManualFix = () => {
    const trimmed = manualFixText.trim();
    if (trimmed && onApplyManualFix) {
      onApplyManualFix(issue.id, trimmed);
      setManualFixText('');
    }
  };

  return (
    <>
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
            {issue.category && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Category
                </h4>
                <Badge variant="outline" className="text-xs font-medium">
                  {formatCategory(issue.category)}
                </Badge>
              </div>
            )}
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

            {issue.applied_fix && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Applied fix
                </h4>
                <p className="text-sm text-foreground font-mono whitespace-pre-wrap bg-success/10 border border-success/30 rounded-lg px-3 py-2">
                  {issue.applied_fix}
                </p>
              </div>
            )}

            {issue.auto_fix_available && !issue.applied_fix && (
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
                  disabled={isBusy}
                  aria-label="Enable auto-fix for this issue"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          {issue.auto_fix_available && !issue.applied_fix && (
            <div className="flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={handleRequestAutoFix}
                disabled={isBusy || !autoFixEnabled}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isApplyingAutoFix ? 'Applying…' : 'Apply auto-fix now'}
              </Button>
            </div>
          )}
          {onApplyManualFix && !issue.applied_fix && (
            <div className="space-y-2">
              <Label htmlFor="audit-manual-fix" className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" aria-hidden />
                Manual remediation
              </Label>
              <Textarea
                id="audit-manual-fix"
                placeholder="Describe the fix you applied (e.g. moved secret to keychain, updated config)..."
                value={manualFixText}
                onChange={(e) => setManualFixText(e.target.value)}
                disabled={isBusy}
                rows={3}
                className="resize-none text-sm font-mono"
                aria-describedby="audit-manual-fix-hint"
              />
              <p id="audit-manual-fix-hint" className="text-xs text-muted-foreground">
                Record your custom fix for compliance. This will be logged.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmitManualFix}
                disabled={isBusy || !manualFixText.trim()}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isApplyingManualFix ? 'Saving…' : 'Record manual fix'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    <RemediationConfirmationDialog
      open={remediationConfirmOpen}
      onOpenChange={setRemediationConfirmOpen}
      onConfirm={handleConfirmAutoFix}
      isSubmitting={isApplyingAutoFix}
      mode="auto_fix"
      issueDescription={issue.description}
    />
    </>
  );
}
