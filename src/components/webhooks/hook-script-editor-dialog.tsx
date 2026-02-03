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
import type { HookScript, HookScriptLanguage, Webhook } from '@/types/database';

const hookScriptSchema = z.object({
  event_trigger: z.string().min(1, 'Event trigger is required'),
  language: z.enum(['javascript', 'python']),
  script_content: z.string(),
  webhook_id: z.string().nullable(),
});

type HookScriptFormValues = z.infer<typeof hookScriptSchema>;

const EVENT_TRIGGERS = ['/new', '/reset', 'start', 'end', 'before_run', 'after_run'] as const;

interface HookScriptEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HookScriptFormValues) => void;
  isSubmitting?: boolean;
  script?: HookScript | null;
  webhooks: Webhook[];
}

const defaultValues: HookScriptFormValues = {
  event_trigger: '/new',
  language: 'javascript',
  script_content: '',
  webhook_id: null,
};

export function HookScriptEditorDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  script = null,
  webhooks,
}: HookScriptEditorDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HookScriptFormValues>({
    resolver: zodResolver(hookScriptSchema),
    defaultValues,
  });

  const language = watch('language');
  const webhookId = watch('webhook_id');

  useEffect(() => {
    if (script) {
      reset({
        event_trigger: script.event_trigger,
        language: script.language as HookScriptLanguage,
        script_content: script.script_content ?? '',
        webhook_id: script.webhook_id ?? null,
      });
    } else {
      reset(defaultValues);
    }
  }, [script, open, reset]);

  const onFormSubmit = (data: HookScriptFormValues) => {
    onSubmit(data);
    if (!script) reset(defaultValues);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        aria-describedby="hook-script-editor-description"
      >
        <DialogHeader>
          <DialogTitle>{script ? 'Edit hook script' : 'Add hook script'}</DialogTitle>
          <DialogDescription id="hook-script-editor-description">
            Sandboxed script (JavaScript or Python) for lifecycle events. Runs in a restricted environment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event_trigger">Event trigger</Label>
              <Select
                value={watch('event_trigger')}
                onValueChange={(v) => setValue('event_trigger', v)}
              >
                <SelectTrigger id="event_trigger" className={errors.event_trigger ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TRIGGERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.event_trigger && (
                <p className="text-xs text-destructive">{errors.event_trigger.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setValue('language', v as HookScriptLanguage)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {webhooks.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="webhook_id">Webhook (optional)</Label>
              <Select
                value={webhookId ?? 'none'}
                onValueChange={(v) => setValue('webhook_id', v === 'none' ? null : v)}
              >
                <SelectTrigger id="webhook_id">
                  <SelectValue placeholder="Global (all webhooks)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Global (all webhooks)</SelectItem>
                  {webhooks.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.route_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2 flex-1 min-h-[200px]">
            <Label htmlFor="script_content">Script content</Label>
            <textarea
              id="script_content"
              className="flex w-full flex-1 min-h-[200px] rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={language === 'javascript' ? '// e.g. return { ...payload };' : '# e.g. return { **payload }'}
              {...register('script_content')}
              spellCheck={false}
            />
          </div>
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
              {isSubmitting ? 'Saving…' : script ? 'Save' : 'Add script'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
