import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CronJob } from '@/types/database';

interface CronJobDeleteDialogProps {
  job: CronJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export function CronJobDeleteDialog({
  job,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: CronJobDeleteDialogProps) {
  if (!job) return null;

  const displayName = job.name || job.description || 'Unnamed job';

  const handleConfirm = () => {
    onConfirm(job.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="cron-delete-description">
        <DialogHeader>
          <DialogTitle>Delete cron job?</DialogTitle>
          <DialogDescription id="cron-delete-description">
            This will permanently delete &quot;{displayName}&quot; and its run history.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
