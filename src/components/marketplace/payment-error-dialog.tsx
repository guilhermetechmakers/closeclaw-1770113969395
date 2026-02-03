import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export interface PaymentErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PaymentErrorDialog({
  open,
  onOpenChange,
  title = 'Payment failed',
  message = 'Something went wrong while processing your payment. Please try again or use a different payment method.',
  onRetry,
}: PaymentErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onRetry && (
            <Button onClick={onRetry} className="transition-transform hover:scale-[1.02]">
              Try again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
