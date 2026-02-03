import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image, FileText, Code, Download, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrowserCaptureRecord, BrowserCaptureType } from '@/types/database';

const typeLabels: Record<BrowserCaptureType, string> = {
  screenshot: 'Screenshot',
  pdf: 'PDF',
  dom: 'DOM snapshot',
};

const typeIcons: Record<BrowserCaptureType, React.ComponentType<{ className?: string }>> = {
  screenshot: Image,
  pdf: FileText,
  dom: Code,
};

interface OutputManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captures: BrowserCaptureRecord[];
  onDownload: (record: BrowserCaptureRecord) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function OutputManagementSheet({
  open,
  onOpenChange,
  captures,
  onDownload,
  onDelete,
  isDeleting = false,
}: OutputManagementSheetProps) {
  const handleView = (record: BrowserCaptureRecord) => {
    if (record.file_url) {
      window.open(record.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] max-h-[85vh] flex flex-col"
        showClose
      >
        <DialogHeader>
          <DialogTitle>Captured outputs</DialogTitle>
          <DialogDescription>
            View, download, or delete captured screenshots, PDFs, and DOM snapshots from this session.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-[200px] rounded-lg border border-border">
          {captures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Image className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">No captures yet</p>
              <p className="text-sm mt-1">Capture a screenshot, PDF, or DOM snapshot from the session to see them here.</p>
            </div>
          ) : (
            <ul className="p-2 space-y-2">
              {captures.map((record) => {
                const Icon = typeIcons[record.capture_type];
                const label = typeLabels[record.capture_type];
                const date = new Date(record.created_at).toLocaleString();
                const canView = !!record.file_url;
                return (
                  <li
                    key={record.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3',
                      'transition-shadow hover:shadow-md'
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground truncate" title={record.file_path ?? record.file_url ?? ''}>
                        {record.file_path ?? record.file_url ?? date}
                      </p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(record)}
                          aria-label="View in new tab"
                          className="h-8 w-8 transition-transform hover:scale-105"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(record)}
                        aria-label="Download"
                        className="h-8 w-8 transition-transform hover:scale-105"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(record.id)}
                        disabled={isDeleting}
                        aria-label="Delete"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
