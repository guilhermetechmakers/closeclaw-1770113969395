import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Image, FileText, Code } from 'lucide-react';
import type { BrowserCaptureType } from '@/types/database';
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

interface CaptureConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captureType: BrowserCaptureType;
  fileUrl?: string | null;
  filePath?: string | null;
  onDownload?: () => void;
  onClose?: () => void;
}

export function CaptureConfirmationDialog({
  open,
  onOpenChange,
  captureType,
  fileUrl,
  filePath,
  onDownload,
  onClose,
}: CaptureConfirmationDialogProps) {
  const Icon = typeIcons[captureType];
  const label = typeLabels[captureType];
  const canDownload = !!fileUrl;

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]" showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-accent" />
            {label} captured
          </DialogTitle>
          <DialogDescription>
            Your {label.toLowerCase()} has been saved. You can download it or continue capturing.
          </DialogDescription>
        </DialogHeader>
        {filePath && (
          <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-mono text-muted-foreground truncate" title={filePath}>
            {filePath}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {canDownload && (
            <Button
              onClick={() => {
                onDownload?.();
                if (fileUrl) {
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = `capture-${captureType}-${Date.now()}`;
                  a.click();
                }
                handleClose();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
