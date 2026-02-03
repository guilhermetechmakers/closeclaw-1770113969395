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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';

const declineFeedbackSchema = z.object({
  comments: z.string().max(2000, 'Feedback must be 2000 characters or less').default(''),
});

export type DeclineFeedbackFormValues = z.infer<typeof declineFeedbackSchema>;

export interface TermsDeclineFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DeclineFeedbackFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const defaultValues: DeclineFeedbackFormValues = {
  comments: '',
};

/**
 * Modal for collecting optional feedback when user declines the terms.
 */
export function TermsDeclineFeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: TermsDeclineFeedbackDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeclineFeedbackFormValues>({
    resolver: zodResolver(declineFeedbackSchema),
    defaultValues,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  const onFormSubmit = async (data: DeclineFeedbackFormValues) => {
    await onSubmit(data);
    reset(defaultValues);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby="terms-decline-feedback-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
            <DialogTitle>Feedback (optional)</DialogTitle>
          </div>
          <DialogDescription id="terms-decline-feedback-description">
            Help us improve by sharing why you declined. Your feedback is optional and will not affect your ability to use local-only features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms-decline-comments">Comments</Label>
            <Textarea
              id="terms-decline-comments"
              placeholder="e.g. concerns about data handling, unclear clauses..."
              className="min-h-[100px] resize-y"
              maxLength={2000}
              aria-invalid={Boolean(errors.comments)}
              aria-describedby={errors.comments ? 'terms-decline-comments-error' : undefined}
              {...register('comments')}
            />
            {errors.comments && (
              <p id="terms-decline-comments-error" className="text-sm text-destructive">
                {errors.comments.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button type="submit" disabled={isSubmitting} className="transition-transform hover:scale-[1.02]">
              {isSubmitting ? 'Submitting…' : 'Submit feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
