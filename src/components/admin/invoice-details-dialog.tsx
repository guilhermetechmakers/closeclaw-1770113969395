import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CreditCard, Download, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { AdminLicense } from '@/types/database';

const licenseTypeLabels: Record<string, string> = {
  seat: 'Seat',
  pro: 'Pro',
  enterprise: 'Enterprise',
  trial: 'Trial',
};

export interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: AdminLicense | null;
  workspaceName?: string;
}

export function InvoiceDetailsDialog({
  open,
  onOpenChange,
  license = null,
  workspaceName = '—',
}: InvoiceDetailsDialogProps) {
  const expiryLabel = license?.expiry_date
    ? format(parseISO(license.expiry_date), 'MMM d, yyyy')
    : 'No expiry';
  const isExpired =
    license?.expiry_date && new Date(license.expiry_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
            Billing & invoice details
          </DialogTitle>
          <DialogDescription>
            Current license and billing information. Use Upgrade plan to change tier or manage payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Workspace</span>
              <span className="font-medium">{workspaceName}</span>
            </div>
            {license && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">License type</span>
                  <Badge variant={isExpired ? 'destructive' : 'default'}>
                    {licenseTypeLabels[license.license_type] ?? license.license_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Expires</span>
                  <span className={isExpired ? 'text-destructive' : ''}>{expiryLabel}</span>
                </div>
              </>
            )}
            {!license && (
              <p className="text-sm text-muted-foreground">
                No license linked. Allocate a license from License Management to see details here.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment options</h4>
            <p className="text-sm text-foreground/90 mb-3">
              Billing is processed securely. Invoices are available after each billing cycle.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="transition-transform hover:scale-[1.02]">
                <Download className="mr-2 h-4 w-4" />
                Download invoice
              </Button>
              <Button variant="outline" size="sm" className="transition-transform hover:scale-[1.02]">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment method
              </Button>
              <Button size="sm" className="transition-transform hover:scale-[1.02]">
                <ExternalLink className="mr-2 h-4 w-4" />
                Upgrade plan
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
