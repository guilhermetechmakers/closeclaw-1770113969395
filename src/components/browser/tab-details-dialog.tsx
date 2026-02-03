import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import type { BrowserTab } from '@/types/database';
import { cn } from '@/lib/utils';

interface TabDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: BrowserTab | null;
}

export function TabDetailsDialog({ open, onOpenChange, tab }: TabDetailsDialogProps) {
  if (!tab) return null;

  const displayUrl = tab.url || 'about:blank';
  const displayTitle = tab.title || displayUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]" showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 truncate pr-8">
            {displayTitle}
          </DialogTitle>
          <DialogDescription className="break-all">
            {displayUrl}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {tab.snapshot_url && (
            <div className="rounded-lg border border-border overflow-hidden bg-secondary/30">
              <img
                src={tab.snapshot_url}
                alt={`Snapshot of ${displayTitle}`}
                className="w-full h-auto max-h-48 object-cover object-top"
              />
            </div>
          )}
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">URL</dt>
              <dd className="min-w-0 truncate text-right font-mono text-xs" title={tab.url}>
                {tab.url || '—'}
              </dd>
            </div>
            {tab.external_id && (
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">External ID</dt>
                <dd className="font-mono text-xs">{tab.external_id}</dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(tab.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
          {displayUrl.startsWith('http') && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
              )}
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
