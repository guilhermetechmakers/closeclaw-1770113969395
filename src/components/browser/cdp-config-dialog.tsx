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
import { useEffect } from 'react';
import type { BrowserCdpToken, BrowserCdpTokenInsert, BrowserCdpTokenUpdate } from '@/types/database';
import { EyeOff } from 'lucide-react';

const cdpConfigSchema = z.object({
  connection_type: z.enum(['local', 'node_proxy']),
  token_preview: z.string().max(20).optional(),
  config_json: z.string().optional(),
});

type CdpConfigFormValues = z.infer<typeof cdpConfigSchema>;

interface CdpConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: BrowserCdpToken | null;
  onSubmit: (data: Omit<BrowserCdpTokenInsert, 'user_id'> | BrowserCdpTokenUpdate) => void;
  isSubmitting?: boolean;
}

const defaultValues: CdpConfigFormValues = {
  connection_type: 'local',
  token_preview: '',
  config_json: '{}',
};

export function CdpConfigDialog({
  open,
  onOpenChange,
  existing,
  onSubmit,
  isSubmitting = false,
}: CdpConfigDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CdpConfigFormValues>({
    resolver: zodResolver(cdpConfigSchema),
    defaultValues: existing
      ? {
          connection_type: existing.connection_type,
          token_preview: existing.token_preview ?? '',
          config_json:
            typeof existing.config_json === 'object'
              ? JSON.stringify(existing.config_json, null, 2)
              : '{}',
        }
      : defaultValues,
  });

  const connectionType = watch('connection_type');

  useEffect(() => {
    if (open) {
      reset(
        existing
          ? {
              connection_type: existing.connection_type,
              token_preview: existing.token_preview ?? '',
              config_json:
                typeof existing.config_json === 'object'
                  ? JSON.stringify(existing.config_json, null, 2)
                  : '{}',
            }
          : defaultValues
      );
    }
  }, [open, existing, reset]);

  const onFormSubmit = (data: CdpConfigFormValues) => {
    let configJson: Record<string, unknown> = {};
    try {
      configJson = data.config_json ? JSON.parse(data.config_json) : {};
    } catch {
      configJson = {};
    }
    if (existing) {
      onSubmit({
        connection_type: data.connection_type,
        token_preview: data.token_preview || null,
        config_json: configJson,
      });
    } else {
      onSubmit({
        connection_type: data.connection_type,
        token_preview: data.token_preview || null,
        config_json: configJson,
      });
    }
    reset(defaultValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]" showClose>
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit CDP connector' : 'Add CDP connector'}</DialogTitle>
          <DialogDescription>
            Configure local or node proxy CDP connection. Sensitive token data is stored securely and only a redacted preview is shown here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Connection type</Label>
            <Select
              value={connectionType}
              onValueChange={(v) => setValue('connection_type', v as 'local' | 'node_proxy')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="node_proxy">Node proxy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-preview" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              Token preview (redacted)
            </Label>
            <Input
              id="token-preview"
              placeholder="e.g. ws://***...***"
              {...register('token_preview')}
            />
            <p className="text-xs text-muted-foreground">
              Optional label or redacted preview for this token. The actual token is never stored in plain text.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="config-json">Config (JSON, optional)</Label>
            <textarea
              id="config-json"
              placeholder='{"host": "localhost", "port": 9222}'
              {...register('config_json')}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.config_json && (
              <p className="text-sm text-destructive">{errors.config_json.message}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : existing ? 'Save changes' : 'Add connector'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
