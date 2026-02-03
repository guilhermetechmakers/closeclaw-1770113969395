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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CronJob, CronJobInsert, CronJobUpdate } from '@/types/database';

const cronJobSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  schedule: z.string().min(1, 'Schedule is required'),
  description: z.string().optional(),
  payload_json: z.string().optional(),
  session_target: z.string().optional(),
  isolation_setting: z.boolean().optional(),
  status: z.enum(['active', 'paused']).optional(),
});

type CronJobFormValues = z.infer<typeof cronJobSchema>;

interface CronJobFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CronJobInsert | CronJobUpdate) => void;
  isSubmitting?: boolean;
  /** If not provided, backend should set from auth token */
  userId?: string;
  /** When set, modal is in edit mode and form is pre-filled */
  job?: CronJob | null;
}

const defaultValues: CronJobFormValues = {
  name: '',
  schedule: '',
  description: '',
  payload_json: '{}',
  session_target: '',
  isolation_setting: false,
  status: 'active',
};

function parsePayloadJson(value: string): Record<string, unknown> {
  if (!value || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function CronJobFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  userId = '',
  job = null,
}: CronJobFormModalProps) {
  const isEdit = !!job;
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
  const isolation_setting = watch('isolation_setting');

  useEffect(() => {
    if (open && job) {
      reset({
        name: job.name ?? job.description ?? '',
        schedule: job.schedule,
        description: job.description ?? '',
        payload_json:
          typeof job.payload === 'object' && Object.keys(job.payload || {}).length > 0
            ? JSON.stringify(job.payload, null, 2)
            : '{}',
        session_target: job.session_target ?? '',
        isolation_setting: job.isolation_setting ?? false,
        status: job.status === 'failed' ? 'paused' : job.status,
      });
    } else if (open && !job) {
      reset(defaultValues);
    }
  }, [open, job, reset]);

  const onFormSubmit = (data: CronJobFormValues) => {
    const payload = parsePayloadJson(data.payload_json ?? '{}');
    if (isEdit && job) {
      onSubmit({
        name: data.name || null,
        schedule: data.schedule,
        description: data.description || null,
        payload,
        session_target: data.session_target || null,
        isolation_setting: data.isolation_setting ?? false,
        status: data.status ?? 'active',
      });
    } else {
      onSubmit({
        user_id: userId,
        name: data.name || null,
        schedule: data.schedule,
        description: data.description || null,
        payload,
        session_target: data.session_target || null,
        isolation_setting: data.isolation_setting ?? false,
        status: data.status ?? 'active',
      });
    }
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
        className="max-w-[640px]"
        aria-describedby="cron-job-form-description"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit cron job' : 'Create cron job'}</DialogTitle>
          <DialogDescription id="cron-job-form-description">
            {isEdit
              ? 'Update schedule, payload, session target, and isolation.'
              : 'Add a scheduled job with cron expression, payload, and session target.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Job name</Label>
            <Input
              id="name"
              placeholder="e.g. Daily backup"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
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
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Optional description"
              {...register('description')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payload_json">Payload (JSON)</Label>
            <textarea
              id="payload_json"
              rows={4}
              placeholder='{"key": "value"}'
              {...register('payload_json')}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
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
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="isolation_setting">Isolation</Label>
              <p className="text-xs text-muted-foreground">
                Run job in isolated environment (sandbox)
              </p>
            </div>
            <Switch
              id="isolation_setting"
              checked={isolation_setting ?? false}
              onCheckedChange={(v) => setValue('isolation_setting', v)}
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : 'Create job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
