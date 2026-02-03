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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AdapterConfiguration, DmPolicy, GroupPolicy } from '@/types/database';

const policySchema = z.object({
  dm_policy: z.enum(['pairing', 'allowlist', 'open', 'disabled']),
  group_policy: z.enum(['mention', 'open', 'disabled']),
  mention_gating: z.boolean(),
});

type PolicyFormValues = z.infer<typeof policySchema>;

const dmPolicyLabels: Record<DmPolicy, string> = {
  pairing: 'Pairing required',
  allowlist: 'Allowlist only',
  open: 'Open to all',
  disabled: 'Disabled',
};

const groupPolicyLabels: Record<GroupPolicy, string> = {
  mention: 'Mention required',
  open: 'Open to all',
  disabled: 'Disabled',
};

interface ChannelPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName?: string | null;
  config: AdapterConfiguration | null;
  onSubmit: (data: PolicyFormValues) => void;
  isSubmitting?: boolean;
}

export function ChannelPolicyDialog({
  open,
  onOpenChange,
  channelId: _channelId,
  channelName,
  config,
  onSubmit,
  isSubmitting = false,
}: ChannelPolicyDialogProps) {
  const defaultValues: PolicyFormValues = {
    dm_policy: config?.dm_policy ?? 'pairing',
    group_policy: config?.group_policy ?? 'mention',
    mention_gating: config?.mention_gating ?? true,
  };

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues,
  });

  const mentionGating = watch('mention_gating');

  useEffect(() => {
    if (open && config) {
      reset({
        dm_policy: config.dm_policy,
        group_policy: config.group_policy,
        mention_gating: config.mention_gating,
      });
    }
  }, [open, config, reset]);

  const onFormSubmit = (data: PolicyFormValues) => {
    onSubmit(data);
    reset(data);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="channel-policy-description"
      >
        <DialogHeader>
          <DialogTitle>Channel policy</DialogTitle>
          <DialogDescription id="channel-policy-description">
            {channelName
              ? `DM and group policies for ${channelName}`
              : 'Set DM policy, group policy, and mention gating for this channel.'}
          </DialogDescription>
        </DialogHeader>
        <form id="channel-policy-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>DM policy</Label>
            <Select
              value={watch('dm_policy')}
              onValueChange={(v) => setValue('dm_policy', v as DmPolicy, { shouldDirty: true })}
            >
              <SelectTrigger className={cn(errors.dm_policy && 'border-destructive')}>
                <SelectValue placeholder="Select DM policy" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(dmPolicyLabels) as DmPolicy[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {dmPolicyLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dm_policy && (
              <p className="text-xs text-destructive">{errors.dm_policy.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Group policy</Label>
            <Select
              value={watch('group_policy')}
              onValueChange={(v) => setValue('group_policy', v as GroupPolicy, { shouldDirty: true })}
            >
              <SelectTrigger className={cn(errors.group_policy && 'border-destructive')}>
                <SelectValue placeholder="Select group policy" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(groupPolicyLabels) as GroupPolicy[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {groupPolicyLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.group_policy && (
              <p className="text-xs text-destructive">{errors.group_policy.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="mention_gating">Mention gating</Label>
              <p className="text-xs text-muted-foreground">
                Require @mention in groups to trigger the agent
              </p>
            </div>
            <Switch
              id="mention_gating"
              checked={mentionGating}
              onCheckedChange={(checked) =>
                setValue('mention_gating', checked, { shouldDirty: true })
              }
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="channel-policy-form"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
