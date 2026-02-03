import { supabase } from '@/lib/supabase';
import type { UserReportInsert } from '@/types/database';

export interface SubmitReportPayload {
  error_type: string;
  description: string;
  contact_email?: string | null;
  context?: Record<string, unknown>;
}

/**
 * Submit a user report (e.g. 500 error feedback) for support follow-up.
 * Works for both authenticated and anonymous users.
 */
export async function submitReport(payload: SubmitReportPayload): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  const insert: UserReportInsert = {
    user_id: user?.id ?? null,
    error_type: payload.error_type.trim(),
    description: payload.description.trim(),
    contact_email: payload.contact_email?.trim() || null,
    context: payload.context ?? {},
  };
  const { data, error } = await supabase
    .from('user_reports')
    .insert(insert as never)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id };
}
