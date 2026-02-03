/**
 * Auth API: password reset and recovery via Supabase Auth.
 * Email dispatch and token validation are handled by Supabase.
 */

import { supabase } from '@/lib/supabase';

export interface RequestPasswordResetResult {
  success: boolean;
  error?: string;
}

/**
 * Request a password reset email. Supabase sends the email and handles the reset link.
 * redirectTo should be the full URL of the page where the user will land after clicking the link (e.g. /forgot-password).
 */
export async function requestPasswordReset(
  email: string,
  redirectTo?: string
): Promise<RequestPasswordResetResult> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirect = redirectTo ? `${baseUrl}${redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`}` : `${baseUrl}/forgot-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirect,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export interface UpdatePasswordFromRecoveryResult {
  success: boolean;
  error?: string;
}

/**
 * Update the user's password while in recovery session (after clicking the reset link).
 * Call this only when the user has landed on the app with the recovery link and has a valid session.
 */
export async function updatePasswordFromRecovery(
  newPassword: string
): Promise<UpdatePasswordFromRecoveryResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Check if the current URL hash indicates a recovery redirect from Supabase (type=recovery).
 */
export function isRecoveryHash(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash.includes('type=recovery');
}
