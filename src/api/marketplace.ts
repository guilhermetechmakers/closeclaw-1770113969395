import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import type {
  MarketplaceSkill,
  MarketplaceTransaction,
  MarketplaceLicense,
  MarketplaceTransactionInsert,
  MarketplaceLicenseUpdate,
} from '@/types/database';

/** List marketplace skills with optional category filter and search */
export async function listMarketplaceSkills(params?: {
  category?: string;
  search?: string;
  status?: 'active';
}): Promise<MarketplaceSkill[]> {
  let query = supabase
    .from('marketplace_skills')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.status !== undefined) {
    query = query.eq('status', params.status);
  } else {
    query = query.eq('status', 'active');
  }
  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.search?.trim()) {
    const term = params.search.trim();
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MarketplaceSkill[];
}

/** Get a single marketplace skill by id */
export async function getMarketplaceSkill(id: string): Promise<MarketplaceSkill | null> {
  const { data, error } = await supabase
    .from('marketplace_skills')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as MarketplaceSkill;
}

/** List transactions for the current user (requires auth) */
export async function listMarketplaceTransactions(): Promise<MarketplaceTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('marketplace_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MarketplaceTransaction[];
}

/** List licenses for the current user */
export async function listMarketplaceLicenses(): Promise<MarketplaceLicense[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('marketplace_licenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MarketplaceLicense[];
}

/** Create checkout session (Stripe). Backend returns URL to redirect. */
export interface CreateCheckoutSessionPayload {
  skill_id: string;
  mode: 'one_time' | 'subscription';
  success_url?: string;
  cancel_url?: string;
}

export interface CreateCheckoutSessionResult {
  url: string;
  session_id: string;
}

export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload
): Promise<CreateCheckoutSessionResult> {
  return api.post<CreateCheckoutSessionResult>('/marketplace/checkout-session', payload);
}

/** Create subscription (Stripe). Used when modifying/cancelling is handled elsewhere. */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await api.post('/marketplace/subscription/cancel', { subscription_id: subscriptionId });
}

/** Update license activation (activate/deactivate). */
export async function updateMarketplaceLicense(
  id: string,
  data: MarketplaceLicenseUpdate
): Promise<MarketplaceLicense> {
  const { data: row, error } = await supabase
    .from('marketplace_licenses')
    .update(data as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as MarketplaceLicense;
}

/** Record a transaction (typically called by backend after Stripe webhook; exposed for testing or manual entry). */
export async function createMarketplaceTransaction(
  insert: MarketplaceTransactionInsert
): Promise<MarketplaceTransaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== insert.user_id) throw new Error('Unauthorized');
  const { data, error } = await supabase
    .from('marketplace_transactions')
    .insert(insert as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as MarketplaceTransaction;
}
