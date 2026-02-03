import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MarketplaceSkill } from '@/types/database';
import { Loader2, ShoppingCart } from 'lucide-react';

const checkoutFormSchema = z.object({
  email: z.string().email('Invalid email'),
  accept_terms: z
    .boolean()
    .refine((v) => v === true, {
      message: 'You must accept the terms to continue',
    }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export interface CheckoutFormProps {
  skill: MarketplaceSkill | null;
  mode: 'one_time' | 'subscription';
  onSubmit: (values: CheckoutFormValues) => void;
  isSubmitting?: boolean;
  defaultEmail?: string;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

export function CheckoutForm({
  skill,
  mode,
  onSubmit,
  isSubmitting = false,
  defaultEmail = '',
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: defaultEmail,
      accept_terms: false,
    },
  });

  if (!skill) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Select a skill to checkout.</p>
        </CardContent>
      </Card>
    );
  }

  const priceLabel =
    mode === 'subscription'
      ? `${formatPrice(skill.price, skill.currency)} / month`
      : formatPrice(skill.price, skill.currency);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
          <CardDescription>Review your selection before payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{skill.name}</span>
            <span className="font-medium">{priceLabel}</span>
          </div>
          {mode === 'subscription' && (
            <p className="text-xs text-muted-foreground">
              You will be charged each billing period until you cancel.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Receipt and updates will be sent to this email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              className="transition-colors focus-visible:ring-[rgb(var(--primary))]"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="checkout-terms"
              className="h-4 w-4 rounded border-input focus:ring-[rgb(var(--primary))]"
              {...register('accept_terms')}
            />
            <Label htmlFor="checkout-terms" className="text-sm font-normal">
              I accept the{' '}
              <a href="/terms" className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </Label>
          </div>
          {errors.accept_terms && (
            <p className="text-sm text-destructive">{errors.accept_terms.message}</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        You will be redirected to our secure payment provider to complete the transaction. Your
        payment details are never stored on our servers.
      </p>

      <Button
        type="submit"
        className="w-full transition-transform hover:scale-[1.02]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? 'Redirecting to checkout…' : 'Proceed to payment'}
      </Button>
    </form>
  );
}
