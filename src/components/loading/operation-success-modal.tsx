import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import type { SuccessState } from '@/types/operation-state';
import { cn } from '@/lib/utils';

interface OperationSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  nextSteps?: SuccessState['nextSteps'];
  onClose?: () => void;
  className?: string;
}

/**
 * Modal shown after successful completion of an operation.
 * Displays success message and optional next-step actions.
 */
export function OperationSuccessModal({
  open,
  onOpenChange,
  message = 'Operation completed successfully.',
  nextSteps,
  onClose,
  className,
}: OperationSuccessModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose?.();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={true}
        className={cn('max-w-[640px]', className)}
        aria-describedby="operation-success-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Success</DialogTitle>
              <DialogDescription id="operation-success-description">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {nextSteps && nextSteps.length > 0 && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Next steps</p>
            <ul className="flex flex-col gap-2">
              {nextSteps.map((step, i) => (
                <li key={i}>
                  {step.href ? (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-primary underline-offset-4"
                      asChild
                    >
                      <a href={step.href}>{step.label}</a>
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-primary underline-offset-4"
                      onClick={() => {
                        step.onClick?.();
                        handleOpenChange(false);
                      }}
                    >
                      {step.label}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={() => handleOpenChange(false)}
            className="transition-transform hover:scale-[1.02]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
