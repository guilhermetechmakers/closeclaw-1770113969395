import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SubmitReportPayload } from '@/api/reports';

const reportIssueSchema = z.object({
  description: z
    .string()
    .min(10, 'Please provide at least 10 characters describing what happened')
    .max(2000, 'Description must be 2000 characters or less'),
  contact_email: z
    .string()
    .max(255)
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address'),
  comments: z.string().max(1000).optional(),
});

export type ReportIssueFormValues = z.infer<typeof reportIssueSchema>;

export interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubmitReportPayload) => Promise<void>;
  errorType?: string;
  errorContext?: Record<string, unknown>;
}

const defaultValues: ReportIssueFormValues = {
  description: '',
  contact_email: '',
  comments: '',
};

export function ReportIssueDialog({
  open,
  onOpenChange,
  onSubmit,
  errorType = '500',
  errorContext,
}: ReportIssueDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues,
  });

  const onFormSubmit = async (data: ReportIssueFormValues) => {
    await onSubmit({
      error_type: errorType,
      description: data.description.trim(),
      contact_email: data.contact_email?.trim() || null,
      context: {
        ...errorContext,
        comments: data.comments?.trim() || undefined,
      },
    });
    reset(defaultValues);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="report-issue-form-description"
      >
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription id="report-issue-form-description">
            Describe what happened so we can investigate. Your report helps us improve reliability.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-description">What happened?</Label>
            <textarea
              id="report-description"
              rows={4}
              placeholder="e.g. I was on the dashboard and clicked Save; the page showed an error."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-contact">Contact email (optional)</Label>
            <Input
              id="report-contact"
              type="email"
              placeholder="you@example.com"
              {...register('contact_email')}
              className={errors.contact_email ? 'border-destructive' : ''}
              autoComplete="email"
              aria-invalid={!!errors.contact_email}
            />
            {errors.contact_email && (
              <p className="text-xs text-destructive" role="alert">
                {errors.contact_email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-comments">Additional details (optional)</Label>
            <textarea
              id="report-comments"
              rows={2}
              placeholder="Any other context that might help"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('comments')}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
