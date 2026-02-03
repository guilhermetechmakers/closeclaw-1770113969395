import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PermissionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  command: string;
  description?: string;
  onConfirm: () => void;
  onDeny: () => void;
  isLoading?: boolean;
  className?: string;
}

export function PermissionRequestDialog({
  open,
  onOpenChange,
  command,
  description = 'This command requires additional permissions to run.',
  onConfirm,
  onDeny,
  isLoading,
  className,
}: PermissionRequestDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleDeny = () => {
    onDeny();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[640px]', className)}
        aria-describedby="permission-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Permission required
          </DialogTitle>
          <DialogDescription id="permission-dialog-description">
            {description} Command: <code className="rounded bg-secondary px-1 py-0.5 text-sm">/{command}</code>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDeny} disabled={isLoading}>
            Deny
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="h-4 w-4 animate-pulse rounded-full bg-primary-foreground" />
            ) : (
              'Allow'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
