import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signUp } from '@/api/auth';
import { Loader2 } from 'lucide-react';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export function Signup() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    const result = await signUp(data.email, data.password, { redirectTo: '/verify-email' });
    if (result.success) {
      if (result.needsEmailVerification) {
        toast.success('Check your email', {
          description: 'We sent a verification link. Click it or enter the code on the next page.',
        });
        navigate('/verify-email', { replace: true });
      } else {
        toast.success('Account created', { description: 'You can sign in now.' });
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error('Sign up failed', { description: result.error });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up rounded-[10px] border border-border bg-card shadow-card">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Choose local-only or sign up for cloud-linked mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cloud" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-md border border-border bg-secondary/50 p-1">
              <TabsTrigger value="local" className="rounded-md transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Local only
              </TabsTrigger>
              <TabsTrigger value="cloud" className="rounded-md transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Cloud
              </TabsTrigger>
            </TabsList>
            <TabsContent value="local" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Use the gateway without a cloud account. No signup required. Open the Control UI and connect devices via QR or pairing code.
              </p>
              <Button asChild className="w-full rounded-md py-3 transition-all hover:scale-[1.02] hover:shadow-md">
                <Link to="/dashboard">Open Local UI</Link>
              </Button>
            </TabsContent>
            <TabsContent value="cloud" className="space-y-4 pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-md border-border py-3 focus-visible:ring-2 focus-visible:ring-primary"
                    autoComplete="email"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-md border-border py-3 focus-visible:ring-2 focus-visible:ring-primary"
                    autoComplete="new-password"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-md border-border py-3 focus-visible:ring-2 focus-visible:ring-primary"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive" role="alert">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-md py-3 font-medium transition-all hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Creating account…
                    </>
                  ) : (
                    'Sign up'
                  )}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                By signing up you agree to our{' '}
                <Link to="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Log in
                </Link>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
