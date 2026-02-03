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
import { cn } from '@/lib/utils';

interface AbortConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirming?: boolean;
  className?: string;
}

/**
 * Confirmation modal for aborting/cancelling an ongoing operation.
 * Prevents accidental cancellation via explicit confirm/cancel.
 */
export function AbortConfirmationModal({
  open,
  onOpenChange,
  message = 'Are you sure you want to cancel this operation? Progress may be lost.',
  confirmLabel = 'Yes, cancel',
  onConfirm,
  onCancel,
  isConfirming = false,
  className,
}: AbortConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className={cn('max-w-[640px]', className)}
        aria-describedby="abort-confirm-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15">
              <AlertTriangle className="h-6 w-6 text-warning" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Cancel operation?</DialogTitle>
              <DialogDescription id="abort-confirm-description">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming}
            className="transition-transform hover:scale-[1.02]"
          >
            No, continue
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="transition-transform hover:scale-[1.02]"
          >
            {isConfirming ? 'Cancelling…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
