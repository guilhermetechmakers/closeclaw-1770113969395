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
import type { Secret, SecretStorageMethod } from '@/types/database';

const editSecretSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128, 'Name too long'),
  storage_method: z.enum(['os_keychain', 'onepassword', 'encrypted_fallback']),
  key_reference: z.string().optional(),
});

type EditSecretValues = z.infer<typeof editSecretSchema>;

export interface EditSecretPayload {
  name: string;
  storage_method: SecretStorageMethod;
  key_reference?: string | null;
}

interface EditSecretModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secret: Secret | null;
  onSubmit: (data: EditSecretPayload) => void;
  isSubmitting?: boolean;
}

export function EditSecretModal({
  open,
  onOpenChange,
  secret,
  onSubmit,
  isSubmitting = false,
}: EditSecretModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditSecretValues>({
    resolver: zodResolver(editSecretSchema),
    defaultValues: {
      name: secret?.name ?? '',
      storage_method: secret?.storage_method ?? 'encrypted_fallback',
      key_reference: secret?.key_reference ?? '',
    },
  });

  const storageMethod = watch('storage_method');

  useEffect(() => {
    if (open && secret) {
      reset({
        name: secret.name,
        storage_method: secret.storage_method,
        key_reference: secret.key_reference ?? '',
      });
    }
  }, [open, secret, reset]);

  const onFormSubmit = (data: EditSecretValues) => {
    onSubmit({
      name: data.name.trim(),
      storage_method: data.storage_method as SecretStorageMethod,
      key_reference: data.key_reference?.trim() || null,
    });
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onOpenChange(false);
  };

  if (!secret) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="edit-secret-form-description"
      >
        <DialogHeader>
          <DialogTitle>Edit secret</DialogTitle>
          <DialogDescription id="edit-secret-form-description">
            Update name or storage method. The secret value is never displayed;
            use Rotate to set a new value.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. API_KEY_GITHUB"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Storage method</Label>
            <Select
              value={storageMethod}
              onValueChange={(v) =>
                setValue('storage_method', v as EditSecretValues['storage_method'])
              }
            >
              <SelectTrigger
                className={errors.storage_method ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="os_keychain">OS Keychain</SelectItem>
                <SelectItem value="onepassword">1Password</SelectItem>
                <SelectItem value="encrypted_fallback">
                  Encrypted fallback
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(storageMethod === 'os_keychain' ||
            storageMethod === 'onepassword') && (
            <div className="grid gap-2">
              <Label htmlFor="edit-key_reference">Key reference (optional)</Label>
              <Input
                id="edit-key_reference"
                placeholder="e.g. service/account/key"
                {...register('key_reference')}
                autoComplete="off"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
