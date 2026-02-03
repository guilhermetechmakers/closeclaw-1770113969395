import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export interface DownloadConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onOpenInNewTab?: () => void;
  title?: string;
  description?: string;
}

/**
 * Confirms user action to download the policy document and offers open/save options.
 */
export function DownloadConfirmationDialog({
  open,
  onOpenChange,
  onDownload,
  onOpenInNewTab,
  title = 'Download Privacy Policy',
  description = 'Save a copy for your records. You can open it in a new tab to print or save as PDF using your browser.',
}: DownloadConfirmationDialogProps) {
  const handleDownload = () => {
    onDownload();
    onOpenChange(false);
  };

  const handleOpenInNewTab = () => {
    onOpenInNewTab?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="download-confirmation-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription id="download-confirmation-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onOpenInNewTab && (
            <Button
              variant="outline"
              onClick={handleOpenInNewTab}
              className="transition-transform hover:scale-[1.02]"
            >
              Open in new tab
            </Button>
          )}
          <Button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
