import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Node } from '@/types/database';

interface UnpairConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  onConfirm: () => void;
  isUnpairing?: boolean;
}

export function UnpairConfirmDialog({
  open,
  onOpenChange,
  node,
  onConfirm,
  isUnpairing = false,
}: UnpairConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="unpair-description"
      >
        <DialogHeader>
          <DialogTitle>Revoke / Unpair device</DialogTitle>
          <DialogDescription id="unpair-description">
            Unpairing will remove this device from your account. The device will
            need to be paired again to regain access. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {node && (
          <p className="text-sm text-muted-foreground">
            Device: <span className="font-medium text-foreground">{node.name ?? `Node ${node.id.slice(0, 8)}`}</span>
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUnpairing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isUnpairing}
          >
            {isUnpairing ? 'Unpairing…' : 'Unpair'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
