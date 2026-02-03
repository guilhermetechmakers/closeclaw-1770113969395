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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, Trash2 } from 'lucide-react';
import {
  useRedactionRules,
  useCreateRedactionRule,
  useUpdateRedactionRule,
  useDeleteRedactionRule,
} from '@/hooks/useLogs';
import type { RedactionRule } from '@/types/database';
import { cn } from '@/lib/utils';

const addRuleSchema = z.object({
  field_name: z.string().min(1, 'Field name is required').max(120),
  is_redacted: z.boolean(),
});

type AddRuleFormValues = z.infer<typeof addRuleSchema>;

export interface RedactionRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RedactionRulesModal({
  open,
  onOpenChange,
}: RedactionRulesModalProps) {
  const [adding, setAdding] = useState(false);
  const { data: rules = [], isLoading } = useRedactionRules();
  const createRule = useCreateRedactionRule();
  const updateRule = useUpdateRedactionRule();
  const deleteRule = useDeleteRedactionRule();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<AddRuleFormValues>({
    resolver: zodResolver(addRuleSchema),
    defaultValues: { field_name: '', is_redacted: true },
  });

  const fieldName = watch('field_name');
  const isRedacted = watch('is_redacted');

  const onSubmit = (data: AddRuleFormValues) => {
    createRule.mutate(
      { field_name: data.field_name.trim(), is_redacted: data.is_redacted },
      {
        onSuccess: () => {
          reset({ field_name: '', is_redacted: true });
          setAdding(false);
        },
      }
    );
  };

  const handleToggle = (rule: RedactionRule) => {
    updateRule.mutate({
      id: rule.id,
      data: { is_redacted: !rule.is_redacted },
    });
  };

  const handleDelete = (id: string) => {
    deleteRule.mutate(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[520px] max-h-[90vh] flex flex-col"
        aria-describedby="redaction-desc"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            Redaction rules
          </DialogTitle>
          <DialogDescription id="redaction-desc">
            Configure which log and trace fields are redacted before storage and
            export. Rules apply by default to exports.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 rounded-md border border-border">
          <div className="p-2 space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </>
            ) : rules.length === 0 && !adding ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No redaction rules
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Add field names (e.g. message, metadata) to redact in logs
                  and exports.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add rule
                </Button>
              </div>
            ) : (
              <>
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
                      'border-border bg-card/50 transition-colors hover:bg-secondary/30'
                    )}
                  >
                    <span className="font-mono text-sm truncate flex-1">
                      {rule.field_name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={rule.is_redacted}
                        onCheckedChange={() => handleToggle(rule)}
                        aria-label={`Redact ${rule.field_name}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(rule.id)}
                        aria-label={`Delete rule ${rule.field_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {adding && (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="redaction-field-name">Field name</Label>
                      <Input
                        id="redaction-field-name"
                        placeholder="e.g. message, metadata"
                        className="font-mono text-sm"
                        {...register('field_name')}
                        autoFocus
                      />
                      {errors.field_name && (
                        <p className="text-xs text-destructive">
                          {errors.field_name.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="redaction-enabled">Redact by default</Label>
                      <Switch
                        id="redaction-enabled"
                        checked={isRedacted}
                        onCheckedChange={(v) => setValue('is_redacted', v)}
                      />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAdding(false);
                          reset({ field_name: '', is_redacted: true });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          !fieldName?.trim() ||
                          createRule.isPending ||
                          !isDirty
                        }
                      >
                        {createRule.isPending ? 'Adding…' : 'Add rule'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
                {!adding && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setAdding(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add rule
                  </Button>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
