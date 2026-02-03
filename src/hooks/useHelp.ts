import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { helpApi } from '@/api/help';
import type { SupportRequestInsert } from '@/types/database';

const HELP_KEYS = {
  all: ['help'] as const,
  faqs: () => [...HELP_KEYS.all, 'faqs'] as const,
  docLinks: () => [...HELP_KEYS.all, 'doc-links'] as const,
  changelog: () => [...HELP_KEYS.all, 'changelog'] as const,
};

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export function useHelpFaqs() {
  return useQuery({
    queryKey: HELP_KEYS.faqs(),
    queryFn: () => safeGet(helpApi.getFaqs, []),
  });
}

export function useHelpDocLinks() {
  return useQuery({
    queryKey: HELP_KEYS.docLinks(),
    queryFn: () => safeGet(helpApi.getDocLinks, []),
  });
}

export function useSubmitSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupportRequestInsert) =>
      helpApi.submitSupportRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELP_KEYS.all });
      toast.success('Support request submitted. We’ll get back to you soon.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit support request');
    },
  });
}

export function useHelpChangelog(limit?: number) {
  return useQuery({
    queryKey: [...HELP_KEYS.changelog(), limit ?? 50],
    queryFn: () => safeGet(() => helpApi.getChangelog(limit ?? 50), []),
  });
}
