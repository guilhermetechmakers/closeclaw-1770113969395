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

const createWebhookSchema = z.object({
  route_name: z
    .string()
    .min(1, 'Route name is required')
    .regex(/^[a-z0-9_-]+$/i, 'Use only letters, numbers, hyphens, and underscores'),
  mapping_template: z.string().optional(),
  delivery_route: z.string().optional(),
  rate_limit: z
    .union([
      z.string().transform((v) => (v === '' ? null : Number(v))),
      z.number().int().positive().nullable(),
    ])
    .optional()
    .nullable()
    .refine(
      (v) =>
        v == null || (typeof v === 'number' && Number.isInteger(v) && v > 0),
      'Rate limit must be a positive integer'
    ),
});

type CreateWebhookValues = z.infer<typeof createWebhookSchema>;

export interface CreateWebhookPayload {
  route_name: string;
  mapping_template?: string | null;
  delivery_route?: string | null;
  rate_limit?: number | null;
}

interface CreateWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWebhookPayload) => void;
  isSubmitting?: boolean;
}

const defaultValues: CreateWebhookValues = {
  route_name: '',
  mapping_template: '',
  delivery_route: '',
  rate_limit: null,
};

export function CreateWebhookModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateWebhookModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWebhookValues>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues,
  });

  const onFormSubmit = (data: CreateWebhookValues) => {
    onSubmit({
      route_name: data.route_name.trim(),
      mapping_template: data.mapping_template?.trim() || null,
      delivery_route: data.delivery_route?.trim() || null,
      rate_limit: data.rate_limit ?? null,
    });
    reset(defaultValues);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="create-webhook-form-description"
      >
        <DialogHeader>
          <DialogTitle>Create webhook</DialogTitle>
          <DialogDescription id="create-webhook-form-description">
            Add an inbound webhook endpoint. A token will be generated; configure delivery routing if needed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="route_name">Route name</Label>
            <Input
              id="route_name"
              placeholder="e.g. my-integration"
              {...register('route_name')}
              className={errors.route_name ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {errors.route_name && (
              <p className="text-xs text-destructive">{errors.route_name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delivery_route">Delivery route (optional)</Label>
            <Input
              id="delivery_route"
              placeholder="e.g. session or channel target"
              {...register('delivery_route')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate_limit">Rate limit (optional, requests/min)</Label>
            <Input
              id="rate_limit"
              type="number"
              min={1}
              placeholder="e.g. 60"
              {...register('rate_limit')}
            />
            {errors.rate_limit && (
              <p className="text-xs text-destructive">{errors.rate_limit.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mapping_template">Mapping template (optional)</Label>
            <textarea
              id="mapping_template"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="JSON or template for payload mapping"
              {...register('mapping_template')}
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
              {isSubmitting ? 'Creating…' : 'Create webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
