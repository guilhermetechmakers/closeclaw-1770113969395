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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Radio, ChevronRight, ChevronLeft, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelProvider } from '@/types/database';

const providerLabels: Record<ChannelProvider, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  slack: 'Slack',
  discord: 'Discord',
};

const step1Schema = z.object({
  provider: z.enum(['whatsapp', 'telegram', 'slack', 'discord']),
  display_name: z.string().optional(),
});

const step2Schema = z.object({
  retrieval_mode: z.enum(['webhook', 'polling']),
  webhook_url: z.string().url().optional().or(z.literal('')),
  polling_interval_seconds: z.coerce.number().min(30).max(3600).optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export interface AddChannelWizardPayload {
  provider: ChannelProvider;
  display_name?: string | null;
  webhook_url?: string | null;
  polling_interval_seconds?: number | null;
}

interface AddChannelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddChannelWizardPayload) => void;
  isSubmitting?: boolean;
}

const steps = [
  { id: 1, title: 'Provider', description: 'Select chat provider' },
  { id: 2, title: 'Retrieval', description: 'Webhook or polling' },
  { id: 3, title: 'Provision', description: 'QR or code if needed' },
  { id: 4, title: 'Confirm', description: 'Finish setup' },
];

export function AddChannelWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddChannelWizardProps) {
  const [step, setStep] = useState(1);

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { provider: 'telegram', display_name: '' },
  });

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      retrieval_mode: 'webhook',
      webhook_url: '',
      polling_interval_seconds: 60,
    },
  });

  const provider = form1.watch('provider');
  const retrievalMode = form2.watch('retrieval_mode');

  const handleNext = async () => {
    if (step === 1) {
      const ok = await form1.trigger();
      if (!ok) return;
    }
    if (step === 2) {
      const ok = await form2.trigger();
      if (!ok) return;
    }
    if (step === 4) {
      const s1 = form1.getValues();
      const s2 = form2.getValues();
      onSubmit({
        provider: s1.provider as ChannelProvider,
        display_name: s1.display_name || null,
        webhook_url:
          retrievalMode === 'webhook' && s2.webhook_url
            ? s2.webhook_url
            : null,
        polling_interval_seconds:
          retrievalMode === 'polling'
            ? s2.polling_interval_seconds ?? 60
            : null,
      });
      onOpenChange(false);
      setStep(1);
      form1.reset();
      form2.reset();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1);
      form1.reset();
      form2.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="add-channel-wizard-description"
      >
        <DialogHeader>
          <DialogTitle>Add channel</DialogTitle>
          <DialogDescription id="add-channel-wizard-description">
            Connect a chat channel adapter. Follow the steps to complete setup.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 py-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s.id <= step ? 'bg-primary' : 'bg-muted'
              )}
              aria-hidden
            />
          ))}
        </div>

        {step === 1 && (
          <form
            id="wizard-step1"
            className="space-y-4 py-4"
            onSubmit={form1.handleSubmit(() => setStep(2))}
          >
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Select
                value={provider}
                onValueChange={(v) => form1.setValue('provider', v as ChannelProvider)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(providerLabels) as ChannelProvider[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {providerLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display name (optional)</Label>
              <Input
                id="display_name"
                placeholder="e.g. Team Telegram"
                {...form1.register('display_name')}
              />
            </div>
          </form>
        )}

        {step === 2 && (
          <form
            id="wizard-step2"
            className="space-y-4 py-4"
            onSubmit={form2.handleSubmit(() => setStep(3))}
          >
            <div className="grid gap-2">
              <Label>Message retrieval</Label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="retrieval_mode"
                    value="webhook"
                    checked={retrievalMode === 'webhook'}
                    onChange={() => form2.setValue('retrieval_mode', 'webhook')}
                    className="h-4 w-4 accent-primary"
                  />
                  <Radio className="h-4 w-4" />
                  Webhook
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="retrieval_mode"
                    value="polling"
                    checked={retrievalMode === 'polling'}
                    onChange={() => form2.setValue('retrieval_mode', 'polling')}
                    className="h-4 w-4 accent-primary"
                  />
                  <MessageCircle className="h-4 w-4" />
                  Polling
                </label>
              </div>
            </div>
            {retrievalMode === 'webhook' && (
              <div className="grid gap-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  placeholder="https://..."
                  {...form2.register('webhook_url')}
                />
                {form2.formState.errors.webhook_url && (
                  <p className="text-xs text-destructive">
                    {form2.formState.errors.webhook_url.message}
                  </p>
                )}
              </div>
            )}
            {retrievalMode === 'polling' && (
              <div className="grid gap-2">
                <Label htmlFor="polling_interval_seconds">Polling interval (seconds)</Label>
                <Input
                  id="polling_interval_seconds"
                  type="number"
                  min={30}
                  max={3600}
                  {...form2.register('polling_interval_seconds')}
                />
              </div>
            )}
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-8">
              <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">
                {provider === 'whatsapp' || provider === 'telegram'
                  ? 'Scan the QR code with your app to link this channel. You can also use the pairing code shown in the next step.'
                  : 'Complete OAuth in the provider dashboard if required, then continue.'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Provisioning step is simulated. In production, QR and codes are generated by the gateway.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-card/50 p-4 text-sm">
              <p className="font-medium">{providerLabels[provider]}</p>
              {form1.getValues('display_name') && (
                <p className="text-muted-foreground">
                  {form1.getValues('display_name')}
                </p>
              )}
              <p className="mt-2 text-muted-foreground">
                Retrieval: {form2.getValues('retrieval_mode') === 'webhook' ? 'Webhook' : 'Polling'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {step === 4 ? (
              isSubmitting ? 'Adding…' : 'Add channel'
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
