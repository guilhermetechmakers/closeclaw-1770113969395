import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RuntimeFeedback } from '@/types/database';

interface FeedbackFormProps {
  runId: string;
  existingFeedback?: RuntimeFeedback | null;
  onSubmit: (data: { rating: number; comment: string }) => void;
  onUpdate?: (data: { rating: number; comment: string }) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function FeedbackForm({
  runId,
  existingFeedback,
  onSubmit,
  onUpdate,
  isSubmitting = false,
  className,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(
    existingFeedback?.rating ?? 0
  );
  const [comment, setComment] = useState(
    existingFeedback?.comment ?? ''
  );
  const isEdit = !!existingFeedback;

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating ?? 0);
      setComment(existingFeedback.comment ?? '');
    }
  }, [existingFeedback?.id, existingFeedback?.rating, existingFeedback?.comment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    if (isEdit && onUpdate) {
      onUpdate({ rating, comment: comment.trim() });
    } else {
      onSubmit({ rating, comment: comment.trim() });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
      aria-label="Run feedback form"
    >
      <div className="space-y-2">
        <Label>Rating (1–5)</Label>
        <div className="flex gap-1" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                'rounded p-1 transition-colors hover:bg-[rgb(var(--secondary))]',
                rating >= value
                  ? 'text-[rgb(var(--warning))]'
                  : 'text-[rgb(var(--muted-foreground))]'
              )}
              aria-pressed={rating >= value}
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-6 w-6',
                  rating >= value ? 'fill-current' : ''
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`feedback-comment-${runId}`}>Comment (optional)</Label>
        <Textarea
          id={`feedback-comment-${runId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did this run perform?"
          className="min-h-[80px]"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating < 1 || rating > 5}
        className="min-w-[120px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : isEdit ? (
          'Update feedback'
        ) : (
          'Submit feedback'
        )}
      </Button>
    </form>
  );
}
