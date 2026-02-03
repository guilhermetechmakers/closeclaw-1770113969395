import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Webhook } from '@/types/database';

interface WebhookDeleteDialogProps {
  webhook: Webhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export function WebhookDeleteDialog({
  webhook,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: WebhookDeleteDialogProps) {
  if (!webhook) return null;

  const handleConfirm = () => {
    onConfirm(webhook.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="webhook-delete-description">
        <DialogHeader>
          <DialogTitle>Remove webhook?</DialogTitle>
          <DialogDescription id="webhook-delete-description">
            This will permanently remove the endpoint &quot;{webhook.route_name}&quot;.
            Inbound requests to this URL will no longer be accepted. This action cannot be undone.
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
            {isDeleting ? 'Removing…' : 'Remove webhook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
