import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { MediaSetting } from '@/types/database';
import type { MediaFallbackStrategy, AudioNoteHandling } from '@/types/database';

const mediaSchema = z.object({
  retention_days: z.coerce.number().min(1).max(3650),
  size_cap_mb: z.coerce.number().min(1).max(1048576),
  fallback_strategy: z.enum(['local', 'cloud', 'none']),
  audio_note_handling: z.enum(['store', 'transcribe_and_store', 'transcribe_only', 'discard']),
});

type MediaFormValues = z.infer<typeof mediaSchema>;

export interface MediaSettingsFormProps {
  initial: MediaSetting | null;
  onSave: (data: MediaFormValues) => void;
  isSubmitting?: boolean;
}

const defaultValues: MediaFormValues = {
  retention_days: 30,
  size_cap_mb: 1024,
  fallback_strategy: 'local',
  audio_note_handling: 'store',
};

export function MediaSettingsForm({
  initial,
  onSave,
  isSubmitting = false,
}: MediaSettingsFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: initial
      ? {
          retention_days: initial.retention_days,
          size_cap_mb: initial.size_cap_mb,
          fallback_strategy: initial.fallback_strategy,
          audio_note_handling: initial.audio_note_handling,
        }
      : defaultValues,
  });

  const fallback_strategy = watch('fallback_strategy');
  const audio_note_handling = watch('audio_note_handling');

  useEffect(() => {
    if (initial) {
      reset({
        retention_days: initial.retention_days,
        size_cap_mb: initial.size_cap_mb,
        fallback_strategy: initial.fallback_strategy,
        audio_note_handling: initial.audio_note_handling,
      });
    } else {
      reset(defaultValues);
    }
  }, [initial, reset]);

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Media storage</CardTitle>
        <CardDescription>
          Retention, size caps, and fallback for audio notes and media capture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="retention-days">Retention (days)</Label>
            <Input
              id="retention-days"
              type="number"
              min={1}
              max={3650}
              {...register('retention_days')}
              className="transition-colors focus-visible:ring-2"
            />
            {errors.retention_days && (
              <p className="text-sm text-destructive">{errors.retention_days.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              How long to keep media before cleanup (1–3650)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="size-cap-mb">Size cap (MB)</Label>
            <Input
              id="size-cap-mb"
              type="number"
              min={1}
              {...register('size_cap_mb')}
              className="transition-colors focus-visible:ring-2"
            />
            {errors.size_cap_mb && (
              <p className="text-sm text-destructive">{errors.size_cap_mb.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Maximum storage for media; oldest items are removed when exceeded
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Fallback strategy</Label>
            <Select
              value={fallback_strategy}
              onValueChange={(v) => setValue('fallback_strategy', v as MediaFallbackStrategy)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local only</SelectItem>
                <SelectItem value="cloud">Cloud when local full</SelectItem>
                <SelectItem value="none">No fallback (fail when full)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Audio note handling</Label>
            <Select
              value={audio_note_handling}
              onValueChange={(v) => setValue('audio_note_handling', v as AudioNoteHandling)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store">Store only</SelectItem>
                <SelectItem value="transcribe_and_store">Transcribe and store</SelectItem>
                <SelectItem value="transcribe_only">Transcribe only</SelectItem>
                <SelectItem value="discard">Discard</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              What to do with captured audio notes
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save media settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
