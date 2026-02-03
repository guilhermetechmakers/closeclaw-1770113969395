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
import type { LogSeverity } from '@/types/database';
import type { LogsFilterParams } from '@/api/logs';

const severityOptions: LogSeverity[] = [
  'debug',
  'info',
  'warning',
  'error',
  'critical',
];

const filterSchema = z.object({
  severity: z.enum(severityOptions as unknown as [string, ...string[]]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(10).max(500).optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export interface LogFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters?: LogsFilterParams | null;
  onApply: (filters: LogsFilterParams) => void;
}

export function LogFilterModal({
  open,
  onOpenChange,
  currentFilters,
  onApply,
}: LogFilterModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      severity: undefined,
      from: currentFilters?.from ?? '',
      to: currentFilters?.to ?? '',
      search: currentFilters?.search ?? '',
      limit: currentFilters?.limit ?? 100,
    },
  });

  const severity = watch('severity');

  const onSubmit = (data: FilterFormValues) => {
    const params: LogsFilterParams = {
      limit: data.limit,
      search: data.search || undefined,
      from: data.from || undefined,
      to: data.to || undefined,
    };
    if (data.severity) {
      params.severity = data.severity as LogSeverity;
    }
    onApply(params);
    onOpenChange(false);
  };

  const handleClear = () => {
    reset({
      severity: undefined,
      from: '',
      to: '',
      search: '',
      limit: 100,
    });
    onApply({ limit: 100 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby="filter-desc">
        <DialogHeader>
          <DialogTitle>Filter logs</DialogTitle>
          <DialogDescription id="filter-desc">
            Refine the log stream by severity, date range, and keywords.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-severity">Severity</Label>
            <Select
              value={severity ?? ''}
              onValueChange={(v) => setValue('severity', (v ? (v as LogSeverity) : undefined) as FilterFormValues['severity'], { shouldDirty: true })}
            >
              <SelectTrigger id="filter-severity">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-from">From (ISO date)</Label>
              <Input
                id="filter-from"
                type="datetime-local"
                {...register('from')}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-to">To (ISO date)</Label>
              <Input
                id="filter-to"
                type="datetime-local"
                {...register('to')}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-search">Keyword search</Label>
            <Input
              id="filter-search"
              placeholder="Search in message"
              {...register('search')}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-limit">Max results</Label>
            <Input
              id="filter-limit"
              type="number"
              min={10}
              max={500}
              {...register('limit')}
              className="font-mono"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button type="submit" disabled={!isDirty}>
              Apply
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
