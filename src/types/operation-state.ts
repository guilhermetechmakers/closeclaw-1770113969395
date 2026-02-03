/**
 * Types for loading, success, and abort confirmation states.
 * Used by global overlay and modals for operation feedback.
 */

export interface LoadingState {
  visible: boolean;
  message?: string;
}

export interface SuccessState {
  visible: boolean;
  message?: string;
  nextSteps?: Array<{ label: string; href?: string; onClick?: () => void }>;
}

export interface AbortConfirmState {
  visible: boolean;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Optional label override for confirm button (e.g. "Abort", "Cancel run") */
  confirmLabel?: string;
}

export interface OperationStateContextValue {
  loading: LoadingState;
  success: SuccessState;
  abortConfirm: AbortConfirmState;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showSuccess: (message?: string, nextSteps?: SuccessState['nextSteps']) => void;
  hideSuccess: () => void;
  showAbortConfirm: (options: {
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
  }) => void;
  hideAbortConfirm: () => void;
}
