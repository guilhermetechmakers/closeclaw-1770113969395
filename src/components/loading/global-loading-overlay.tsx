import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalLoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

/**
 * Full-screen overlay with spinner and action description.
 * Shown during prolonged operations (e.g. form submit, data fetch).
 */
export function GlobalLoadingOverlay({
  visible,
  message = 'Processing…',
  className,
}: GlobalLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4',
        'bg-background/80 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-card-hover">
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-hidden
        />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
}
