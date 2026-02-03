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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WakeWord } from '@/types/database';

const wakeWordSchema = z.object({
  word: z.string().min(1, 'Wake word is required').max(64),
  status: z.enum(['active', 'inactive']),
  propagate_to_nodes: z.boolean(),
});

type WakeWordFormValues = z.infer<typeof wakeWordSchema>;

export interface WakeWordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WakeWordFormValues) => void;
  isSubmitting?: boolean;
  /** When provided, modal is in edit mode and form is pre-filled */
  initial?: WakeWord | null;
}

const defaultValues: WakeWordFormValues = {
  word: '',
  status: 'active',
  propagate_to_nodes: true,
};

export function WakeWordsModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initial = null,
}: WakeWordsModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WakeWordFormValues>({
    resolver: zodResolver(wakeWordSchema),
    defaultValues,
  });

  const propagate = watch('propagate_to_nodes');
  const status = watch('status');

  const onFormSubmit = (data: WakeWordFormValues) => {
    onSubmit(data);
    reset(defaultValues);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next && initial) {
      reset({
        word: initial.word,
        status: initial.status,
        propagate_to_nodes: initial.propagate_to_nodes,
      });
    } else if (!next) {
      reset(defaultValues);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="wake-word-form-description"
      >
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit wake word' : 'Add wake word'}</DialogTitle>
          <DialogDescription id="wake-word-form-description">
            Configure a voice wake word. Optionally propagate to connected nodes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wake-word-input">Wake word</Label>
            <Input
              id="wake-word-input"
              placeholder="e.g. Hey Clawgate"
              {...register('word')}
              className="transition-colors focus-visible:ring-2"
            />
            {errors.word && (
              <p className="text-sm text-destructive">{errors.word.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="propagate-nodes">Propagate to nodes</Label>
              <p className="text-sm text-muted-foreground">
                Send this wake word to paired devices
              </p>
            </div>
            <Switch
              id="propagate-nodes"
              checked={propagate}
              onCheckedChange={(v) => setValue('propagate_to_nodes', v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : initial ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
