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
import type { MarketplaceTransaction } from '@/types/database';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

export interface SubscriptionManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: MarketplaceTransaction | null;
  skillName?: string;
  onCancelSubscription: () => void;
  isSubmitting?: boolean;
}

export function SubscriptionManagementModal({
  open,
  onOpenChange,
  subscription,
  skillName = 'Skill',
  onCancelSubscription,
  isSubmitting = false,
}: SubscriptionManagementModalProps) {
  if (!subscription) return null;

  const isActive = subscription.status === 'completed' && subscription.stripe_subscription_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" showClose={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Manage subscription</DialogTitle>
          <DialogDescription>
            View and manage your subscription for {skillName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={subscription.status === 'completed' ? 'success' : 'secondary'}
              >
                {subscription.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: subscription.currency.toUpperCase(),
                }).format(subscription.amount)}
              </span>
            </div>
            {subscription.created_at && (
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Started</span>
                <span>{new Date(subscription.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {isActive && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Renewal and payment methods are managed in the checkout provider.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          {isActive && (
            <Button
              variant="destructive"
              onClick={onCancelSubscription}
              disabled={isSubmitting}
              className="transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Cancelling…' : 'Cancel subscription'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
