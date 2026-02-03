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
import type { BrowserCommandType, BrowserCommandInsert } from '@/types/database';

const commandTypes: { value: BrowserCommandType; label: string }[] = [
  { value: 'click', label: 'Click' },
  { value: 'type', label: 'Type' },
  { value: 'select', label: 'Select' },
  { value: 'navigate', label: 'Navigate' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'wait', label: 'Wait' },
  { value: 'screenshot', label: 'Screenshot' },
];

const commandSchema = z.object({
  command_type: z.enum([
    'click',
    'type',
    'select',
    'navigate',
    'scroll',
    'wait',
    'screenshot',
  ] as const),
  selector: z.string().optional(),
  text: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  value: z.string().optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  ms: z.coerce.number().min(0).optional(),
  sequence_order: z.coerce.number().min(0).optional(),
});

type CommandFormValues = z.infer<typeof commandSchema>;

interface CommandInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  browserProfileId: string | null;
  nextSequenceOrder: number;
  onSubmit: (data: Omit<BrowserCommandInsert, 'browser_profile_id'> & { browser_profile_id: string }) => void;
  isSubmitting?: boolean;
}

const defaultValues: CommandFormValues = {
  command_type: 'click',
  selector: '',
  text: '',
  url: '',
  value: '',
  sequence_order: 0,
};

export function CommandInputDialog({
  open,
  onOpenChange,
  browserProfileId,
  nextSequenceOrder,
  onSubmit,
  isSubmitting = false,
}: CommandInputDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: { ...defaultValues, sequence_order: nextSequenceOrder },
  });

  const commandType = watch('command_type');

  useEffect(() => {
    if (open && browserProfileId) {
      reset({ ...defaultValues, sequence_order: nextSequenceOrder });
    }
  }, [open, browserProfileId, nextSequenceOrder, reset]);

  const buildParameters = (data: CommandFormValues): Record<string, unknown> => {
    const params: Record<string, unknown> = {};
    if (data.selector?.trim()) params.selector = data.selector.trim();
    if (data.text !== undefined && data.text !== '') params.text = data.text;
    if (data.url?.trim()) params.url = data.url.trim();
    if (data.value !== undefined && data.value !== '') params.value = data.value;
    if (data.x !== undefined) params.x = data.x;
    if (data.y !== undefined) params.y = data.y;
    if (data.ms !== undefined) params.ms = data.ms;
    return params;
  };

  const onFormSubmit = (data: CommandFormValues) => {
    if (!browserProfileId) return;
    const parameters = buildParameters(data);
    onSubmit({
      browser_profile_id: browserProfileId,
      command_type: data.command_type,
      parameters,
      sequence_order: data.sequence_order ?? nextSequenceOrder,
      status: 'pending',
    });
    reset({ ...defaultValues, sequence_order: nextSequenceOrder + 1 });
    onOpenChange(false);
  };

  if (!browserProfileId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" showClose>
        <DialogHeader>
          <DialogTitle>Add command to queue</DialogTitle>
          <DialogDescription>
            Add an automation command. Commands run in sequence within the deterministic tab control environment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Command type</Label>
            <Select
              value={commandType}
              onValueChange={(v) => setValue('command_type', v as BrowserCommandType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {commandTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(commandType === 'click' || commandType === 'type' || commandType === 'select' || commandType === 'wait') && (
            <div className="space-y-2">
              <Label htmlFor="selector">Selector (CSS or XPath)</Label>
              <Input
                id="selector"
                placeholder="e.g. #submit-btn or //button[text()='OK']"
                {...register('selector')}
                className={errors.selector ? 'border-destructive' : ''}
              />
              {errors.selector && (
                <p className="text-sm text-destructive">{errors.selector.message}</p>
              )}
            </div>
          )}

          {commandType === 'type' && (
            <div className="space-y-2">
              <Label htmlFor="text">Text to type</Label>
              <Input
                id="text"
                placeholder="Text to enter"
                {...register('text')}
                className={errors.text ? 'border-destructive' : ''}
              />
            </div>
          )}

          {commandType === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="value">Option value</Label>
              <Input
                id="value"
                placeholder="Value to select"
                {...register('value')}
              />
            </div>
          )}

          {commandType === 'navigate' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register('url')}
                className={errors.url ? 'border-destructive' : ''}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>
          )}

          {commandType === 'scroll' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="scroll-x">X (px)</Label>
                <Input id="scroll-x" type="number" placeholder="0" {...register('x')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scroll-y">Y (px)</Label>
                <Input id="scroll-y" type="number" placeholder="0" {...register('y')} />
              </div>
            </div>
          )}

          {commandType === 'wait' && (
            <div className="space-y-2">
              <Label htmlFor="ms">Delay (ms)</Label>
              <Input
                id="ms"
                type="number"
                min={0}
                placeholder="1000"
                {...register('ms')}
                className={errors.ms ? 'border-destructive' : ''}
              />
              {errors.ms && (
                <p className="text-sm text-destructive">{errors.ms.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sequence_order">Order in queue</Label>
            <Input
              id="sequence_order"
              type="number"
              min={0}
              {...register('sequence_order')}
              className={errors.sequence_order ? 'border-destructive' : ''}
            />
            {errors.sequence_order && (
              <p className="text-sm text-destructive">{errors.sequence_order.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="transition-transform hover:scale-[1.02]">
              {isSubmitting ? 'Adding…' : 'Add command'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
