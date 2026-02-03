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
  AdminLicense,
  AdminLicenseInsert,
  AdminLicenseUpdate,
} from '@/types/database';

const licenseSchema = z.object({
  workspace_id: z.string().uuid('Select a workspace'),
  user_id: z.string().optional(),
  license_type: z.enum(['seat', 'pro', 'enterprise', 'trial']),
  expiry_date: z.string().optional(),
});

type LicenseFormValues = z.infer<typeof licenseSchema>;

export interface LicenseAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminLicenseInsert | AdminLicenseUpdate) => void;
  isSubmitting?: boolean;
  workspaces: AdminWorkspace[];
  license?: AdminLicense | null;
}

const defaultValues: LicenseFormValues = {
  workspace_id: '',
  user_id: '',
  license_type: 'seat',
  expiry_date: '',
};

export function LicenseAllocationDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  workspaces,
  license = null,
}: LicenseAllocationDialogProps) {
  const isEdit = !!license;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues,
  });

  const workspace_id = watch('workspace_id');
  const license_type = watch('license_type');

  useEffect(() => {
    if (open && license) {
      reset({
        workspace_id: license.workspace_id,
        user_id: license.user_id ?? '',
        license_type: license.license_type,
        expiry_date: license.expiry_date
          ? license.expiry_date.slice(0, 10)
          : '',
      });
    } else if (open && !license) {
      reset({
        ...defaultValues,
        workspace_id: workspaces[0]?.id ?? '',
      });
    }
  }, [open, license, workspaces, reset]);

  const onFormSubmit = (data: LicenseFormValues) => {
    const expiry = data.expiry_date
      ? new Date(data.expiry_date).toISOString()
      : null;
    if (isEdit && license) {
      onSubmit({
        user_id: data.user_id || null,
        license_type: data.license_type,
        expiry_date: expiry,
      });
    } else {
      onSubmit({
        workspace_id: data.workspace_id,
        user_id: data.user_id || null,
        license_type: data.license_type,
        expiry_date: expiry,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit license' : 'Allocate license'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update license type and expiry. Reassign to a workspace/user if needed.'
              : 'Assign a license to a workspace or user. Leave user empty for workspace-level license.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select
              value={workspace_id}
              onValueChange={(v) => setValue('workspace_id', v)}
              disabled={isEdit}
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Workspace"
              >
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workspace_id && (
              <p className="text-sm text-destructive">
                {errors.workspace_id.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="license-user-id">User ID (optional)</Label>
            <Input
              id="license-user-id"
              placeholder="UUID or leave empty for workspace license"
              className="font-mono text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              {...register('user_id')}
            />
          </div>
          <div className="space-y-2">
            <Label>License type</Label>
            <Select
              value={license_type}
              onValueChange={(v) =>
                setValue('license_type', v as LicenseFormValues['license_type'])
              }
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="License type"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seat">Seat</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="license-expiry">Expiry date (optional)</Label>
            <Input
              id="license-expiry"
              type="date"
              className="transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              {...register('expiry_date')}
            />
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
              {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Allocate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
