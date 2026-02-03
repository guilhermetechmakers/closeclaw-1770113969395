/**
 * Auth API: signin, signup, signout, password reset, recovery, and email verification via Supabase Auth.
 * Sessions and JWT are managed by Supabase; OAuth and 2FA are supported when configured in the project.
 */

import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// --- Sign in (email/password) ---

export interface SignInResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with email and password. On success, Supabase sets the session and refreshes tokens.
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// --- Sign out ---

export interface SignOutResult {
  success: boolean;
  error?: string;
}

/**
 * Sign out the current user and clear the session.
 */
export async function signOut(): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// --- Session ---

/**
 * Get the current session (and user). Use for initial load; subscribe to onAuthStateChange for updates.
 */
export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  return { user: session?.user ?? null, session };
}

/**
 * Subscribe to auth state changes (sign in, sign out, token refresh).
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => subscription.unsubscribe();
}

// --- OAuth ---

export interface SignInWithOAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with an OAuth provider (e.g. GitHub, Google). Redirects to the provider; callback URL must be configured in Supabase.
 */
export async function signInWithOAuth(
  provider: 'github' | 'google',
  options?: { redirectTo?: string }
): Promise<SignInWithOAuthResult> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTo = options?.redirectTo
    ? `${baseUrl}${options.redirectTo.startsWith('/') ? options.redirectTo : `/${options.redirectTo}`}`
    : `${baseUrl}/dashboard`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// --- Sign up ---

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
