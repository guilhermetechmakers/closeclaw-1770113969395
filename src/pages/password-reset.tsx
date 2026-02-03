import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  requestPasswordReset,
  updatePasswordFromRecovery,
  isRecoveryHash,
} from '@/api/auth';
import { getPasswordStrength, getStrengthColorClass } from '@/lib/password-strength';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, CheckCircle2, Mail, Lock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'email' | 'email_sent' | 'set_password' | 'success';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/\d/, 'Password must include a number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export function PasswordReset() {
  const [step, setStep] = useState<Step>('email');
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = passwordForm.watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  // Detect recovery redirect from Supabase (user clicked link in email)
  useEffect(() => {
    if (!isRecoveryHash()) {
      setIsCheckingRecovery(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStep('set_password');
        // Clear hash from URL for security and cleaner UI
        window.history.replaceState(null, '', window.location.pathname);
      }
      setIsCheckingRecovery(false);
    });
  }, []);

  const onRequestReset = async (data: EmailFormData) => {
    const result = await requestPasswordReset(data.email, '/forgot-password');
    if (result.success) {
      setStep('email_sent');
      toast.success('Check your email', {
        description: 'If an account exists, we sent a reset link. Check spam if you don’t see it.',
      });
    } else {
      toast.error('Could not send reset link', { description: result.error });
    }
  };

  const onSetNewPassword = async (data: NewPasswordFormData) => {
    const result = await updatePasswordFromRecovery(data.password);
    if (result.success) {
      setStep('success');
      toast.success('Password updated', {
        description: 'You can now sign in with your new password.',
      });
      await supabase.auth.signOut();
    } else {
      toast.error('Could not update password', { description: result.error });
    }
  };

  if (isCheckingRecovery) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border px-4 py-3 sm:px-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to login
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="animate-fade-in-up rounded-[10px] border border-border bg-card p-8 shadow-card max-w-md w-full text-center">
            <p className="text-muted-foreground">Checking your reset link…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header: branding + back to login */}
      <header className="border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md py-2"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to login
          </Link>
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Clawgate
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              {step === 'email' || step === 'email_sent'
                ? 'Reset password'
                : step === 'set_password'
                  ? 'Set new password'
                  : 'Password updated'}
            </CardTitle>
            <CardDescription>
              {step === 'email' &&
                'Enter your cloud account email and we’ll send a secure reset link. For local-only mode, you don’t need a password.'}
              {step === 'email_sent' &&
                'If an account exists for that email, we sent a reset link. Check your inbox and spam folder.'}
              {step === 'set_password' &&
                'Choose a strong password. You’ll use it to sign in to your cloud-linked account.'}
              {step === 'success' &&
                'Your password has been updated. You can now sign in with your new credentials.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step: Email input */}
            {(step === 'email' || step === 'email_sent') && (
              <>
                {step === 'email' ? (
                  <form
                    onSubmit={emailForm.handleSubmit(onRequestReset)}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password-reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                        <Input
                          id="password-reset-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9 rounded-md border-border py-3"
                          autoComplete="email"
                          {...emailForm.register('email')}
                          aria-invalid={!!emailForm.formState.errors.email}
                        />
                      </div>
                      {emailForm.formState.errors.email && (
                        <p className="text-sm text-destructive" role="alert">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-md py-3 font-medium transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                      disabled={emailForm.formState.isSubmitting}
                    >
                      {emailForm.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-md border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                    <p>Check your email for the reset link. The link expires after a short time.</p>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-3 text-primary hover:text-primary"
                      onClick={() => setStep('email')}
                    >
                      Send another link
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Step: Set new password (recovery flow) */}
            {step === 'set_password' && (
              <form
                onSubmit={passwordForm.handleSubmit(onSetNewPassword)}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 rounded-md border-border py-3"
                      autoComplete="new-password"
                      {...passwordForm.register('password')}
                      aria-invalid={!!passwordForm.formState.errors.password}
                    />
                  </div>
                  {passwordValue.length > 0 && (
                      <div className="space-y-1" aria-live="polite">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Strength</span>
                          <span
                            className={cn(
                              strength.level !== 'empty' && strength.level !== 'weak'
                                ? 'text-success'
                                : strength.level === 'weak'
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                            )}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                          role="progressbar"
                          aria-valuenow={strength.score * 25}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Password strength"
                        >
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              getStrengthColorClass(strength.level)
                            )}
                            style={{ width: `${strength.score * 25}%` }}
                          />
                        </div>
                      </div>
                  )}
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-destructive" role="alert">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-md border-border py-3"
                    autoComplete="new-password"
                    {...passwordForm.register('confirmPassword')}
                    aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive" role="alert">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-md py-3 font-medium transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
                </Button>
              </form>
            )}

            {/* Step: Success confirmation */}
            {step === 'success' && (
              <div className="animate-fade-in-up space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-success/15 p-3">
                    <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button asChild className="w-full rounded-md py-3 font-medium" size="lg">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            )}

            {/* Footer link: back to login (when not on success) */}
            {step !== 'success' && (
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Back to login
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer: help/support */}
      <footer className="border-t border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-content items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link
            to="/help"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <HelpCircle className="h-4 w-4" aria-hidden />
            Help
          </Link>
        </div>
      </footer>
    </div>
  );
}
