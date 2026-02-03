import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  resendVerificationEmail,
  verifyEmailWithToken,
  getEmailVerificationTokenFromUrl,
  isCurrentUserEmailVerified,
} from '@/api/auth';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle,
  Mail,
  ArrowLeft,
  HelpCircle,
  Loader2,
  Send,
  KeyRound,
} from 'lucide-react';

const tokenSchema = z.object({
  token: z.string().min(1, 'Enter the verification code from your email'),
});

type TokenFormData = z.infer<typeof tokenSchema>;

export function EmailVerification() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'verified' | 'checking'>('checking');
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const tokenForm = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: '' },
  });

  // Resolve verification status and handle token_hash from URL
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const tokenFromUrl = getEmailVerificationTokenFromUrl();
      if (tokenFromUrl) {
        const result = await verifyEmailWithToken(tokenFromUrl);
        if (!cancelled) {
          if (result.success) {
            setStatus('verified');
            toast.success('Email verified', {
              description: 'Your email has been confirmed. You can continue to the dashboard.',
            });
            // Clear token from URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            toast.error('Verification failed', { description: result.error });
          }
        }
        return;
      }

      const verified = await isCurrentUserEmailVerified();
      if (cancelled) return;
      if (verified) {
        setStatus('verified');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user?.email) setUserEmail(user.email);
      setStatus('pending');
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const onVerifyToken = async (data: TokenFormData) => {
    const result = await verifyEmailWithToken(data.token);
    if (result.success) {
      setStatus('verified');
      tokenForm.reset();
      toast.success('Email verified', {
        description: 'Your email has been confirmed.',
      });
    } else {
      toast.error('Verification failed', { description: result.error });
    }
  };

  const onResendConfirm = async () => {
    setResendLoading(true);
    const result = await resendVerificationEmail();
    setResendLoading(false);
    setResendDialogOpen(false);
    if (result.success) {
      toast.success('Verification email sent', {
        description: 'Check your inbox and spam folder for the link.',
      });
    } else {
      toast.error('Could not resend email', { description: result.error });
    }
  };

  const handleNextSteps = () => {
    navigate('/dashboard', { replace: true });
  };

  // Loading state while resolving status
  if (status === 'checking') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border px-4 py-3 sm:px-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to login
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="animate-fade-in-up rounded-[10px] border border-border bg-card p-8 shadow-card max-w-md w-full text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
            <p className="mt-4 text-muted-foreground">Checking verification status…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header: logo + back */}
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
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Clawgate
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              Verify your email
            </CardTitle>
            <CardDescription>
              Required for signup and sensitive operations (e.g. skill install). We sent a link to
              {userEmail ? ` ${userEmail}` : ' your email'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verification status banner */}
            <div
              role="status"
              aria-live="polite"
              className={status === 'verified'
                ? 'flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success'
                : 'flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-warning'
              }
            >
              {status === 'verified' ? (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
                  Verification status: Verified
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  Verification status: Pending
                </>
              )}
            </div>

            {status === 'verified' ? (
              /* Next steps CTA */
              <div className="animate-fade-in-up space-y-4">
                <p className="text-sm text-muted-foreground">
                  You’re all set. Continue to your dashboard or complete your profile.
                </p>
                <Button
                  onClick={handleNextSteps}
                  className="w-full rounded-md py-3 font-medium transition-all hover:opacity-90 hover:shadow-md"
                  size="lg"
                >
                  Continue to dashboard
                </Button>
                <Button asChild variant="outline" className="w-full rounded-md py-3">
                  <Link to="/profile">Go to profile</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Resend verification */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-md py-3"
                  onClick={() => setResendDialogOpen(true)}
                >
                  Resend verification email
                </Button>

                {/* Token verification form */}
                <form
                  onSubmit={tokenForm.handleSubmit(onVerifyToken)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label htmlFor="verify-token">Or enter code manually</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                      <Input
                        id="verify-token"
                        type="text"
                        placeholder="Paste verification code from email"
                        className="pl-9 rounded-md border-border py-3"
                        autoComplete="one-time-code"
                        {...tokenForm.register('token')}
                        aria-invalid={!!tokenForm.formState.errors.token}
                      />
                    </div>
                    {tokenForm.formState.errors.token && (
                      <p className="text-sm text-destructive" role="alert">
                        {tokenForm.formState.errors.token.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-md py-3 font-medium transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                    disabled={tokenForm.formState.isSubmitting}
                  >
                    {tokenForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" aria-hidden />
                        Verify
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer: support */}
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

      {/* Resend confirmation dialog */}
      <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <DialogContent
          className="rounded-[10px] border border-border bg-card shadow-lg max-w-[640px]"
          aria-describedby="resend-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Resend verification email</DialogTitle>
            <DialogDescription id="resend-dialog-description">
              We’ll send another verification link to your email. Check your spam folder if you
              don’t see the first one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResendDialogOpen(false)}
              disabled={resendLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onResendConfirm}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                'Send again'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
