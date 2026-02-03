import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RuntimeTool } from '@/types/database';
import type { LibrarySkill } from '@/types/database';
import type { PolicyCheckResult } from '@/api/runtime';

export type RunTarget =
  | { type: 'tool'; item: RuntimeTool }
  | { type: 'skill'; item: LibrarySkill }
  | null;

interface RunConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: RunTarget;
  policyResult?: PolicyCheckResult | null;
  onStart: (payload: {
    parameters?: Record<string, unknown>;
    env?: Record<string, string>;
  }) => void;
  isStarting?: boolean;
}

export function RunConfigurationModal({
  open,
  onOpenChange,
  target,
  policyResult,
  onStart,
  isStarting = false,
}: RunConfigurationModalProps) {
  const [parametersJson, setParametersJson] = useState('{}');
  const [envLines, setEnvLines] = useState('');
  const [parameterError, setParameterError] = useState<string | null>(null);

  const handleStart = () => {
    let parameters: Record<string, unknown> = {};
    if (parametersJson.trim()) {
      try {
        parameters = JSON.parse(parametersJson) as Record<string, unknown>;
      } catch {
        setParameterError('Invalid JSON');
        return;
      }
    }
    setParameterError(null);
    const env: Record<string, string> = {};
    envLines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const eq = line.indexOf('=');
        if (eq > 0) {
          env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
        }
      });
    onStart({ parameters: Object.keys(parameters).length ? parameters : undefined, env: Object.keys(env).length ? env : undefined });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setParametersJson('{}');
      setEnvLines('');
      setParameterError(null);
    }
    onOpenChange(next);
  };

  const passed = policyResult?.passed ?? true;
  const requirements = policyResult?.requirements ?? [];

  if (!target) return null;

  const name = target.type === 'tool' ? target.item.name : target.item.name;
  const description =
    target.type === 'tool'
      ? `Tool: ${(target.item as RuntimeTool).tool_type}`
      : `Skill: ${(target.item as LibrarySkill).registry_slug ?? target.item.name}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[640px]"
        aria-describedby="run-config-description"
      >
        <DialogHeader>
          <DialogTitle>Run configuration</DialogTitle>
          <DialogDescription id="run-config-description">
            Configure parameters and environment for this run. Policy checks
            must pass before starting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
            <p className="font-medium text-[rgb(var(--foreground))]">{name}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {description}
            </p>
          </div>

          {requirements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck
                  className={cn(
                    'h-4 w-4',
                    passed ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'
                  )}
                />
                Policy checks
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-[rgb(var(--muted-foreground))]">
                {requirements.map((r) => (
                  <li key={r.id}>
                    {r.label}: {r.met ? 'Met' : r.message ?? 'Not met'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="params">Parameters (JSON)</Label>
            <Textarea
              id="params"
              value={parametersJson}
              onChange={(e) => setParametersJson(e.target.value)}
              placeholder='{"key": "value"}'
              className="min-h-[80px] font-mono text-sm"
              rows={3}
            />
            {parameterError && (
              <p className="text-sm text-[rgb(var(--destructive))]">
                {parameterError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="env">Environment (KEY=value per line)</Label>
            <Textarea
              id="env"
              value={envLines}
              onChange={(e) => setEnvLines(e.target.value)}
              placeholder="API_KEY=secret"
              className="min-h-[60px] font-mono text-sm"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={isStarting || !passed}
            className="min-w-[100px]"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              'Start run'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
