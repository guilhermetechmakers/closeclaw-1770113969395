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
import type { BrowserScriptInsert } from '@/types/database';

const scriptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  script_content: z.string().optional(),
});

type ScriptFormValues = z.infer<typeof scriptSchema>;

interface ScriptUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BrowserScriptInsert, 'user_id'>) => void;
  isSubmitting?: boolean;
}

const defaultValues: ScriptFormValues = {
  name: '',
  script_content: '',
};

export function ScriptUploadForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ScriptUploadFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScriptFormValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues,
  });

  const onFormSubmit = (data: ScriptFormValues) => {
    onSubmit({
      name: data.name.trim(),
      script_content: data.script_content?.trim() || null,
      execution_status: 'pending',
    });
    reset(defaultValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]" showClose>
        <DialogHeader>
          <DialogTitle>Add automation script</DialogTitle>
          <DialogDescription>
            Upload or paste an automation script. It will appear in the Automation Runner and can be executed against the managed profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script-name">Script name</Label>
            <Input
              id="script-name"
              placeholder="e.g. login-flow.js"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="script-content">Content (optional)</Label>
            <textarea
              id="script-content"
              placeholder="Paste script content or leave empty to upload later"
              {...register('script_content')}
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add script'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
