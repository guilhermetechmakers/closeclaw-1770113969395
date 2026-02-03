import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GatingRequirement {
  id: string;
  label: string;
  met: boolean;
  message?: string;
}

export interface GatingCheckOverlayProps {
  open: boolean;
  onClose: () => void;
  requirements: GatingRequirement[];
  passed: boolean;
  title?: string;
  className?: string;
}

export function GatingCheckOverlay({
  open,
  onClose,
  requirements,
  passed,
  title = 'Gating checks',
  className,
}: GatingCheckOverlayProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/95 p-6 backdrop-blur-sm',
        className
      )}
      role="dialog"
      aria-labelledby="gating-overlay-title"
      aria-describedby="gating-overlay-desc"
    >
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="gating-overlay-title"
            className="text-lg font-semibold"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p id="gating-overlay-desc" className="mt-1 text-sm text-muted-foreground">
          {passed
            ? 'All requirements are met. You can save and deploy.'
            : 'Resolve the items below before saving or deploying.'}
        </p>
        <ul className="mt-4 space-y-2" role="list">
          {requirements.map((req) => (
            <li
              key={req.id}
              className={cn(
                'flex items-start gap-3 rounded-md border border-border px-3 py-2 text-sm',
                req.met ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'
              )}
            >
              {req.met ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-success" aria-hidden />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <span className="font-medium">{req.label}</span>
                {req.message && (
                  <p className="mt-0.5 text-muted-foreground">{req.message}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {requirements.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No gating checks defined.</p>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
