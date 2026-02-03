import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MarketplaceSkill } from '@/types/database';
import { ShoppingCart, Loader2 } from 'lucide-react';

export interface PurchaseConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: MarketplaceSkill | null;
  mode: 'one_time' | 'subscription';
  onConfirm: () => void;
  isSubmitting?: boolean;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

export function PurchaseConfirmationModal({
  open,
  onOpenChange,
  skill,
  mode,
  onConfirm,
  isSubmitting = false,
}: PurchaseConfirmationModalProps) {
  if (!skill) return null;

  const priceLabel =
    mode === 'subscription'
      ? `${formatPrice(skill.price, skill.currency)} / month`
      : formatPrice(skill.price, skill.currency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" showClose={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Confirm purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase this skill. You will be redirected to secure checkout.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <p className="font-medium text-foreground">{skill.name}</p>
          {skill.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {skill.description}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-primary">{priceLabel}</p>
          {mode === 'subscription' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Subscription; you can cancel anytime from your account.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="transition-transform hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Redirecting…' : 'Continue to checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
