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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: { url: string; name?: string }[];
  onAdd: (url: string, name?: string) => void;
  onRemove: (index: number) => void;
  onConfirm: () => void;
  maxAttachments?: number;
  className?: string;
}

export function AttachmentModal({
  open,
  onOpenChange,
  attachments,
  onAdd,
  onRemove,
  onConfirm,
  maxAttachments = 5,
  className,
}: AttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed || attachments.length >= maxAttachments) return;
    onAdd(trimmed, name.trim() || undefined);
    setUrl('');
    setName('');
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[640px]', className)}
        aria-describedby="attachment-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Manage attachments</DialogTitle>
          <DialogDescription id="attachment-modal-description">
            Add links or URLs to attach to your message. You can add up to{' '}
            {maxAttachments} attachments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="attach-url">URL</Label>
              <Input
                id="attach-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="rounded-md border-input"
              />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor="attach-name">Name (optional)</Label>
              <Input
                id="attach-name"
                placeholder="Label"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border-input"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleAdd}
              disabled={!url.trim() || attachments.length >= maxAttachments}
              className="mt-6 shrink-0"
              aria-label="Add attachment"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments ({attachments.length}/{maxAttachments})</Label>
              <ScrollArea className="h-32 rounded-md border border-border p-2">
                <ul className="space-y-1">
                  {attachments.map((att, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded bg-secondary/50 px-2 py-1.5 text-sm"
                    >
                      <span className="truncate">{att.name ?? att.url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(i)}
                        aria-label="Remove attachment"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
