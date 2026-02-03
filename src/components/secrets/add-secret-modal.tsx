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
import type { SecretStorageMethod } from '@/types/database';

const addSecretSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128, 'Name too long'),
  storage_method: z.enum(['os_keychain', 'onepassword', 'encrypted_fallback']),
  value: z.string().optional(),
  key_reference: z.string().optional(),
});

type AddSecretValues = z.infer<typeof addSecretSchema>;

export interface AddSecretPayload {
  name: string;
  storage_method: SecretStorageMethod;
  value?: string;
  key_reference?: string | null;
}

interface AddSecretModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddSecretPayload) => void;
  isSubmitting?: boolean;
}

const defaultValues: AddSecretValues = {
  name: '',
  storage_method: 'encrypted_fallback',
  value: '',
  key_reference: '',
};

export function AddSecretModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddSecretModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddSecretValues>({
    resolver: zodResolver(addSecretSchema),
    defaultValues,
  });

  const storageMethod = watch('storage_method');

  const onFormSubmit = (data: AddSecretValues) => {
    onSubmit({
      name: data.name.trim(),
      storage_method: data.storage_method as SecretStorageMethod,
      value: data.value?.trim() || undefined,
      key_reference: data.key_reference?.trim() || null,
    });
    reset(defaultValues);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="add-secret-form-description"
      >
        <DialogHeader>
          <DialogTitle>Add secret</DialogTitle>
          <DialogDescription id="add-secret-form-description">
            Store a secret securely. Choose where it will be stored; value is
            never stored in plaintext.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
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
                setValue('storage_method', v as AddSecretValues['storage_method'])
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
            <p className="text-xs text-muted-foreground">
              OS Keychain (macOS/Windows/Linux), 1Password CLI, or encrypted
              fallback when keychain is unavailable.
            </p>
          </div>
          {storageMethod === 'encrypted_fallback' && (
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="password"
                placeholder="Enter secret value"
                autoComplete="new-password"
                {...register('value')}
              />
              <p className="text-xs text-muted-foreground">
                Value is encrypted before storage; never stored in plaintext.
              </p>
            </div>
          )}
          {(storageMethod === 'os_keychain' ||
            storageMethod === 'onepassword') && (
            <div className="grid gap-2">
              <Label htmlFor="key_reference">Key reference (optional)</Label>
              <Input
                id="key_reference"
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
              {isSubmitting ? 'Adding…' : 'Add secret'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
