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
  AdminWorkspaceMember,
  AdminWorkspaceMemberInsert,
  AdminWorkspaceMemberUpdate,
} from '@/types/database';

const memberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'member', 'viewer']),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export interface UserManagementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminWorkspaceMemberInsert | AdminWorkspaceMemberUpdate) => void;
  isSubmitting?: boolean;
  workspace: AdminWorkspace | null;
  member?: AdminWorkspaceMember | null;
}

const defaultValues: MemberFormValues = {
  user_id: '',
  role: 'member',
};

export function UserManagementFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  workspace,
  member = null,
}: UserManagementFormDialogProps) {
  const isEdit = !!member;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues,
  });

  const role = watch('role');

  useEffect(() => {
    if (open && member) {
      reset({
        user_id: member.user_id,
        role: member.role,
      });
    } else if (open && !member) {
      reset(defaultValues);
    }
  }, [open, member, reset]);

  const onFormSubmit = (data: MemberFormValues) => {
    if (isEdit && member) {
      onSubmit({ role: data.role });
    } else {
      if (!workspace) return;
      onSubmit({
        workspace_id: workspace.id,
        user_id: data.user_id,
        role: data.role,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit workspace member' : 'Add user to workspace'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the member role for this workspace.'
              : 'Assign a user to this workspace with a role. Enter the user ID from your auth system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-user-id">User ID</Label>
            <Input
              id="member-user-id"
              placeholder="UUID from auth.users"
              className="font-mono text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              {...register('user_id')}
              disabled={isEdit}
            />
            {errors.user_id && (
              <p className="text-sm text-destructive">{errors.user_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setValue('role', v as MemberFormValues['role'])}
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Member role"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
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
            <Button type="submit" disabled={isSubmitting || (!isEdit && !workspace)}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Add user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
