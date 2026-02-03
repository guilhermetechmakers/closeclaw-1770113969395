import * as React from 'react';
import type {
  OperationStateContextValue,
  LoadingState,
  SuccessState,
  AbortConfirmState,
} from '@/types/operation-state';

const defaultLoading: LoadingState = { visible: false };
const defaultSuccess: SuccessState = { visible: false };
const defaultAbortConfirm: AbortConfirmState = { visible: false };

const OperationStateContext = React.createContext<OperationStateContextValue | null>(null);

export function OperationStateProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState<LoadingState>(defaultLoading);
  const [success, setSuccess] = React.useState<SuccessState>(defaultSuccess);
  const [abortConfirm, setAbortConfirm] = React.useState<AbortConfirmState>(defaultAbortConfirm);

  const showLoading = React.useCallback((message?: string) => {
    setLoading({ visible: true, message });
  }, []);

  const hideLoading = React.useCallback(() => {
    setLoading(defaultLoading);
  }, []);

  const showSuccess = React.useCallback(
    (message?: string, nextSteps?: SuccessState['nextSteps']) => {
      setSuccess({ visible: true, message, nextSteps });
    },
    []
  );

  const hideSuccess = React.useCallback(() => {
    setSuccess(defaultSuccess);
  }, []);

  const showAbortConfirm = React.useCallback(
    (options: {
      message?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
    }) => {
      setAbortConfirm({
        visible: true,
        message: options.message,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        confirmLabel: options.confirmLabel,
      });
    },
    []
  );

  const hideAbortConfirm = React.useCallback(() => {
    setAbortConfirm(defaultAbortConfirm);
  }, []);

  const value: OperationStateContextValue = React.useMemo(
    () => ({
      loading,
      success,
      abortConfirm,
      showLoading,
      hideLoading,
      showSuccess,
      hideSuccess,
      showAbortConfirm,
      hideAbortConfirm,
    }),
    [
      loading,
      success,
      abortConfirm,
      showLoading,
      hideLoading,
      showSuccess,
      hideSuccess,
      showAbortConfirm,
      hideAbortConfirm,
    ]
  );

  return (
    <OperationStateContext.Provider value={value}>
      {children}
    </OperationStateContext.Provider>
  );
}

export function useOperationStateContext(): OperationStateContextValue {
  const ctx = React.useContext(OperationStateContext);
  if (!ctx) {
    throw new Error('useOperationStateContext must be used within OperationStateProvider');
  }
  return ctx;
}
