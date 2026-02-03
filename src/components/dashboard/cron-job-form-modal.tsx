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
import type { CronJobInsert } from '@/types/database';

const cronJobSchema = z.object({
  schedule: z.string().min(1, 'Schedule is required'),
  description: z.string().optional(),
  session_target: z.string().optional(),
  status: z.enum(['active', 'paused']).optional(),
});

type CronJobFormValues = z.infer<typeof cronJobSchema>;

interface CronJobFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CronJobInsert) => void;
  isSubmitting?: boolean;
  /** If not provided, backend should set from auth token */
  userId?: string;
}

const defaultValues: CronJobFormValues = {
  schedule: '',
  description: '',
  session_target: '',
  status: 'active',
};

export function CronJobFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  userId = '',
}: CronJobFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CronJobFormValues>({
    resolver: zodResolver(cronJobSchema),
    defaultValues,
  });

  const status = watch('status');

  const onFormSubmit = (data: CronJobFormValues) => {
    onSubmit({
      user_id: userId,
      schedule: data.schedule,
      description: data.description || null,
      session_target: data.session_target || null,
      status: data.status ?? 'active',
    });
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
        aria-describedby="cron-job-form-description"
      >
        <DialogHeader>
          <DialogTitle>Create cron job</DialogTitle>
          <DialogDescription id="cron-job-form-description">
            Add a scheduled job with cron expression, payload, and session target.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule">Schedule (cron expression)</Label>
            <Input
              id="schedule"
              placeholder="e.g. 0 * * * * (hourly)"
              {...register('schedule')}
              className={errors.schedule ? 'border-destructive' : ''}
            />
            {errors.schedule && (
              <p className="text-xs text-destructive">{errors.schedule.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              {...register('description')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="session_target">Session target</Label>
            <Input
              id="session_target"
              placeholder="Target session or channel"
              {...register('session_target')}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status ?? 'active'}
              onValueChange={(v) => setValue('status', v as 'active' | 'paused')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
