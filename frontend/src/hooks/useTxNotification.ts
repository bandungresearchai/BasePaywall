'use client';

import { useEffect, useRef } from 'react';
import { useToast, parseContractError } from '@/components/ui/Toast';

/**
 * Hook that automatically shows toast notifications for transaction states
 * 
 * Usage:
 * const { unlock, isPending, isConfirming, isSuccess, error } = useUnlockContent(contentId);
 * useTxNotification({ isPending, isConfirming, isSuccess, error, successMessage: 'Content unlocked!' });
 */
interface TxNotificationOptions {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  pendingMessage?: string;
  confirmingMessage?: string;
  successMessage?: string;
  onSuccess?: () => void;
}

export function useTxNotification({
  isPending,
  isConfirming,
  isSuccess,
  error,
  pendingMessage = 'Please confirm in your wallet...',
  confirmingMessage = 'Transaction submitted, waiting for confirmation...',
  successMessage = 'Transaction successful!',
  onSuccess,
}: TxNotificationOptions) {
  const toast = useToast();
  const hasShownPending = useRef(false);
  const hasShownConfirming = useRef(false);
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const lastError = useRef<string | null>(null);

  // Reset refs when all states are false
  useEffect(() => {
    if (!isPending && !isConfirming && !isSuccess && !error) {
      hasShownPending.current = false;
      hasShownConfirming.current = false;
      hasShownSuccess.current = false;
      hasShownError.current = false;
      lastError.current = null;
    }
  }, [isPending, isConfirming, isSuccess, error]);

  // Show pending toast
  useEffect(() => {
    if (isPending && !hasShownPending.current) {
      hasShownPending.current = true;
      toast.info('Transaction Pending', pendingMessage);
    }
  }, [isPending, pendingMessage, toast]);

  // Show confirming toast
  useEffect(() => {
    if (isConfirming && !hasShownConfirming.current) {
      hasShownConfirming.current = true;
      toast.info('Confirming', confirmingMessage);
    }
  }, [isConfirming, confirmingMessage, toast]);

  // Show success toast
  useEffect(() => {
    if (isSuccess && !hasShownSuccess.current) {
      hasShownSuccess.current = true;
      toast.success('Success!', successMessage);
      onSuccess?.();
    }
  }, [isSuccess, successMessage, onSuccess, toast]);

  // Show error toast
  useEffect(() => {
    if (error && error !== lastError.current && !hasShownError.current) {
      hasShownError.current = true;
      lastError.current = error;
      const parsedError = parseContractError(error);
      toast.error('Transaction Failed', parsedError);
    }
  }, [error, toast]);
}

/**
 * Higher-order hook that creates transaction handlers with built-in toast notifications
 */
export function useNotifiedTransaction<T extends (...args: unknown[]) => void>(
  txFn: T,
  options: {
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    error: string | null;
    pendingMessage?: string;
    confirmingMessage?: string;
    successMessage?: string;
    reset?: () => void;
  }
) {
  const toast = useToast();
  
  useTxNotification({
    isPending: options.isPending,
    isConfirming: options.isConfirming,
    isSuccess: options.isSuccess,
    error: options.error,
    pendingMessage: options.pendingMessage,
    confirmingMessage: options.confirmingMessage,
    successMessage: options.successMessage,
  });

  return {
    execute: (...args: Parameters<T>) => {
      options.reset?.();
      txFn(...args);
    },
    isPending: options.isPending,
    isConfirming: options.isConfirming,
    isSuccess: options.isSuccess,
    error: options.error,
  };
}

export default useTxNotification;
