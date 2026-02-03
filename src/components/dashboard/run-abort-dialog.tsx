import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Run } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface RunAbortDialogProps {
  run: Run | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  isAborting?: boolean;
}

export function RunAbortDialog({
  run,
  open,
  onOpenChange,
  onConfirm,
  isAborting = false,
}: RunAbortDialogProps) {
  if (!run) return null;

  const handleConfirm = () => {
    onConfirm(run.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="run-abort-description"
      >
        <DialogHeader>
          <DialogTitle>Abort run?</DialogTitle>
          <DialogDescription id="run-abort-description">
            This will stop the run that started{' '}
            {formatDistanceToNow(new Date(run.start_time), { addSuffix: true })}.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAborting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isAborting}
          >
            {isAborting ? 'Aborting…' : 'Abort run'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
