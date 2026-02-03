import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Alert } from '@/types/database';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertResolutionDialogProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve?: (id: string, resolution_status: Alert['resolution_status']) => void;
  isUpdating?: boolean;
}

const severityLabels: Record<Alert['severity'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const resolutionOptions: { value: Alert['resolution_status']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
];

export function AlertResolutionDialog({
  alert,
  open,
  onOpenChange,
  onResolve,
  isUpdating = false,
}: AlertResolutionDialogProps) {
  if (!alert) return null;

  const handleResolve = (resolution_status: Alert['resolution_status']) => {
    onResolve?.(alert.id, resolution_status);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="alert-resolution-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                alert.severity === 'critical' && 'text-destructive',
                alert.severity === 'high' && 'text-warning'
              )}
            />
            Alert — {alert.type}
          </DialogTitle>
          <DialogDescription id="alert-resolution-description">
            Update resolution status for this security or audit finding.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <p className="text-sm">{alert.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Severity:</span>
            <span
              className={cn(
                'text-sm font-medium',
                alert.severity === 'critical' && 'text-destructive',
                alert.severity === 'high' && 'text-warning'
              )}
            >
              {severityLabels[alert.severity]}
            </span>
          </div>
          {onResolve && (
            <div className="grid gap-2">
              <Label>Resolution status</Label>
              <Select
                value={alert.resolution_status}
                onValueChange={(v) =>
                  handleResolve(v as Alert['resolution_status'])
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onResolve && (
            <Button
              onClick={() => handleResolve('resolved')}
              disabled={isUpdating || alert.resolution_status === 'resolved'}
            >
              {isUpdating ? 'Updating…' : 'Mark resolved'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
