import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplaceSkill } from '@/hooks/useMarketplace';
import { useCreateCheckoutSession } from '@/hooks/useMarketplace';
import { CheckoutForm } from '@/components/marketplace/checkout-form';
import { PaymentErrorDialog } from '@/components/marketplace/payment-error-dialog';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { CheckoutFormValues } from '@/components/marketplace/checkout-form';

export function MarketplaceCheckout() {
  const [searchParams] = useSearchParams();
  const skillId = searchParams.get('skillId') ?? '';
  const mode = (searchParams.get('mode') as 'one_time' | 'subscription') || 'one_time';
  const [paymentErrorOpen, setPaymentErrorOpen] = useState(false);

  const { data: skill, isLoading: skillLoading } = useMarketplaceSkill(skillId);
  const checkoutMutation = useCreateCheckoutSession();

  const handleSubmit = (_values: CheckoutFormValues) => {
    if (!skillId) return;
    checkoutMutation.mutate(
      {
        skill_id: skillId,
        mode,
        success_url: `${window.location.origin}/marketplace?success=1`,
        cancel_url: `${window.location.origin}/marketplace/checkout?skillId=${skillId}&mode=${mode}`,
      },
      {
        onError: () => setPaymentErrorOpen(true),
      }
    );
  };

  if (!skillId) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Button variant="ghost" asChild>
          <Link to="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Select a skill from the marketplace to checkout.</p>
            <Button asChild className="mt-4">
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (skillLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in-up">
      <Button variant="ghost" asChild>
        <Link to="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Complete your purchase. You will be redirected to secure payment.
        </p>
      </div>

      <CheckoutForm
        skill={skill ?? null}
        mode={mode}
        onSubmit={handleSubmit}
        isSubmitting={checkoutMutation.isPending}
      />

      <PaymentErrorDialog
        open={paymentErrorOpen}
        onOpenChange={setPaymentErrorOpen}
        onRetry={() => setPaymentErrorOpen(false)}
      />
    </div>
  );
}
