import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const commitSchema = z.object({
  message: z.string().optional(),
  sign: z.boolean().optional(),
});

type CommitFormValues = z.infer<typeof commitSchema>;

export interface CommitChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName?: string;
  onSubmit: (payload: { message?: string; sign?: boolean }) => void;
  isSubmitting?: boolean;
}

const defaultValues: CommitFormValues = {
  message: '',
  sign: false,
};

export function CommitChangesDialog({
  open,
  onOpenChange,
  skillName,
  onSubmit,
  isSubmitting = false,
}: CommitChangesDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CommitFormValues>({
    resolver: zodResolver(commitSchema),
    defaultValues,
  });

  const sign = watch('sign');

  const onFormSubmit = (data: CommitFormValues) => {
    onSubmit({ message: data.message || undefined, sign: data.sign });
    reset(defaultValues);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="commit-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Commit changes</DialogTitle>
          <DialogDescription id="commit-dialog-description">
            {skillName
              ? `Finalize and commit changes for "${skillName}". Optionally sign the package.`
              : 'Finalize and commit your skill. Optionally sign the package.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="commit-message">Commit message (optional)</Label>
            <Input
              id="commit-message"
              placeholder="e.g. Add Gmail Pub/Sub gating"
              {...register('message')}
              className={cn(errors.message && 'border-destructive')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="commit-sign">Sign package</Label>
              <p className="text-xs text-muted-foreground">
                Optionally sign this version for provenance.
              </p>
            </div>
            <Switch
              id="commit-sign"
              checked={sign}
              onCheckedChange={(v) => setValue('sign', v)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Committing…' : 'Commit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
