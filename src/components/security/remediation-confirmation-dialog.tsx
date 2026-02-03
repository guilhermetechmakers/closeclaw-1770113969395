import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export interface RemediationConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  /** 'auto_fix' | 'manual' */
  mode?: 'auto_fix' | 'manual';
  issueDescription?: string;
}

export function RemediationConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  mode = 'auto_fix',
  issueDescription,
}: RemediationConfirmationDialogProps) {
  const isAutoFix = mode === 'auto_fix';
  const title = isAutoFix ? 'Apply auto-fix?' : 'Record manual remediation?';
  const description = isAutoFix
    ? 'This will apply the recommended automated fix for this issue. The change will be logged for compliance.'
    : 'This will record your manual fix for this issue. The change will be logged for compliance.';

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby="remediation-confirm-desc">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" aria-hidden />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription id="remediation-confirm-desc">
            {description}
            {issueDescription && (
              <span className="mt-2 block text-muted-foreground truncate max-w-full" title={issueDescription}>
                Issue: {issueDescription.slice(0, 80)}
                {issueDescription.length > 80 ? '…' : ''}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? 'Applying…' : isAutoFix ? 'Apply auto-fix' : 'Record fix'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
