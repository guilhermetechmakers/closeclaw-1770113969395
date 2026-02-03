/**
 * Auth API: signup, password reset, recovery, and email verification via Supabase Auth.
 * Email dispatch and token validation are handled by Supabase.
 */

import { supabase } from '@/lib/supabase';

export interface SignUpResult {
  success: boolean;
  needsEmailVerification?: boolean;
  error?: string;
}

/**
 * Sign up with email and password. If the project requires email confirmation,
 * Supabase sends a confirmation email and the user should be redirected to /verify-email.
 */
export async function signUp(
  email: string,
  password: string,
  options?: { redirectTo?: string }
): Promise<SignUpResult> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTo = options?.redirectTo
    ? `${baseUrl}${options.redirectTo.startsWith('/') ? options.redirectTo : `/${options.redirectTo}`}`
    : `${baseUrl}/verify-email`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const needsEmailVerification =
    data.user && !data.session?.user?.email_confirmed_at && data.user.identities?.length;

  return {
    success: true,
    needsEmailVerification: !!needsEmailVerification,
  };
}

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

// --- Email verification (Supabase Auth) ---

export interface ResendVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Resend the signup/email confirmation email for the current user.
 * User must be logged in (unconfirmed). Supabase sends the email.
 */
export async function resendVerificationEmail(): Promise<ResendVerificationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: 'You must be signed in to resend the verification email.' };
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTo = `${baseUrl}/verify-email`;

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export interface VerifyEmailWithTokenResult {
  success: boolean;
  error?: string;
}

/**
 * Verify email using the token from the confirmation link (token_hash).
 * Use when the user lands with token_hash in URL or pastes the token manually.
 */
export async function verifyEmailWithToken(tokenHash: string): Promise<VerifyEmailWithTokenResult> {
  const trimmed = tokenHash.trim();
  if (!trimmed) {
    return { success: false, error: 'Verification token is required.' };
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: trimmed,
    type: 'email',
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Check if the current URL has email confirmation token (token_hash) in query or hash.
 */
export function getEmailVerificationTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('token_hash');
  if (fromQuery) return fromQuery;
  const hash = window.location.hash;
  if (!hash) return null;
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  return hashParams.get('token_hash');
}

/**
 * Whether the current session user has confirmed their email (Supabase: email_confirmed_at set).
 */
export async function isCurrentUserEmailVerified(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return !!user.email_confirmed_at;
}
