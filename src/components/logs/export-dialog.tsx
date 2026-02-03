import { useState } from 'react';
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
import type { LogSeverity } from '@/types/database';
import type { ExportLogsParams } from '@/api/logs';

const severityOptions: LogSeverity[] = [
  'debug',
  'info',
  'warning',
  'error',
  'critical',
];

const exportSchema = z.object({
  format: z.enum(['json', 'csv']),
  applyRedaction: z.boolean(),
  from: z.string().optional(),
  to: z.string().optional(),
  severity: z.enum(severityOptions as unknown as [string, ...string[]]).optional(),
});

type ExportFormValues = z.infer<typeof exportSchema>;

export interface LogExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (params: ExportLogsParams) => void;
  isExporting?: boolean;
  /** When provided, export is limited to these log IDs (selection confirmation). */
  selectedLogIds?: string[];
}

export function LogExportDialog({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
  selectedLogIds,
}: LogExportDialogProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'json',
      applyRedaction: true,
      from: '',
      to: '',
      severity: undefined,
    },
  });

  const applyRedaction = watch('applyRedaction');
  const severity = watch('severity');

  const onSubmit = (data: ExportFormValues) => {
    const params: ExportLogsParams = {
      format: data.format,
      applyRedaction: data.applyRedaction,
      from: data.from || undefined,
      to: data.to || undefined,
      severity: data.severity as LogSeverity | undefined,
      ...(selectedLogIds?.length ? { logIds: selectedLogIds } : {}),
    };
    onExport(params);
    onOpenChange(false);
  };

  const selectionLabel =
    selectedLogIds?.length ?
      `Export ${selectedLogIds.length} selected log${selectedLogIds.length === 1 ? '' : 's'}`
    : 'Export logs with your chosen format and redaction options.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby="export-desc">
        <DialogHeader>
          <DialogTitle>Export logs</DialogTitle>
          <DialogDescription id="export-desc">
            {selectionLabel}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select
              value={format}
              onValueChange={(v: 'json' | 'csv') => {
                setFormat(v);
                setValue('format', v);
              }}
            >
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="export-redaction">Apply redaction</Label>
              <p className="text-xs text-muted-foreground">
                Use redacted message content in export
              </p>
            </div>
            <Switch
              id="export-redaction"
              checked={applyRedaction}
              onCheckedChange={(v) => setValue('applyRedaction', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-from">From (optional)</Label>
              <Input
                id="export-from"
                type="datetime-local"
                {...register('from')}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-to">To (optional)</Label>
              <Input
                id="export-to"
                type="datetime-local"
                {...register('to')}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-severity">Severity filter (optional)</Label>
            <Select
              value={severity ?? ''}
              onValueChange={(v) => setValue('severity', (v ? (v as LogSeverity) : undefined) as ExportFormValues['severity'])}
            >
              <SelectTrigger id="export-severity">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExporting}>
              {isExporting ? 'Exporting…' : 'Export'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
