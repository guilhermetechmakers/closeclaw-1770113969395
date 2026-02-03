import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Activity } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface ActivityDetailModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

const activityTypeLabels: Record<string, string> = {
  message: 'Message',
  tool_run: 'Tool run',
  cron_run: 'Cron run',
  node_event: 'Node event',
  alert: 'Alert',
};

export function ActivityDetailModal({
  activity,
  open,
  onOpenChange,
  onDelete,
}: ActivityDetailModalProps) {
  if (!activity) return null;

  const handleDelete = () => {
    onDelete?.(activity.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="activity-detail-description"
      >
        <DialogHeader>
          <DialogTitle>Activity details</DialogTitle>
          <DialogDescription id="activity-detail-description">
            {activityTypeLabels[activity.activity_type] ?? activity.activity_type}{' '}
            · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <p className="text-sm">{activityTypeLabels[activity.activity_type] ?? activity.activity_type}</p>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">Details</span>
            <pre className="max-h-48 overflow-auto rounded-md border border-border bg-secondary/30 p-3 text-xs">
              {JSON.stringify(activity.details, null, 2)}
            </pre>
          </div>
        </div>
        <DialogFooter>
          {onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
