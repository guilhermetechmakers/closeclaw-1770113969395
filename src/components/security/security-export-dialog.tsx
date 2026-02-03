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
import type { ExportAuditLogsParams } from '@/api/security';

const exportSchema = z.object({
  format: z.enum(['json', 'csv']),
  applyRedaction: z.boolean(),
  from: z.string().optional(),
  to: z.string().optional(),
});

type ExportFormValues = z.infer<typeof exportSchema>;

export interface SecurityExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (params: ExportAuditLogsParams) => void;
  isExporting?: boolean;
}

export function SecurityExportDialog({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
}: SecurityExportDialogProps) {
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
    },
  });

  const applyRedaction = watch('applyRedaction');
  const format = watch('format');

  const onSubmit = (data: ExportFormValues) => {
    const params: ExportAuditLogsParams = {
      format: data.format,
      apply_redaction: data.applyRedaction,
      from: data.from || undefined,
      to: data.to || undefined,
    };
    onExport(params);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby="security-export-desc">
        <DialogHeader>
          <DialogTitle>Export security logs</DialogTitle>
          <DialogDescription id="security-export-desc">
            Configure format, date range, and redaction. Export will download audit and security logs for compliance or analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="security-export-format">Format</Label>
            <Select
              value={format}
              onValueChange={(v: 'json' | 'csv') => setValue('format', v)}
            >
              <SelectTrigger id="security-export-format">
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
              <Label htmlFor="security-export-redaction">Apply redaction</Label>
              <p className="text-xs text-muted-foreground">
                Redact sensitive data in exported logs (recommended).
              </p>
            </div>
            <Switch
              id="security-export-redaction"
              checked={applyRedaction}
              onCheckedChange={(v) => setValue('applyRedaction', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security-export-from">From (optional)</Label>
              <Input
                id="security-export-from"
                type="datetime-local"
                {...register('from')}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-export-to">To (optional)</Label>
              <Input
                id="security-export-to"
                type="datetime-local"
                {...register('to')}
                className="font-mono text-sm"
              />
            </div>
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
