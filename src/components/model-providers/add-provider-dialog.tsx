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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ModelProvider, ModelProviderSlug } from '@/types/database';

const slugLabels: Record<ModelProviderSlug, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  local: 'Local',
  ollama: 'Ollama',
  vllm: 'vLLM',
  custom: 'Custom',
};

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(128),
  slug: z.enum(['openai', 'anthropic', 'local', 'ollama', 'vllm', 'custom']),
  api_endpoint_base: z.string().url().optional().or(z.literal('')),
  priority: z.coerce.number().int().min(0).max(999),
  is_default: z.boolean(),
  status: z.enum(['active', 'inactive', 'error']),
});

type FormValues = z.infer<typeof schema>;

export interface AddProviderDialogPayload {
  name: string;
  slug: ModelProviderSlug;
  api_endpoint_base?: string | null;
  priority?: number;
  is_default?: boolean;
  status?: 'active' | 'inactive' | 'error';
}

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddProviderDialogPayload) => void;
  isSubmitting?: boolean;
  provider?: ModelProvider | null;
}

export function AddProviderDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  provider,
}: AddProviderDialogProps) {
  const isEdit = !!provider;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: 'openai',
      api_endpoint_base: '',
      priority: 0,
      is_default: false,
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        provider
          ? {
              name: provider.name,
              slug: provider.slug,
              api_endpoint_base: provider.api_endpoint_base ?? '',
              priority: provider.priority,
              is_default: provider.is_default,
              status: provider.status,
            }
          : {
              name: '',
              slug: 'openai',
              api_endpoint_base: '',
              priority: 0,
              is_default: false,
              status: 'active',
            }
      );
    }
  }, [open, provider, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      name: values.name,
      slug: values.slug as ModelProviderSlug,
      api_endpoint_base: values.api_endpoint_base || null,
      priority: values.priority,
      is_default: values.is_default,
      status: values.status as 'active' | 'inactive' | 'error',
    });
    form.reset();
  });

  const onOpenChangeWithReset = (next: boolean) => {
    if (!next) form.reset(provider ? { name: provider.name, slug: provider.slug, api_endpoint_base: provider.api_endpoint_base ?? '', priority: provider.priority, is_default: provider.is_default, status: provider.status } : undefined);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWithReset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit provider' : 'Add provider'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update model provider settings and priority.'
              : 'Register a new AI model provider (OpenAI, Anthropic, local, etc.).'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. OpenAI GPT-4"
              {...form.register('name')}
              className={cn(form.formState.errors.name && 'border-destructive')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Provider type</Label>
            <Select
              value={form.watch('slug')}
              onValueChange={(v) => form.setValue('slug', v as ModelProviderSlug)}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(slugLabels) as ModelProviderSlug[]).map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {slugLabels[slug]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_endpoint_base">API endpoint (optional)</Label>
            <Input
              id="api_endpoint_base"
              placeholder="https://api.openai.com/v1"
              {...form.register('api_endpoint_base')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (higher = preferred)</Label>
            <Input
              id="priority"
              type="number"
              min={0}
              max={999}
              {...form.register('priority')}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="is_default" className="cursor-pointer">
              Default provider
            </Label>
            <Switch
              id="is_default"
              checked={form.watch('is_default')}
              onCheckedChange={(v) => form.setValue('is_default', v)}
            />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) =>
                  form.setValue('status', v as 'active' | 'inactive' | 'error')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChangeWithReset(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
