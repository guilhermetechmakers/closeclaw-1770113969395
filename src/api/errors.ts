import { supabase } from '@/lib/supabase';
import type { ErrorLogInsert } from '@/types/database';

/**
 * Log a 404 error for analytics and troubleshooting.
 * Fire-and-forget; safe to call from 404 page without blocking.
 */
export async function log404Error(
  urlAttempted: string,
  referrerUrl?: string | null,
  userAgent?: string | null
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload: ErrorLogInsert = {
      error_code: '404',
      url_attempted: urlAttempted,
      user_id: user?.id ?? null,
      referrer_url: referrerUrl ?? null,
      user_agent: userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    };
    await supabase.from('error_logs').insert(payload as never);
  } catch {
    // Silently ignore logging failures (e.g. network, RLS)
  }
}

/**
 * Log a 500 (or other server) error for analytics and troubleshooting.
 * Fire-and-forget; safe to call from 500 page without blocking.
 */
export async function log500Error(
  urlAttempted: string,
  referrerUrl?: string | null,
  userAgent?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload: ErrorLogInsert = {
      error_code: '500',
      url_attempted: urlAttempted,
      user_id: user?.id ?? null,
      referrer_url: referrerUrl ?? null,
      user_agent: userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      metadata: metadata ?? {},
    };
    await supabase.from('error_logs').insert(payload as never);
  } catch {
    // Silently ignore logging failures (e.g. network, RLS)
  }
}
