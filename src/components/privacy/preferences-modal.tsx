import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** New value for telemetry opt-out (what will be applied on confirm) */
  telemetryOptOut: boolean;
  onConfirm: () => void;
  isUpdating?: boolean;
}

/**
 * Modal to review and confirm changes to data collection preferences (e.g. telemetry opt-out).
 * Reminds users of the implications before applying.
 */
export function PreferencesModal({
  open,
  onOpenChange,
  telemetryOptOut,
  onConfirm,
  isUpdating = false,
}: PreferencesModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="preferences-modal-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <DialogTitle>Confirm privacy preference</DialogTitle>
          </div>
          <DialogDescription id="preferences-modal-description">
            {telemetryOptOut ? (
              <>
                You are opting out of telemetry and optional usage data collection.
                We will not send diagnostic or usage data from this account. This
                preference will be saved and can be changed anytime in Settings or
                on this page.
              </>
            ) : (
              <>
                You are opting in to optional telemetry. We may collect anonymous
                usage and diagnostic data to improve the product. No personal data
                is shared. You can opt out anytime in Settings or on this page.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUpdating}
            className="transition-transform hover:scale-[1.02]"
          >
            {isUpdating ? 'Saving…' : 'Save preference'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
