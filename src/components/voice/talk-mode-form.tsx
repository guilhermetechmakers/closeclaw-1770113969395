import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TalkModeSetting, Node, InterruptSensitivity } from '@/types/database';

const talkModeSchema = z.object({
  node_id: z.string().nullable(),
  enabled: z.boolean(),
  interrupt_sensitivity: z.enum(['low', 'medium', 'high']),
});

type TalkModeFormValues = z.infer<typeof talkModeSchema>;

export interface TalkModeFormProps {
  nodes: Node[];
  settings: TalkModeSetting[];
  defaultSetting: TalkModeSetting | null;
  onSave: (data: {
    node_id: string | null;
    enabled: boolean;
    interrupt_sensitivity: InterruptSensitivity;
  }) => void;
  isSubmitting?: boolean;
}

export function TalkModeForm({
  nodes,
  settings,
  defaultSetting,
  onSave,
  isSubmitting = false,
}: TalkModeFormProps) {
  const defaultNodeId = '';
  const defaultValues: TalkModeFormValues = {
    node_id: defaultNodeId,
    enabled: defaultSetting?.enabled ?? false,
    interrupt_sensitivity: defaultSetting?.interrupt_sensitivity ?? 'medium',
  };

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<TalkModeFormValues>({
    resolver: zodResolver(talkModeSchema),
    defaultValues,
  });

  useEffect(() => {
    reset({
      node_id: defaultNodeId,
      enabled: defaultSetting?.enabled ?? false,
      interrupt_sensitivity: defaultSetting?.interrupt_sensitivity ?? 'medium',
    });
  }, [defaultSetting, reset]);

  const nodeId = watch('node_id');
  const enabled = watch('enabled');
  const interrupt_sensitivity = watch('interrupt_sensitivity');

  const onFormSubmit = (data: TalkModeFormValues) => {
    const id = data.node_id === '' || !data.node_id ? null : data.node_id;
    onSave({
      node_id: id,
      enabled: data.enabled,
      interrupt_sensitivity: data.interrupt_sensitivity as InterruptSensitivity,
    });
    reset({
      node_id: data.node_id,
      enabled: data.enabled,
      interrupt_sensitivity: data.interrupt_sensitivity,
    });
  };

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Talk mode</CardTitle>
        <CardDescription>
          Enable or disable voice interaction per node and set interrupt sensitivity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label>Node</Label>
            <Select
              value={nodeId || defaultNodeId}
              onValueChange={(v) => {
                const id = v === defaultNodeId ? null : v;
                const s = id === null ? defaultSetting : settings.find((x) => x.node_id === id);
                setValue('node_id', v || defaultNodeId);
                setValue('enabled', s?.enabled ?? false);
                setValue('interrupt_sensitivity', (s?.interrupt_sensitivity ?? 'medium') as InterruptSensitivity);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Default (all nodes)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default (all nodes)</SelectItem>
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name || n.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="talk-enabled">Talk mode</Label>
              <p className="text-sm text-muted-foreground">
                {nodeId ? 'Enable for this node' : 'Enable for all nodes by default'}
              </p>
            </div>
            <Switch
              id="talk-enabled"
              checked={enabled}
              onCheckedChange={(v) => setValue('enabled', v)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Interrupt sensitivity</Label>
            <Select
              value={interrupt_sensitivity}
              onValueChange={(v) => setValue('interrupt_sensitivity', v as InterruptSensitivity)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How quickly the agent stops when you start speaking
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save talk mode'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
