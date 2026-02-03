import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Square, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SessionAction = 'new' | 'reset' | 'stop';

export interface SessionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: SessionAction | null;
  onConfirm: (action: SessionAction) => void;
  isLoading?: boolean;
  className?: string;
}

const actionLabels: Record<SessionAction, string> = {
  new: 'Start new session',
  reset: 'Reset session',
  stop: 'Stop session',
};

const actionDescriptions: Record<SessionAction, string> = {
  new: 'Start a new chat session. Your current session will remain in the list.',
  reset: 'Clear all messages in this session. This cannot be undone.',
  stop: 'Pause the current session. You can resume later.',
};

export function SessionManagementDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  isLoading,
  className,
}: SessionManagementDialogProps) {
  if (!action) return null;

  const handleConfirm = () => {
    onConfirm(action);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[640px]', className)}
        aria-describedby="session-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription id="session-dialog-description">
            {actionDescriptions[action]}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="h-4 w-4 animate-pulse rounded-full bg-primary-foreground" />
            ) : (
              <>
                {action === 'new' && <Plus className="mr-1.5 h-4 w-4" />}
                {action === 'reset' && <RotateCcw className="mr-1.5 h-4 w-4" />}
                {action === 'stop' && <Square className="mr-1.5 h-4 w-4" />}
                Confirm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
