import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { DeliveryLog } from '@/types/database';

interface DeliveryErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DeliveryLog | null;
}

export function DeliveryErrorDialog({
  open,
  onOpenChange,
  log,
}: DeliveryErrorDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="delivery-error-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Delivery error details
          </DialogTitle>
          <DialogDescription id="delivery-error-description">
            Event: {log.event_type} · {log.success ? 'Succeeded' : 'Failed'} ·{' '}
            {format(new Date(log.created_at), 'PPp')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Error details
            </p>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-background p-3 text-sm">
              {log.error_details ?? 'No error message recorded.'}
            </pre>
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Metadata
              </p>
              <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-background p-3 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
