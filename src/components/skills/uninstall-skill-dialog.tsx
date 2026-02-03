import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { LibrarySkill } from '@/types/database';

interface UninstallSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: LibrarySkill | null;
  onConfirm: () => void;
  isUninstalling?: boolean;
}

export function UninstallSkillDialog({
  open,
  onOpenChange,
  skill,
  onConfirm,
  isUninstalling = false,
}: UninstallSkillDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="uninstall-skill-description"
      >
        <DialogHeader>
          <DialogTitle>Uninstall skill</DialogTitle>
          <DialogDescription id="uninstall-skill-description">
            Uninstalling will remove this skill from your library. Any cron jobs
            or workflows that use it may stop working. You can reinstall from the
            registry later.
          </DialogDescription>
        </DialogHeader>
        {skill && (
          <p className="text-sm text-muted-foreground">
            Skill: <span className="font-medium text-foreground">{skill.name}</span>
            {skill.registry_slug && (
              <span className="ml-2 text-muted-foreground">({skill.registry_slug})</span>
            )}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUninstalling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isUninstalling}
          >
            {isUninstalling ? 'Uninstalling…' : 'Uninstall'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
