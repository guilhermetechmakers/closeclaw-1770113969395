import { useEffect } from 'react';
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
import { cn } from '@/lib/utils';

const frontmatterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().optional(),
  permissions: z.string().optional(),
  env_keys: z.string().optional(),
});

export type FrontmatterFormValues = z.infer<typeof frontmatterSchema>;

export interface EditFrontmatterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<Record<string, unknown>>;
  onSubmit: (values: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

const defaultValues: FrontmatterFormValues = {
  name: '',
  version: '1.0.0',
  description: '',
  permissions: '',
  env_keys: '',
};

export function EditFrontmatterDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: EditFrontmatterDialogProps) {
  const getMergedDefaults = (): FrontmatterFormValues => ({
    ...defaultValues,
    name: (initialValues?.name as string) ?? '',
    version: (initialValues?.version as string) ?? '1.0.0',
    description: (initialValues?.description as string) ?? '',
    permissions: Array.isArray(initialValues?.permissions)
      ? (initialValues.permissions as string[]).join(', ')
      : (initialValues?.permissions as string) ?? '',
    env_keys: initialValues?.env_keys
      ? typeof initialValues.env_keys === 'object'
        ? Object.keys(initialValues.env_keys as Record<string, string>).join(', ')
        : String(initialValues.env_keys)
      : '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FrontmatterFormValues>({
    resolver: zodResolver(frontmatterSchema),
    defaultValues: getMergedDefaults(),
  });

  useEffect(() => {
    if (open) reset(getMergedDefaults());
  }, [open]);

  const onFormSubmit = (data: FrontmatterFormValues) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      version: data.version,
      description: data.description || undefined,
      permissions: data.permissions
        ? data.permissions.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      env_keys: data.env_keys
        ? data.env_keys.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };
    onSubmit(payload);
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
        aria-describedby="frontmatter-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Edit frontmatter</DialogTitle>
          <DialogDescription id="frontmatter-dialog-description">
            YAML frontmatter fields for SKILL.md (name, version, permissions, env).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="frontmatter-name">Name</Label>
            <Input
              id="frontmatter-name"
              placeholder="skill-name"
              {...register('name')}
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frontmatter-version">Version</Label>
            <Input
              id="frontmatter-version"
              placeholder="1.0.0"
              {...register('version')}
              className={cn(errors.version && 'border-destructive')}
            />
            {errors.version && (
              <p className="text-xs text-destructive">{errors.version.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frontmatter-description">Description (optional)</Label>
            <Input
              id="frontmatter-description"
              placeholder="Short description"
              {...register('description')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frontmatter-permissions">Permissions (comma-separated)</Label>
            <Input
              id="frontmatter-permissions"
              placeholder="network, exec, read"
              {...register('permissions')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frontmatter-env">Env keys (comma-separated)</Label>
            <Input
              id="frontmatter-env"
              placeholder="API_KEY, GMAIL_CREDENTIALS"
              {...register('env_keys')}
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
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
