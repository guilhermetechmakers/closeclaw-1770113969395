import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { HookScript } from '@/types/database';

interface HookScriptDeleteDialogProps {
  script: HookScript | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export function HookScriptDeleteDialog({
  script,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: HookScriptDeleteDialogProps) {
  if (!script) return null;

  const handleConfirm = () => {
    onConfirm(script.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="hook-script-delete-description">
        <DialogHeader>
          <DialogTitle>Remove hook script?</DialogTitle>
          <DialogDescription id="hook-script-delete-description">
            This will permanently remove the lifecycle hook for &quot;{script.event_trigger}&quot;.
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
            {isDeleting ? 'Removing…' : 'Remove script'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
