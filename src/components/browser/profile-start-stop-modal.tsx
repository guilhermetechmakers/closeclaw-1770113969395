import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';

type ProfileAction = 'start' | 'stop';

interface ProfileStartStopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ProfileAction;
  onConfirm: () => void;
  isPending?: boolean;
  profilePath?: string | null;
  isIsolated?: boolean;
}

export function ProfileStartStopModal({
  open,
  onOpenChange,
  action,
  onConfirm,
  isPending = false,
  profilePath,
  isIsolated = true,
}: ProfileStartStopModalProps) {
  const isStart = action === 'start';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]" showClose>
        <DialogHeader>
          <DialogTitle>
            {isStart ? 'Start managed profile' : 'Stop managed profile'}
          </DialogTitle>
          <DialogDescription>
            {isStart
              ? 'Start the managed Chromium profile. The profile will run in an isolated environment.'
              : 'Stop the managed Chromium profile. Any open tabs and automation will be terminated.'}
          </DialogDescription>
        </DialogHeader>
        {(profilePath != null || isIsolated != null) && (
          <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            {profilePath && (
              <p className="truncate" title={profilePath}>
                <span className="font-medium text-foreground">Path:</span> {profilePath}
              </p>
            )}
            {isIsolated != null && (
              <p>
                <span className="font-medium text-foreground">Isolation:</span>{' '}
                {isIsolated ? 'Enabled' : 'Disabled'}
              </p>
            )}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isStart ? 'default' : 'destructive'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            {isPending ? (
              'Please wait…'
            ) : isStart ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start profile
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop profile
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
