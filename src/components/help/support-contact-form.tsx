import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SupportRequestInsert } from '@/types/database';
import { useAuth } from '@/contexts/auth-context';
import { SupportConfirmationDialog } from './support-confirmation-dialog';
import { useSubmitSupportRequest } from '@/hooks/useHelp';
import { useMemo, useState } from 'react';

const supportFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  issue_description: z
    .string()
    .min(10, 'Please describe your issue in at least 10 characters')
    .max(4000, 'Description must be 4000 characters or less'),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

const defaultValues: SupportFormValues = {
  name: '',
  email: '',
  issue_description: '',
};

export function SupportContactForm() {
  const { user } = useAuth();
  const submitMutation = useSubmitSupportRequest();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const contextInfo = useMemo(() => {
    const info: Record<string, unknown> = {
      page: 'help',
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
    };
    if (user?.id) info.user_id = user.id;
    if (user?.email) info.user_email = user.email;
    return info;
  }, [user?.id, user?.email]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: user?.email
      ? { ...defaultValues, name: user.user_metadata?.full_name ?? '', email: user.email ?? '' }
      : defaultValues,
  });

  const onFormSubmit = async (data: SupportFormValues) => {
    const payload: SupportRequestInsert = {
      name: data.name.trim(),
      email: data.email.trim(),
      issue_description: data.issue_description.trim(),
      context_info: contextInfo,
      user_id: user?.id ?? null,
    };
    await submitMutation.mutateAsync(payload);
    reset(defaultValues);
    setShowConfirmation(true);
  };

  return (
    <>
      <Card className="rounded-[10px] border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Send a request</CardTitle>
          <CardDescription>
            Describe your issue and we’ll get back to you. Context (current page, account) is
            included to help us respond faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support_name">Name</Label>
              <Input
                id="support_name"
                placeholder="Your name"
                className="rounded-md border border-input px-3 py-2"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Email</Label>
              <Input
                id="support_email"
                type="email"
                placeholder="you@example.com"
                className="rounded-md border border-input px-3 py-2"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_issue">Issue description</Label>
              <Textarea
                id="support_issue"
                placeholder="Describe what you need help with..."
                rows={4}
                className="rounded-md border border-input px-3 py-2"
                {...register('issue_description')}
              />
              {errors.issue_description && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.issue_description.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="rounded-md px-4 py-3 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send request'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <SupportConfirmationDialog open={showConfirmation} onOpenChange={setShowConfirmation} />
    </>
  );
}
