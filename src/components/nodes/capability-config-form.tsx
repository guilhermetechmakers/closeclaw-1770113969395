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
import { nodesApi } from '@/api/nodes';
import { cn } from '@/lib/utils';
import type { NodeCapability, Node } from '@/types/database';

const capabilityStatusSchema = z.object({
  status: z.enum(['enabled', 'disabled', 'pending_approval']),
  description: z.string().optional(),
});

type CapabilityFormValues = z.infer<typeof capabilityStatusSchema>;

interface CapabilityConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  capability: NodeCapability | null;
  onSubmit: (values: CapabilityFormValues) => void;
  isSubmitting?: boolean;
}

export function CapabilityConfigForm({
  open,
  onOpenChange,
  node,
  capability,
  onSubmit,
  isSubmitting = false,
}: CapabilityConfigFormProps) {
  const form = useForm<CapabilityFormValues>({
    resolver: zodResolver(capabilityStatusSchema),
    defaultValues: {
      status: 'enabled',
      description: '',
    },
    values:
      capability != null
        ? {
            status: capability.status,
            description: capability.description ?? '',
          }
        : undefined,
  });

  if (!node) return null;

  const description = capability
    ? nodesApi.getCapabilityDescription(capability.capability_key)
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="capability-config-description"
      >
        <DialogHeader>
          <DialogTitle>Capability configuration</DialogTitle>
          <DialogDescription id="capability-config-description">
            Update status and description for this capability on{' '}
            <span className="font-medium">{node.name ?? 'node'}</span>.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {capability && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Capability: </span>
              <span className="font-medium capitalize">
                {capability.capability_key.replace(/_/g, ' ')}
              </span>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cap-status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(v) =>
                form.setValue('status', v as CapabilityFormValues['status'])
              }
            >
              <SelectTrigger id="cap-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="pending_approval">Pending approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cap-description">Description (optional)</Label>
            <Input
              id="cap-description"
              placeholder="e.g. Remote exec for backup scripts"
              {...form.register('description')}
              className={cn(
                form.formState.errors.description && 'border-destructive'
              )}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
