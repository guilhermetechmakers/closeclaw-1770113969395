import { useOperationStateContext } from '@/contexts/operation-state-context';

/**
 * Hook to control global loading overlay, success modal, and abort confirmation.
 * Use within OperationStateProvider (e.g. anywhere under App).
 *
 * @example
 * const { showLoading, hideLoading, showSuccess } = useOperationState();
 * const handleSubmit = async () => {
 *   showLoading('Saving…');
 *   try {
 *     await save();
 *     hideLoading();
 *     showSuccess('Saved.', [{ label: 'View item', onClick: () => navigate('/item') }]);
 *   } finally {
 *     hideLoading();
 *   }
 * };
 */
export function useOperationState() {
  return useOperationStateContext();
}
