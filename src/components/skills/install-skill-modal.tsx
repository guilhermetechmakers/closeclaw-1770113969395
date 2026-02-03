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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Loader2, ShieldCheck } from 'lucide-react';
import type { RegistrySkillItem } from '@/api/skills';
import { cn } from '@/lib/utils';

interface GatingItem {
  id: string;
  label: string;
  met: boolean;
  message?: string;
}

interface InstallSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RegistrySkillItem | null;
  gatingChecks?: GatingItem[];
  onInstall: (env?: Record<string, string>) => void;
  isInstalling?: boolean;
}

export function InstallSkillModal({
  open,
  onOpenChange,
  item,
  gatingChecks = [],
  onInstall,
  isInstalling = false,
}: InstallSkillModalProps) {
  const [step, setStep] = useState(0);
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [acceptedProvenance, setAcceptedProvenance] = useState(false);

  const allMet = gatingChecks.length === 0 || gatingChecks.every((g) => g.met);
  const envVars =
    item?.environment_requirements && Array.isArray(item.environment_requirements)
      ? (item.environment_requirements as string[])
      : [];
  const hasEnvStep = envVars.length > 0;
  const steps = [
    { id: 'gating', label: 'Gating checks' },
    ...(hasEnvStep ? [{ id: 'env', label: 'Environment' }] : []),
    { id: 'provenance', label: 'Provenance' },
  ];

  const currentStepIndex = step;
  const canProceedFromGating = allMet;
  const canProceedFromEnv = !hasEnvStep || envVars.every((k) => (envValues[k] ?? '').trim().length > 0);
  const canInstall = steps[steps.length - 1]?.id === 'provenance' ? acceptedProvenance : canProceedFromGating && canProceedFromEnv;

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else if (canInstall) onInstall(envValues);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(0);
      setEnvValues({});
      setAcceptedProvenance(false);
    }
    onOpenChange(next);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="install-skill-description"
      >
        <DialogHeader>
          <DialogTitle>Install {item.name}</DialogTitle>
          <DialogDescription id="install-skill-description">
            Review gating checks, provide required env (if any), and confirm
            provenance before installing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 py-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                i === currentStepIndex
                  ? 'bg-primary/20 text-primary'
                  : i < currentStepIndex
                    ? 'bg-muted text-muted-foreground'
                    : 'text-muted-foreground'
              )}
            >
              {i < currentStepIndex ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {s.label}
            </div>
          ))}
        </div>

        {steps[currentStepIndex]?.id === 'gating' && (
          <div className="space-y-2">
            {gatingChecks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No gating checks required for this skill.
              </p>
            ) : (
              gatingChecks.map((g) => (
                <div
                  key={g.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm',
                    g.met ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
                  )}
                >
                  {g.met ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-warning" />
                  )}
                  <span>{g.label}</span>
                  {g.message && (
                    <span className="text-muted-foreground">— {g.message}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {steps[currentStepIndex]?.id === 'env' && hasEnvStep && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Provide values for required environment variables (stored securely).
            </p>
            {envVars.map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`env-${key}`} className="text-sm">
                  {key}
                </Label>
                <input
                  id={`env-${key}`}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={envValues[key] ?? ''}
                  onChange={(e) =>
                    setEnvValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {steps[currentStepIndex]?.id === 'provenance' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
              <div className="text-sm">
                <p className="font-medium">Provenance &amp; signature</p>
                <p className="text-muted-foreground">
                  This skill is from the registry ({item.registry_slug}). By
                  installing, you confirm that you have reviewed the permissions
                  and accept the source.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="provenance-accept"
                checked={acceptedProvenance}
                onCheckedChange={(v) => setAcceptedProvenance(v === true)}
              />
              <Label
                htmlFor="provenance-accept"
                className="text-sm font-normal cursor-pointer"
              >
                I have reviewed the skill and accept the provenance.
              </Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isInstalling}
          >
            Cancel
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={() => setStep(currentStepIndex + 1)}
              disabled={
                (steps[currentStepIndex]?.id === 'gating' && !canProceedFromGating) ||
                (steps[currentStepIndex]?.id === 'env' && !canProceedFromEnv)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canInstall || isInstalling}
            >
              {isInstalling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Installing…
                </>
              ) : (
                'Install'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
