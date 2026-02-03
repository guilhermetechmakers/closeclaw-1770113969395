import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { privacyApi } from '@/api/privacy';
import type { PrivacyPolicySettingUpdate } from '@/types/database';

const PRIVACY_KEYS = {
  all: ['privacy'] as const,
  settings: () => [...PRIVACY_KEYS.all, 'settings'] as const,
  policyDocument: (type: 'privacy' | 'terms') =>
    [...PRIVACY_KEYS.all, 'policy', type] as const,
};

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

/**
 * Fetch current user's privacy/telemetry settings. Returns null when not authenticated.
 */
export function usePrivacySettings() {
  return useQuery({
    queryKey: PRIVACY_KEYS.settings(),
    queryFn: () => safeGet(privacyApi.getPrivacySettings, null),
  });
}

/**
 * Update telemetry opt-out (and other preferences). Invalidates settings and profile-related queries.
 */
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrivacyPolicySettingUpdate) =>
      privacyApi.updatePrivacySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRIVACY_KEYS.settings() });
      toast.success('Privacy preferences updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update privacy preferences');
    },
  });
}

/**
 * Fetch the current privacy policy document for display/download. No auth required.
 */
export function usePolicyDocument(documentType: 'privacy' | 'terms' = 'privacy') {
  return useQuery({
    queryKey: PRIVACY_KEYS.policyDocument(documentType),
    queryFn: () =>
      safeGet(() => privacyApi.getCurrentPolicyDocument(documentType), null),
  });
}
