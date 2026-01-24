'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST TYPES & CONTEXT
═══════════════════════════════════════════════════════════════════════════ */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST ICONS
═══════════════════════════════════════════════════════════════════════════ */

const ToastIcons = {
  success: () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  warning: () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  info: () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   SINGLE TOAST COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const Icon = ToastIcons[toast.type];
  
  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 bg-[#0f0f1a] rounded-2xl border ${borderColors[toast.type]}
        shadow-2xl backdrop-blur-xl
        transition-all duration-300 transform
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      <Icon />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST CONTAINER
═══════════════════════════════════════════════════════════════════════════ */

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST PROVIDER
═══════════════════════════════════════════════════════════════════════════ */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════════════════ */

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR HELPER
═══════════════════════════════════════════════════════════════════════════ */

export function parseContractError(error: unknown): string {
  const errorString = String(error);
  
  // Common contract errors
  if (errorString.includes('InsufficientPayment')) {
    return 'Insufficient payment amount. Please try again with the correct price.';
  }
  if (errorString.includes('AlreadyUnlocked')) {
    return 'You have already unlocked this content.';
  }
  if (errorString.includes('ContentNotEnabled')) {
    return 'This content is not available for purchase.';
  }
  if (errorString.includes('NotCreator')) {
    return 'Only the content creator can perform this action.';
  }
  if (errorString.includes('NoFundsToWithdraw')) {
    return 'No funds available to withdraw.';
  }
  if (errorString.includes('User rejected') || errorString.includes('user rejected')) {
    return 'Transaction was cancelled.';
  }
  if (errorString.includes('insufficient funds')) {
    return 'Insufficient ETH balance. Please add funds to your wallet.';
  }
  if (errorString.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Fallback
  return 'An error occurred. Please try again.';
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRANSACTION TOAST HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export function useTxToast() {
  const { success, error, info } = useToast();

  return {
    pending: (message = 'Transaction submitted...') => {
      info('Transaction Pending', message);
    },
    success: (txHash?: string) => {
      success(
        'Transaction Confirmed',
        txHash ? `Transaction hash: ${txHash.slice(0, 10)}...` : 'Your transaction was successful!'
      );
    },
    error: (err: unknown) => {
      const message = parseContractError(err);
      error('Transaction Failed', message);
    },
  };
}

export default ToastProvider;
