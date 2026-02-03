import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarketplaceSkills,
  useCreateCheckoutSession,
  useMarketplaceLicenses,
} from '@/hooks/useMarketplace';
import { PurchaseConfirmationModal } from '@/components/marketplace/purchase-confirmation-modal';
import { PaymentErrorDialog } from '@/components/marketplace/payment-error-dialog';
import type { MarketplaceSkill } from '@/types/database';
import {
  Search,
  ShoppingBag,
  CreditCard,
  Package,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

function SkillCard({
  skill,
  hasLicense,
  onPurchase,
}: {
  skill: MarketplaceSkill;
  hasLicense: boolean;
  onPurchase: (skill: MarketplaceSkill, mode: 'one_time' | 'subscription') => void;
}) {
  const priceLabel = skill.is_subscription
    ? `${formatPrice(skill.price, skill.currency)} / mo`
    : formatPrice(skill.price, skill.currency);

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01]',
        'border-border bg-card'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {skill.image_url ? (
          <div className="h-32 w-full shrink-0 bg-secondary sm:h-auto sm:w-40">
            <img
              src={skill.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-full shrink-0 items-center justify-center bg-secondary/80 sm:h-auto sm:w-40">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{skill.name}</CardTitle>
              {skill.category && (
                <Badge variant="secondary" className="mt-1">
                  {skill.category}
                </Badge>
              )}
            </div>
            <span className="font-medium text-primary">{priceLabel}</span>
          </div>
          {skill.description && (
            <CardDescription className="mt-2 line-clamp-2">
              {skill.description}
            </CardDescription>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {hasLicense ? (
              <Badge variant="success">Owned</Badge>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => onPurchase(skill, 'one_time')}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <ShoppingBag className="mr-1.5 h-4 w-4" />
                  Purchase
                </Button>
                {skill.is_subscription && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPurchase(skill, 'subscription')}
                    className="transition-transform hover:scale-[1.02]"
                  >
                    <CreditCard className="mr-1.5 h-4 w-4" />
                    Subscribe
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Marketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [confirmSkill, setConfirmSkill] = useState<MarketplaceSkill | null>(null);
  const [confirmMode, setConfirmMode] = useState<'one_time' | 'subscription'>('one_time');
  const [paymentErrorOpen, setPaymentErrorOpen] = useState(false);

  const { data: skills = [], isLoading: skillsLoading } = useMarketplaceSkills({
    search: search.trim() || undefined,
    category,
  });
  const { data: licenses = [] } = useMarketplaceLicenses();
  const checkoutMutation = useCreateCheckoutSession();

  const licensedSkillIds = new Set(licenses.filter((l) => l.activation_status === 'active').map((l) => l.skill_id));

  const handlePurchaseClick = (skill: MarketplaceSkill, mode: 'one_time' | 'subscription') => {
    setConfirmSkill(skill);
    setConfirmMode(mode);
  };

  const handleConfirmPurchase = () => {
    if (!confirmSkill) return;
    checkoutMutation.mutate(
      {
        skill_id: confirmSkill.id,
        mode: confirmMode,
        success_url: `${window.location.origin}/marketplace?success=1`,
        cancel_url: `${window.location.origin}/marketplace`,
      },
      {
        onError: () => setPaymentErrorOpen(true),
      }
    );
  };

  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean)) as Set<string>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Browse and purchase premium skills. One-time or subscription.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/marketplace/licenses">
              <Package className="mr-2 h-4 w-4" />
              My licenses
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Browse skills</CardTitle>
          <CardDescription>
            Search and filter by category. Click Purchase or Subscribe to checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value ? e.target.value : undefined)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {skillsLoading ? (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No skills found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search or category, or check back later for new listings.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  hasLicense={licensedSkillIds.has(skill.id)}
                  onPurchase={handlePurchaseClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseConfirmationModal
        open={!!confirmSkill}
        onOpenChange={(open) => !open && setConfirmSkill(null)}
        skill={confirmSkill}
        mode={confirmMode}
        onConfirm={handleConfirmPurchase}
        isSubmitting={checkoutMutation.isPending}
      />

      <PaymentErrorDialog
        open={paymentErrorOpen}
        onOpenChange={setPaymentErrorOpen}
        onRetry={() => {
          setPaymentErrorOpen(false);
          if (confirmSkill) handleConfirmPurchase();
        }}
      />
    </div>
  );
}
