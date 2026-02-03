import { useState, useEffect } from 'react';
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
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PROVIDERS = ['whisper', 'google', 'assemblyai', 'deepgram', 'local-cli'];

export interface TranscriptionBackendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerList: string[];
  cliFallback: string | null;
  onSave: (providerList: string[], cliFallback: string | null) => void;
  isSubmitting?: boolean;
}

export function TranscriptionBackendDialog({
  open,
  onOpenChange,
  providerList,
  cliFallback,
  onSave,
  isSubmitting = false,
}: TranscriptionBackendDialogProps) {
  const [order, setOrder] = useState<string[]>(providerList.length > 0 ? [...providerList] : [...DEFAULT_PROVIDERS]);
  const [cli, setCli] = useState(cliFallback ?? '');

  useEffect(() => {
    if (open) {
      setOrder(providerList.length > 0 ? [...providerList] : [...DEFAULT_PROVIDERS]);
      setCli(cliFallback ?? '');
    }
  }, [open, providerList, cliFallback]);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrder(next);
  };

  const moveDown = (index: number) => {
    if (index >= order.length - 1) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrder(next);
  };

  const remove = (index: number) => {
    setOrder((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(order, cli.trim() || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="transcription-backend-description"
      >
        <DialogHeader>
          <DialogTitle>Transcription backends</DialogTitle>
          <DialogDescription id="transcription-backend-description">
            Set the order of preference for transcription providers. First available is used.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Provider order (first = preferred)</Label>
            <ul className="flex flex-col gap-2 rounded-lg border border-border p-2">
              {order.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-secondary/50'
                  )}
                >
                  <span className="text-muted-foreground" aria-hidden>
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="flex-1 font-medium">{name}</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveDown(index)}
                      disabled={index === order.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cli-fallback">CLI fallback command</Label>
            <Input
              id="cli-fallback"
              placeholder="e.g. /usr/bin/whisper-cli"
              value={cli}
              onChange={(e) => setCli(e.target.value)}
              className="transition-colors focus-visible:ring-2"
            />
            <p className="text-sm text-muted-foreground">
              Optional local CLI used when cloud providers are unavailable
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
