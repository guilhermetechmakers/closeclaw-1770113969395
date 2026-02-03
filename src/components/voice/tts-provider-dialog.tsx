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

const ttsSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().optional(),
});

type TtsFormValues = z.infer<typeof ttsSchema>;

const TTS_PROVIDERS = [
  { id: 'default', label: 'Default (system)' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Google Cloud TTS' },
  { id: 'amazon', label: 'Amazon Polly' },
  { id: 'elevenlabs', label: 'ElevenLabs' },
  { id: 'azure', label: 'Azure Speech' },
  { id: 'local', label: 'Local / Ollama' },
];

export interface TtsProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { provider: string; model: string | null }) => void;
  isSubmitting?: boolean;
  initialProvider?: string;
  initialModel?: string | null;
}

const defaultValues: TtsFormValues = {
  provider: 'default',
  model: '',
};

export function TtsProviderDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialProvider = 'default',
  initialModel = null,
}: TtsProviderDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TtsFormValues>({
    resolver: zodResolver(ttsSchema),
    defaultValues: {
      provider: initialProvider,
      model: initialModel ?? '',
    },
  });

  const provider = watch('provider');

  const onFormSubmit = (data: TtsFormValues) => {
    onSubmit({
      provider: data.provider,
      model: data.model?.trim() || null,
    });
    reset(defaultValues);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset({ provider: initialProvider, model: initialModel ?? '' });
    } else {
      reset(defaultValues);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="tts-provider-description"
      >
        <DialogHeader>
          <DialogTitle>TTS provider</DialogTitle>
          <DialogDescription id="tts-provider-description">
            Choose the text-to-speech provider and model for voice output.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => setValue('provider', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TTS_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tts-model">Model (optional)</Label>
            <Input
              id="tts-model"
              placeholder="e.g. tts-1, en-US-Standard-D"
              {...register('model')}
              className="transition-colors focus-visible:ring-2"
            />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
