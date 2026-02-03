/**
 * Logout confirmation dialog: confirms user intent to log out before terminating the session.
 * On confirm, calls onConfirm (signOut + redirect) and closes the dialog.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;
  className?: string;
}

export function LogoutConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isConfirming = false,
  className,
}: LogoutConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[640px] rounded-[10px] border border-border bg-card shadow-lg', className)}
        aria-describedby="logout-confirm-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <LogOut className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Sign out</DialogTitle>
              <DialogDescription id="logout-confirm-description">
                Are you sure you want to sign out? You can sign in again anytime.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            {isConfirming ? 'Signing out…' : 'Sign out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
