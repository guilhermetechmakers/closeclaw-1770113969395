import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Loader2 } from 'lucide-react';
import { signIn, signInWithOAuth } from '@/api/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await signIn(data.email, data.password);
    if (result.success) {
      toast.success('Signed in', { description: 'Welcome back.' });
      navigate(returnTo, { replace: true });
    } else {
      toast.error('Sign in failed', { description: result.error });
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    const result = await signInWithOAuth(provider, { redirectTo: returnTo });
    if (!result.success) {
      toast.error('Sign in failed', { description: result.error });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up rounded-[10px] border border-border bg-card shadow-card">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Choose local-only or cloud-linked mode.
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
                Use the gateway without a cloud account. Access the Control UI at your local URL and use QR or pairing code to connect devices.
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
                    className="rounded-md border-border py-3 focus-visible:ring-2 focus-visible:ring-primary"
                    autoComplete="current-password"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-md py-3 font-medium transition-all hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md transition-all hover:scale-[1.02]"
                  onClick={() => handleOAuth('github')}
                >
                  <Github className="mr-2 h-4 w-4" aria-hidden />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md transition-all hover:scale-[1.02]"
                  onClick={() => handleOAuth('google')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                No account?{' '}
                <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
