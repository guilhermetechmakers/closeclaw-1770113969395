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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AdminWorkspace,
  AdminWorkspaceInsert,
  AdminWorkspaceUpdate,
} from '@/types/database';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  active_users_count: z.coerce.number().min(0, 'Must be 0 or more'),
  status: z.enum(['active', 'archived', 'suspended']),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export interface WorkspaceConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminWorkspaceInsert | AdminWorkspaceUpdate) => void;
  isSubmitting?: boolean;
  workspace?: AdminWorkspace | null;
}

const defaultValues: WorkspaceFormValues = {
  name: '',
  active_users_count: 0,
  status: 'active',
};

export function WorkspaceConfigModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  workspace = null,
}: WorkspaceConfigModalProps) {
  const isEdit = !!workspace;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues,
  });

  const status = watch('status');

  useEffect(() => {
    if (open && workspace) {
      reset({
        name: workspace.name,
        active_users_count: workspace.active_users_count,
        status: workspace.status,
      });
    } else if (open && !workspace) {
      reset(defaultValues);
    }
  }, [open, workspace, reset]);

  const onFormSubmit = (data: WorkspaceFormValues) => {
    if (isEdit && workspace) {
      onSubmit({
        name: data.name,
        active_users_count: data.active_users_count,
        status: data.status,
      });
    } else {
      onSubmit({
        name: data.name,
        active_users_count: data.active_users_count,
        status: data.status,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit workspace' : 'Create workspace'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update workspace name, user count, and status.'
              : 'Add a new workspace for multi-tenant management.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              placeholder="Workspace name"
              className="transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-active-users">Active users count</Label>
            <Input
              id="workspace-active-users"
              type="number"
              min={0}
              className="transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              {...register('active_users_count')}
            />
            {errors.active_users_count && (
              <p className="text-sm text-destructive">
                {errors.active_users_count.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue('status', v as WorkspaceFormValues['status'])}
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Workspace status"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
