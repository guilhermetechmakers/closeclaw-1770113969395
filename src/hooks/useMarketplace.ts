import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listMarketplaceSkills,
  getMarketplaceSkill,
  listMarketplaceTransactions,
  listMarketplaceLicenses,
  createCheckoutSession,
  cancelSubscription,
  updateMarketplaceLicense,
} from '@/api/marketplace';
import type { MarketplaceLicenseUpdate } from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const MARKETPLACE_KEYS = {
  all: ['marketplace'] as const,
  skills: (params?: { category?: string; search?: string }) =>
    [...MARKETPLACE_KEYS.all, 'skills', params] as const,
  skill: (id: string) => [...MARKETPLACE_KEYS.all, 'skill', id] as const,
  transactions: () => [...MARKETPLACE_KEYS.all, 'transactions'] as const,
  licenses: () => [...MARKETPLACE_KEYS.all, 'licenses'] as const,
};

export function useMarketplaceSkills(params?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.skills(params),
    queryFn: () => safeGet(() => listMarketplaceSkills(params), []),
  });
}

export function useMarketplaceSkill(id: string | null) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.skill(id ?? ''),
    queryFn: () =>
      id ? getMarketplaceSkill(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useMarketplaceTransactions() {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.transactions(),
    queryFn: () => safeGet(() => listMarketplaceTransactions(), []),
  });
}

export function useMarketplaceLicenses() {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.licenses(),
    queryFn: () => safeGet(() => listMarketplaceLicenses(), []),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (result) => {
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.success('Checkout session created');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start checkout');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.transactions() });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.licenses() });
      toast.success('Subscription cancelled');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel subscription');
    },
  });
}

export function useUpdateMarketplaceLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarketplaceLicenseUpdate }) =>
      updateMarketplaceLicense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.licenses() });
      toast.success('License updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update license');
    },
  });
}
