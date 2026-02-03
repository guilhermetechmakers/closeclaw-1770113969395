import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarketplaceLicenses,
  useMarketplaceSkills,
  useUpdateMarketplaceLicense,
  useMarketplaceTransactions,
  useCancelSubscription,
} from '@/hooks/useMarketplace';
import { SubscriptionManagementModal } from '@/components/marketplace/subscription-management-modal';
import type { MarketplaceLicense, MarketplaceTransaction } from '@/types/database';
import { Package, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketplaceLicenses() {
  const [managingSubscription, setManagingSubscription] = useState<MarketplaceTransaction | null>(null);

  const { data: licenses = [], isLoading: licensesLoading } = useMarketplaceLicenses();
  const { data: skills = [] } = useMarketplaceSkills();
  const { data: transactions = [] } = useMarketplaceTransactions();
  const updateLicense = useUpdateMarketplaceLicense();
  const cancelSubscription = useCancelSubscription();

  const skillMap = new Map(skills.map((s) => [s.id, s]));
  const transactionMap = new Map(transactions.map((t) => [t.id, t]));

  const handleToggleActivation = (license: MarketplaceLicense) => {
    const next =
      license.activation_status === 'active' ? 'inactive' : 'active';
    updateLicense.mutate({
      id: license.id,
      data: { activation_status: next },
    });
  };

  const openSubscriptionModal = (transaction: MarketplaceTransaction) => {
    setManagingSubscription(transaction);
  };

  const subscriptionForLicense = (license: MarketplaceLicense): MarketplaceTransaction | undefined => {
    if (license.transaction_id) return transactionMap.get(license.transaction_id);
    return transactions.find(
      (t) => t.skill_id === license.skill_id && t.stripe_subscription_id && t.status === 'completed'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My licenses</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your purchased skill licenses and subscriptions.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/marketplace">
            <Package className="mr-2 h-4 w-4" />
            Browse Marketplace
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
          <CardDescription>
            Activate or deactivate licenses. Manage subscriptions from the action below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {licensesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No licenses yet</p>
              <p className="text-sm text-muted-foreground">
                Purchase a skill from the marketplace to see your licenses here.
              </p>
              <Button asChild className="mt-4">
                <Link to="/marketplace">Go to Marketplace</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {licenses.map((license) => {
                const skill = skillMap.get(license.skill_id);
                const subscription = subscriptionForLicense(license);
                const isActive = license.activation_status === 'active';

                return (
                  <li
                    key={license.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30',
                      !isActive && 'opacity-75'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {skill?.name ?? 'Unknown skill'}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            license.activation_status === 'active'
                              ? 'success'
                              : license.activation_status === 'expired'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {license.activation_status}
                        </Badge>
                        {license.expiration_date && (
                          <span className="text-xs text-muted-foreground">
                            Expires {new Date(license.expiration_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {subscription?.stripe_subscription_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubscriptionModal(subscription)}
                        >
                          <CreditCard className="mr-1.5 h-4 w-4" />
                          Manage subscription
                        </Button>
                      )}
                      {license.activation_status !== 'expired' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActivation(license)}
                          disabled={updateLicense.isPending}
                        >
                          {isActive ? (
                            <>
                              <ToggleRight className="mr-1.5 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-1.5 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <SubscriptionManagementModal
        open={!!managingSubscription}
        onOpenChange={(open) => !open && setManagingSubscription(null)}
        subscription={managingSubscription}
        skillName={
          managingSubscription
            ? skillMap.get(managingSubscription.skill_id)?.name
            : undefined
        }
        onCancelSubscription={() => {
          if (managingSubscription?.stripe_subscription_id) {
            cancelSubscription.mutate(managingSubscription.stripe_subscription_id, {
              onSettled: () => setManagingSubscription(null),
            });
          }
        }}
        isSubmitting={cancelSubscription.isPending}
      />
    </div>
  );
}
