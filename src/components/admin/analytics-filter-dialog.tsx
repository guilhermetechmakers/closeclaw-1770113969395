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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminWorkspace } from '@/types/database';

const filterSchema = z.object({
  workspace_id: z.string().optional(),
  metric_type: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().min(10).max(500).optional(),
});

export type AnalyticsFilterValues = z.infer<typeof filterSchema>;

export interface AnalyticsFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (values: AnalyticsFilterValues) => void;
  workspaces: AdminWorkspace[];
  currentValues?: AnalyticsFilterValues | null;
}

const defaultValues: AnalyticsFilterValues = {
  workspace_id: '',
  metric_type: '',
  from: '',
  to: '',
  limit: 100,
};

const METRIC_TYPES = [
  'active_sessions',
  'run_success_rate',
  'run_failure_count',
  'skill_installs',
  'messages_sent',
  'tool_invocations',
];

export function AnalyticsFilterDialog({
  open,
  onOpenChange,
  onApply,
  workspaces,
  currentValues = null,
}: AnalyticsFilterDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnalyticsFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: currentValues ?? defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(currentValues ?? defaultValues);
    }
  }, [open, currentValues, reset]);

  const workspace_id = watch('workspace_id');
  const metric_type = watch('metric_type');

  const onFormSubmit = (values: AnalyticsFilterValues) => {
    onApply(values);
    onOpenChange(false);
  };

  const handleReset = () => {
    reset(defaultValues);
    onApply(defaultValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Filter analytics</DialogTitle>
          <DialogDescription>
            Refine data by workspace, metric type, date range, and limit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select
              value={workspace_id || 'all'}
              onValueChange={(v) =>
                setValue('workspace_id', v === 'all' ? '' : v)
              }
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Workspace filter"
              >
                <SelectValue placeholder="All workspaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workspaces</SelectItem>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Metric type</Label>
            <Select
              value={metric_type || 'all'}
              onValueChange={(v) =>
                setValue('metric_type', v === 'all' ? '' : v)
              }
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Metric type"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {METRIC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-from">From date</Label>
              <input
                id="filter-from"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('from')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-to">To date</Label>
              <input
                id="filter-to"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('to')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-limit">Max results</Label>
            <input
              id="filter-limit"
              type="number"
              min={10}
              max={500}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('limit', { valueAsNumber: true })}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
