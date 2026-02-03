import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { termsApi } from '@/api/terms';
import type { UserAgreementStatus } from '@/types/database';

const TERMS_KEYS = {
  all: ['terms'] as const,
  document: () => [...TERMS_KEYS.all, 'document'] as const,
  agreement: (policyDocumentId: string) =>
    [...TERMS_KEYS.all, 'agreement', policyDocumentId] as const,
};

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

/**
 * Fetch the current terms of service document. No auth required.
 */
export function useTermsDocument() {
  return useQuery({
    queryKey: TERMS_KEYS.document(),
    queryFn: () => safeGet(termsApi.getCurrentTerms, null),
  });
}

/**
 * Fetch the current user's agreement for a given terms version.
 */
export function useUserAgreement(policyDocumentId: string | undefined) {
  return useQuery({
    queryKey: TERMS_KEYS.agreement(policyDocumentId ?? ''),
    queryFn: () =>
      policyDocumentId
        ? termsApi.getUserAgreement(policyDocumentId).then((r) => r.data)
        : Promise.resolve(null),
    enabled: Boolean(policyDocumentId),
  });
}

/**
 * Record user acceptance or declination of the terms.
 */
export function useRecordAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      policyDocumentId,
      status,
    }: {
      policyDocumentId: string;
      status: UserAgreementStatus;
    }) => termsApi.recordAgreement(policyDocumentId, status),
    onSuccess: (_, { policyDocumentId }) => {
      queryClient.invalidateQueries({ queryKey: TERMS_KEYS.agreement(policyDocumentId) });
      queryClient.invalidateQueries({ queryKey: TERMS_KEYS.document() });
      toast.success(
        _.status === 'accepted'
          ? 'Terms of Service accepted.'
          : 'Your response has been recorded.'
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record your response');
    },
  });
}

/**
 * Submit feedback when user declines the terms.
 */
export function useSubmitDeclineFeedback() {
  return useMutation({
    mutationFn: (payload: {
      comments: string;
      user_agreement_id?: string | null;
    }) => termsApi.submitDeclineFeedback(payload),
    onSuccess: () => {
      toast.success('Thank you for your feedback.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit feedback');
    },
  });
}
