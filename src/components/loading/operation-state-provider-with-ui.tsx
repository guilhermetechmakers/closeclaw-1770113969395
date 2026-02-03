import { OperationStateProvider, useOperationStateContext } from '@/contexts/operation-state-context';
import { GlobalLoadingOverlay } from '@/components/loading/global-loading-overlay';
import { OperationSuccessModal } from '@/components/loading/operation-success-modal';
import { AbortConfirmationModal } from '@/components/loading/abort-confirmation-modal';

/**
 * Renders overlay and modals based on operation state context.
 * Must be used inside OperationStateProvider.
 */
function OperationStateUI() {
  const {
    loading,
    success,
    abortConfirm,
    hideSuccess,
    hideAbortConfirm,
  } = useOperationStateContext();

  return (
    <>
      <GlobalLoadingOverlay
        visible={loading.visible}
        message={loading.message}
      />
      <OperationSuccessModal
        open={success.visible}
        onOpenChange={(open) => !open && hideSuccess()}
        message={success.message}
        nextSteps={success.nextSteps}
        onClose={hideSuccess}
      />
      <AbortConfirmationModal
        open={abortConfirm.visible}
        onOpenChange={(open) => !open && hideAbortConfirm()}
        message={abortConfirm.message}
        confirmLabel={abortConfirm.confirmLabel ?? 'Yes, cancel'}
        onConfirm={abortConfirm.onConfirm}
        onCancel={abortConfirm.onCancel}
      />
    </>
  );
}

/**
 * Provider + global loading/success/abort UI.
 * Wrap the app (or the part that needs these states) with this component.
 */
export function OperationStateProviderWithUI({ children }: { children: React.ReactNode }) {
  return (
    <OperationStateProvider>
      <OperationStateUI />
      {children}
    </OperationStateProvider>
  );
}
