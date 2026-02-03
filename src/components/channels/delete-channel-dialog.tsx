import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteChannelDialog({
  open,
  onOpenChange,
  channelName,
  onConfirm,
  isDeleting = false,
}: DeleteChannelDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="delete-channel-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Remove channel</DialogTitle>
              <DialogDescription id="delete-channel-description">
                This will remove the channel integration and its configuration.
                Delivery logs and identity mappings for this channel will also be
                removed. This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {channelName && (
          <p className="rounded-lg border border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
            Channel: <span className="font-medium text-foreground">{channelName}</span>
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing…' : 'Remove channel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
