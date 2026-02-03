import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IncidentActionType } from '@/types/database';
import { ShieldAlert, RefreshCw, Download, StopCircle, Lock } from 'lucide-react';

const ACTION_CONFIG: Record<
  IncidentActionType,
  { label: string; description: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' }
> = {
  revoke_sessions: {
    label: 'Revoke sessions',
    description:
      'This will revoke all active sessions except the current one. Users will need to sign in again on other devices.',
    icon: Lock,
    variant: 'destructive',
  },
  rotate_secrets: {
    label: 'Rotate secrets',
    description:
      'This will rotate API keys and tokens. Any integrations using old credentials will need to be updated.',
    icon: RefreshCw,
    variant: 'destructive',
  },
  export_logs: {
    label: 'Export security logs',
    description:
      'Export audit and security logs for external analysis or compliance. Redaction will be applied by default.',
    icon: Download,
    variant: 'default',
  },
  stop_blast_radius: {
    label: 'Stop blast radius',
    description:
      'Contain the impact of a potential incident by stopping affected runs and isolating resources.',
    icon: StopCircle,
    variant: 'destructive',
  },
  quarantine_skill: {
    label: 'Quarantine skill',
    description:
      'Disable and isolate a skill that may be risky until you review and approve it.',
    icon: ShieldAlert,
    variant: 'destructive',
  },
};

export interface IncidentActionConfirmationDialogProps {
  actionType: IncidentActionType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (actionType: IncidentActionType) => void;
  isSubmitting?: boolean;
}

export function IncidentActionConfirmationDialog({
  actionType,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: IncidentActionConfirmationDialogProps) {
  if (!actionType) return null;

  const config = ACTION_CONFIG[actionType] ?? {
    label: actionType.replace(/_/g, ' '),
    description: 'This action will be logged and may have side effects.',
    icon: ShieldAlert,
    variant: 'default' as const,
  };
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm(actionType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="incident-action-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
            <DialogTitle>{config.label}</DialogTitle>
          </div>
          <DialogDescription id="incident-action-description">
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={config.variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
