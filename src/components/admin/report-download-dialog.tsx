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
import { Download } from 'lucide-react';
import type { AdminWorkspace } from '@/types/database';
import { adminApi } from '@/api/admin';
import type { AdminAnalyticsMetric } from '@/types/database';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

const reportSchema = z.object({
  workspace_id: z.string().optional(),
  from: z.string().min(1, 'From date is required'),
  to: z.string().min(1, 'To date is required'),
  format: z.enum(['csv', 'json']),
  metric_type: z.string().optional(),
});

export type ReportDownloadValues = z.infer<typeof reportSchema>;

const METRIC_TYPES = [
  'active_sessions',
  'run_success_rate',
  'run_failure_count',
  'skill_installs',
  'messages_sent',
  'tool_invocations',
];

export interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: AdminWorkspace[];
}

const defaultValues: ReportDownloadValues = {
  workspace_id: '',
  from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  to: format(new Date(), 'yyyy-MM-dd'),
  format: 'csv',
  metric_type: '',
};

function buildCsv(rows: AdminAnalyticsMetric[]): string {
  const header = 'bucket_time,workspace_id,metric_type,value,dimensions\n';
  const lines = rows.map(
    (r) =>
      `${r.bucket_time},${r.workspace_id ?? ''},${r.metric_type},${r.value},"${JSON.stringify(r.dimensions ?? {}).replace(/"/g, '""')}"`
  );
  return header + lines.join('\n');
}

export function ReportDownloadDialog({
  open,
  onOpenChange,
  workspaces,
}: ReportDownloadDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportDownloadValues>({
    resolver: zodResolver(reportSchema),
    defaultValues,
  });

  const formatType = watch('format');
  const workspace_id = watch('workspace_id');
  const metric_type = watch('metric_type');

  const onExport = async (values: ReportDownloadValues) => {
    try {
      const data = await adminApi.getAnalyticsMetrics({
        workspace_id: values.workspace_id || undefined,
        metric_type: values.metric_type || undefined,
        from: values.from,
        to: values.to,
        limit: 5000,
      });
      if (data.length === 0) {
        toast.info('No data in the selected range. Try a different date or filter.');
        return;
      }
      const filename = `analytics-report-${values.from}-${values.to}.${values.format}`;
      if (values.format === 'csv') {
        const blob = new Blob([buildCsv(data)], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Report downloaded');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download report');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-muted-foreground" aria-hidden />
            Export analytics report
          </DialogTitle>
          <DialogDescription>
            Select date range, format, and optional filters. Data will be downloaded for offline analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onExport)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-from">From date</Label>
              <input
                id="report-from"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2"
                {...register('from')}
              />
              {errors.from && (
                <p className="text-sm text-destructive">{errors.from.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-to">To date</Label>
              <input
                id="report-to"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2"
                {...register('to')}
              />
              {errors.to && (
                <p className="text-sm text-destructive">{errors.to.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select
              value={workspace_id || 'all'}
              onValueChange={(v) => setValue('workspace_id', v === 'all' ? '' : v)}
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
              onValueChange={(v) => setValue('metric_type', v === 'all' ? '' : v)}
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
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={formatType}
              onValueChange={(v) => setValue('format', v as ReportDownloadValues['format'])}
            >
              <SelectTrigger
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-label="Export format"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
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
            <Button type="submit" disabled={isSubmitting} className="transition-transform hover:scale-[1.02]">
              <Download className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Preparing…' : 'Download report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
