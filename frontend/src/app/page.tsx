'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { PaywallContentV2 } from '@/components/PaywallContentV2';
import { NetworkGuard } from '@/components/NetworkGuard';
import { CreatorDashboardV2 } from '@/components/CreatorDashboardV2';
import { UserUnlockedContentV2 } from '@/components/UserUnlockedContentV2';
import { PlatformAdminV2 } from '@/components/PlatformAdminV2';
import { X402IDRXDemo } from '@/components/X402IDRXDemo';
import { useAccount } from 'wagmi';
import { usePlatformStats, useCreator, useNextContentId } from '@/hooks/usePaywallV2';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   THEME CONTEXT - Dark/Light Mode
═══════════════════════════════════════════════════════════════════════════ */

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
        theme === 'dark'
          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500 hover:text-gray-700'
      }`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS SYSTEM
═══════════════════════════════════════════════════════════════════════════ */

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationContext = createContext<{
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

function useNotifications() {
  return useContext(NotificationContext);
}

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Welcome to BasePaywall!',
      message: 'Connect your wallet to get started.',
      timestamp: new Date(),
      read: false,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...n,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      markAllAsRead,
      clearAll 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const { theme } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
          theme === 'dark'
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
            : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 top-12 w-80 max-h-96 overflow-hidden rounded-2xl backdrop-blur-xl shadow-2xl z-50 ${
            theme === 'dark'
              ? 'bg-[#0a0a0f]/95 border border-white/10'
              : 'bg-white/95 border border-gray-200'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAll}
                    className="text-xs text-white/40 hover:text-white/60"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? `border-white/5 hover:bg-white/5 ${!n.read ? 'bg-blue-500/5' : ''}`
                        : `border-gray-100 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
                        </div>
                        <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>{n.message}</p>
                        <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{getTimeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS - Pop-up feedback system
═══════════════════════════════════════════════════════════════════════════ */

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

const ToastContext = createContext<{
  showToast: (toast: Omit<Toast, 'id'>) => void;
}>({
  showToast: () => {},
});

function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme } = useTheme();

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getToastStyles = (type: Toast['type']) => {
    const base = theme === 'dark' 
      ? 'bg-[#1a1a2e] border shadow-2xl' 
      : 'bg-white border shadow-lg';
    
    switch (type) {
      case 'success':
        return `${base} ${theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-200'}`;
      case 'error':
        return `${base} ${theme === 'dark' ? 'border-red-500/30' : 'border-red-200'}`;
      case 'warning':
        return `${base} ${theme === 'dark' ? 'border-amber-500/30' : 'border-amber-200'}`;
      default:
        return `${base} ${theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'}`;
    }
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} rounded-xl p-4 flex items-start gap-3 animate-slide-up min-w-[300px]`}
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10 text-white/40' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETONS - Data fetching framework
═══════════════════════════════════════════════════════════════════════════ */

function Skeleton({ className = '' }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <div 
      className={`animate-pulse rounded-lg ${
        theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
      } ${className}`}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StatCardSkeleton() {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl p-5 ${
      theme === 'dark'
        ? 'bg-white/[0.03] border border-white/[0.06]'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-8 h-8" />
      </div>
      <Skeleton className="w-24 h-8 mb-2" />
      <Skeleton className="w-20 h-4" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ContentCardSkeleton() {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark'
        ? 'bg-white/[0.03] border border-white/[0.06]'
        : 'bg-white border border-gray-200'
    }`}>
      <Skeleton className="w-full h-40 mb-4" />
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl overflow-hidden ${
      theme === 'dark' ? 'bg-white/[0.02] border border-white/[0.06]' : 'bg-white border border-gray-200'
    }`}>
      <div className={`p-4 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
        <div className="flex gap-4">
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`p-4 ${theme === 'dark' ? 'border-t border-white/[0.06]' : 'border-t border-gray-100'}`}>
          <div className="flex gap-4">
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL SHARE BUTTONS
═══════════════════════════════════════════════════════════════════════════ */

function ShareButtons({ contentId, title }: { contentId: string | number; title: string }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?content=${contentId}` 
    : '';
  
  const shareText = `Check out "${title}" on BasePaywall! 🔐`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    warpcast: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({ type: 'success', title: 'Link copied!', message: 'Share URL copied to clipboard' });
    } catch {
      showToast({ type: 'error', title: 'Failed to copy', message: 'Please try again' });
    }
  };

  const buttonClass = `p-2 rounded-lg transition-all ${
    theme === 'dark'
      ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white'
      : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Share:</span>
      
      {/* Twitter/X */}
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className={buttonClass} title="Share on X">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      
      {/* Telegram */}
      <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className={buttonClass} title="Share on Telegram">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>
      
      {/* Warpcast */}
      <a href={shareLinks.warpcast} target="_blank" rel="noopener noreferrer" className={buttonClass} title="Share on Warpcast">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.5 2h17A1.5 1.5 0 0122 3.5v17a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 20.5v-17A1.5 1.5 0 013.5 2zm2 4l4.5 6-4.5 6h3l3-4 3 4h3l-4.5-6 4.5-6h-3l-3 4-3-4h-3z" />
        </svg>
      </a>
      
      {/* Copy Link */}
      <button onClick={copyLink} className={buttonClass} title="Copy link">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM - Onchain Creator Hub Style
═══════════════════════════════════════════════════════════════════════════ */

function BaseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
        fill="currentColor"
        className="text-[#0052FF]"
      />
    </svg>
  );
}

function GlowOrb({ className = '' }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'opacity-20' : 'opacity-10'} ${className}`} />
  );
}

function NetworkBadge() {
  const { chain } = useAccount();
  const { theme } = useTheme();
  if (!chain) return null;

  const isTestnet = chain.id === 84532;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      theme === 'dark' 
        ? 'bg-white/5 border border-white/10' 
        : 'bg-gray-100 border border-gray-200'
    }`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${isTestnet ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>{chain.name}</span>
    </div>
  );
}

function WalletAddress() {
  const { address, isConnected } = useAccount();
  const { theme } = useTheme();
  if (!isConnected || !address) return null;

  return (
    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${
      theme === 'dark'
        ? 'bg-white/5 border border-white/10'
        : 'bg-gray-100 border border-gray-200'
    }`}>
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className={`text-xs font-mono ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS & METRICS
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon, gradient }: { label: string; value: string | number; icon: string; gradient: string }) {
  const { theme } = useTheme();
  return (
    <div className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-white/[0.03] border border-white/[0.06] hover:border-white/10'
        : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
          }`}>
            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>{label}</p>
      </div>
    </div>
  );
}

function PlatformStats() {
  const { totalCreators, totalContents, totalRevenueEth } = usePlatformStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard 
        label="Active Creators" 
        value={totalCreators} 
        icon="👩‍🎨" 
        gradient="bg-gradient-to-br from-purple-500/10 to-transparent" 
      />
      <StatCard 
        label="Content Items" 
        value={totalContents} 
        icon="📦" 
        gradient="bg-gradient-to-br from-blue-500/10 to-transparent" 
      />
      <StatCard 
        label="Total Revenue" 
        value={`${totalRevenueEth} ETH`} 
        icon="💎" 
        gradient="bg-gradient-to-br from-emerald-500/10 to-transparent" 
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH & FILTER
═══════════════════════════════════════════════════════════════════════════ */

function SearchBar({ value, onChange, placeholder = 'Search content...' }: { 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  
  return (
    <div className="relative">
      <svg 
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
          theme === 'dark' ? 'text-white/30' : 'text-gray-400'
        }`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 pl-10 pr-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50'
            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
        }`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/10 text-white/50 hover:text-white' : 'bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high';

function FilterDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const currentLabel = options.find(o => o.value === value)?.label || 'Sort by';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-4 rounded-xl flex items-center gap-2 transition-all ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="text-sm">{currentLabel}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-xl z-50 ${
            theme === 'dark' ? 'bg-[#0a0a0f] border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === option.value
                    ? theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : theme === 'dark' ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK START GUIDE
═══════════════════════════════════════════════════════════════════════════ */

function QuickStartGuide() {
  const { isConnected } = useAccount();
  const { isRegistered } = useCreator();
  const { nextContentId } = useNextContentId();
  const hasContent = nextContentId > 1;

  const { theme } = useTheme();

  if (!isConnected) {
    return (
      <div className={`relative overflow-hidden rounded-2xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 border border-amber-500/20' : 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50 border border-amber-200'}`}>
        <GlowOrb className="bg-amber-500 w-32 h-32 -top-10 -right-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Get Started</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Connect to begin your journey</p>
            </div>
          </div>
          <ol className="space-y-3">
            {[
              'Connect your wallet using the button above',
              'Register as a creator in the Dashboard',
              'Create content with your price',
              'Share and start earning'
            ].map((step, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const steps = [
    { done: isConnected, text: 'Connect wallet', icon: '🔗' },
    { done: isRegistered, text: 'Register as creator', icon: '✍️' },
    { done: hasContent, text: 'Create content', icon: '📝' },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const allDone = completedSteps === steps.length;

  if (allDone) {
    return (
      <div className={`relative overflow-hidden rounded-2xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 border border-emerald-500/20' : 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 border border-emerald-200'}`}>
        <GlowOrb className="bg-emerald-500 w-32 h-32 -top-10 -right-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>You&apos;re All Set!</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Ready to monetize your content</p>
            </div>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Content IDs available: <span className="text-emerald-400 font-medium">1 to {(nextContentId - BigInt(1)).toString()}</span>
          </p>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            Test unlocks with a different wallet to see the full flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 border border-blue-500/20' : 'bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 border border-blue-200'}`}>
      <GlowOrb className="bg-blue-500 w-32 h-32 -top-10 -right-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Setup Progress</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>{completedSteps} of {steps.length} completed</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-400">{Math.round((completedSteps / steps.length) * 100)}%</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={`h-1.5 rounded-full overflow-hidden mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${step.done ? (theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-100') : (theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-100')}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step.done ? 'bg-emerald-500/20 text-emerald-400' : (theme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400')
              }`}>
                {step.done ? '✓' : step.icon}
              </span>
              <span className={`text-sm ${step.done ? 'text-emerald-400 line-through' : (theme === 'dark' ? 'text-white/70' : 'text-gray-600')}`}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNLOCKED CONTENT BOX
═══════════════════════════════════════════════════════════════════════════ */

function UnlockedContentBox({ contentId }: { contentId: string }) {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
            : 'bg-gradient-to-br from-emerald-100 to-teal-100'
        }`}>
          <span className="text-2xl">🎉</span>
        </div>
        <div>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Content #{contentId} Unlocked!</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>You have permanent access</p>
        </div>
      </div>
      <p className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>
        This is your exclusive premium content. As a supporter, you now have permanent access
        to this material. Thank you for your support!
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-xl text-center ${
          theme === 'dark' 
            ? 'bg-white/[0.03] border border-white/[0.06]' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Content ID</p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contentId}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${
          theme === 'dark' 
            ? 'bg-white/[0.03] border border-white/[0.06]' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Access</p>
          <p className="text-sm font-medium text-emerald-400">Permanent</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${
          theme === 'dark' 
            ? 'bg-white/[0.03] border border-white/[0.06]' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Network</p>
          <p className="text-sm font-medium text-blue-400">Base</p>
        </div>
      </div>
      
      {/* Share Buttons */}
      <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-200'}`}>
        <ShareButtons contentId={contentId} title={`Premium Content #${contentId}`} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT BROWSER
═══════════════════════════════════════════════════════════════════════════ */

function ContentBrowser({ showSearch = false }: { showSearch?: boolean }) {
  const { theme } = useTheme();
  const [contentId, setContentId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { nextContentId } = useNextContentId();
  const hasContent = nextContentId > 1;
  const currentContentId = BigInt(contentId || '1');
  const maxId = hasContent ? Number(nextContentId - BigInt(1)) : 1;

  return (
    <div className="space-y-6">
      {!showSearch && <QuickStartGuide />}

      {/* Search & Filter Bar */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery} 
              onChange={(v) => {
                setSearchQuery(v);
                if (v && parseInt(v) > 0 && parseInt(v) <= maxId) {
                  setContentId(v);
                }
              }}
              placeholder="Search by content ID..."
            />
          </div>
          <FilterDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

      {/* Content Navigator */}
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-white/[0.02] border border-white/[0.06]'
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <span className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Browse Content</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentId(String(Math.max(1, Number(contentId) - 1)))}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            disabled={Number(contentId) <= 1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={maxId}
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className={`w-20 h-10 rounded-xl px-3 text-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white focus:border-blue-500/50'
                  : 'bg-white border border-gray-200 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>
          <button
            onClick={() => setContentId(String(Math.min(maxId, Number(contentId) + 1)))}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            disabled={!hasContent || Number(contentId) >= maxId}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {hasContent && (
          <span className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
            {maxId} item{maxId > 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Paywall Content */}
      <NetworkGuard>
        <PaywallContentV2
          contentId={currentContentId}
          title={`Premium Content #${contentId}`}
          description="Unlock exclusive content with a one-time payment. No subscriptions, no recurring fees."
          unlockedContent={
            <UnlockedContentBox contentId={contentId} />
          }
        />
      </NetworkGuard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IDRX SECTION - Indonesian Rupiah Stablecoin Integration
═══════════════════════════════════════════════════════════════════════════ */

function IDRXSection() {
  const { theme } = useTheme();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">IDR</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0a0a0f]">
                <span className="text-white text-[8px] font-bold">X</span>
              </div>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                IDRX + x402 Protocol
              </h2>
              <p className={theme === 'dark' ? 'text-white/40' : 'text-gray-500'}>
                Bayar dengan Rupiah Digital di Blockchain
              </p>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
          theme === 'dark' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          <span className="text-sm">🇮🇩</span>
          Indonesia Ready
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💱</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Stablecoin</span>
          </div>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1 IDRX = Rp 1</p>
          <p className="text-xs text-emerald-400 mt-1">Backed 1:1 by Rupiah</p>
        </div>

        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚡</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Protocol</span>
          </div>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>HTTP 402</p>
          <p className="text-xs text-blue-400 mt-1">x402 Payment Required</p>
        </div>

        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔗</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Network</span>
          </div>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Base L2</p>
          <p className="text-xs text-purple-400 mt-1">Fast & low fees</p>
        </div>
      </div>

      {/* About IDRX */}
      <div className={`rounded-2xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-red-900/20 to-orange-900/10 border border-red-500/20' 
          : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tentang IDRX
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
              IDRX adalah stablecoin transparan yang didukung oleh Rupiah, dirancang untuk mendukung 
              aplikasi onchain yang stabil, intuitif, dan siap untuk Indonesia. IDRX mengurangi volatilitas 
              dan menghilangkan hambatan dalam memberikan pengalaman dunia nyata yang kohesif bagi pengguna.
            </p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://docs.idrx.co/api/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <span>📖</span> Documentation
              </a>
              <a 
                href="https://idrx.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <span>🌐</span> Website
              </a>
            </div>
          </div>
          <div className={`md:w-48 p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-white'}`}>
            <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Keunggulan IDRX</p>
            <ul className={`text-xs space-y-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Transparan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Stabil
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Indonesia-ready
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Low volatility
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Component */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Demo: Bayar Konten dengan IDRX
        </h3>
        <X402IDRXDemo />
      </div>

      {/* Integration Guide */}
      <div className={`rounded-2xl p-6 ${
        theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Integrasi x402 + IDRX
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>
              1. API Endpoint
            </p>
            <code className={`text-xs font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              GET /api/x402-idrx/content
            </code>
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
              Returns 402 with IDRX payment details
            </p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>
              2. Payment Flow
            </p>
            <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
              <p>• Approve IDRX spending</p>
              <p>• Transfer IDRX to payTo</p>
              <p>• Verify on-chain payment</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>
              3. Response Headers
            </p>
            <div className={`text-xs font-mono space-y-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <p>X-Payment-Asset: IDRX</p>
              <p>X-Payment-TokenAddress: 0x...</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>
              4. Harga Demo
            </p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Rp 15.000
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
              ≈ 15,000 IDRX
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

type AppView = 'home' | 'discover' | 'creator' | 'unlocked' | 'admin' | 'analytics' | 'idrx';

interface NavItem {
  key: AppView;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', description: 'Overview & stats' },
  { key: 'discover', label: 'Discover', icon: '🔍', description: 'Browse content' },
  { key: 'creator', label: 'Create', icon: '✨', description: 'Creator dashboard' },
  { key: 'unlocked', label: 'Library', icon: '📚', description: 'Your unlocks' },
  { key: 'idrx', label: 'IDRX', icon: '🇮🇩', description: 'Pay with Rupiah' },
  { key: 'admin', label: 'Admin', icon: '⚙️', description: 'Platform settings' },
  { key: 'analytics', label: 'Analytics', icon: '📊', description: 'View insights' },
];

function Sidebar({ active, onChange }: { active: AppView; onChange: (v: AppView) => void }) {
  const { theme } = useTheme();
  return (
    <aside className="space-y-2 hidden lg:block">
      {/* Navigation */}
      <nav className="space-y-1 px-2 pt-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
              active === item.key 
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/5'
                  : 'bg-gradient-to-r from-blue-100 to-indigo-50 border border-blue-300 shadow-sm'
                : theme === 'dark'
                  ? 'hover:bg-white/[0.03] border border-transparent'
                  : 'hover:bg-gray-100 border border-transparent'
            }`}
          >
            <span className={`text-lg transition-transform duration-200 ${active === item.key ? 'scale-110' : 'group-hover:scale-105'}`}>
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${active === item.key ? 'text-blue-400' : (theme === 'dark' ? 'text-white/70' : 'text-gray-700')}`}>
                {item.label}
              </p>
              <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{item.description}</p>
            </div>
            {active === item.key && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Network Badge */}
      <div className="px-4 pt-6">
        <NetworkBadge />
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

function MobileBottomNav({ active, onChange }: { active: AppView; onChange: (v: AppView) => void }) {
  const { theme } = useTheme();
  const mobileNavItems = navItems.slice(0, 5); // Show first 5 items on mobile

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t safe-area-pb ${
      theme === 'dark'
        ? 'bg-[#0a0a0f]/95 border-white/[0.06]'
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex items-center justify-around py-2 px-1">
        {mobileNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
              active === item.key
                ? theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                : ''
            }`}
          >
            <span className={`text-xl ${active === item.key ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium ${
              active === item.key
                ? 'text-blue-400'
                : theme === 'dark' ? 'text-white/50' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const { theme } = useTheme();
  const steps = [
    { icon: '👩‍🎨', title: 'Register', desc: 'Connect wallet & become a creator', gradient: 'from-purple-500/20' },
    { icon: '📝', title: 'Create', desc: 'Publish paywalled content', gradient: 'from-blue-500/20' },
    { icon: '💳', title: 'Monetize', desc: 'Users pay in ETH on Base', gradient: 'from-emerald-500/20' },
    { icon: '💰', title: 'Earn', desc: 'Withdraw anytime', gradient: 'from-amber-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {steps.map((step, i) => (
        <div key={i} className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-white/[0.02] border border-white/[0.06] hover:border-white/10'
            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
              theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h4 className={`text-base font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{step.title}</h4>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>{step.desc}</p>
          </div>
          {/* Step number */}
          <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
          }`}>
            <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{i + 1}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS DASHBOARD - Revenue & Stats
═══════════════════════════════════════════════════════════════════════════ */

function SimpleBarChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const { theme } = useTheme();
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end gap-2 justify-between" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-2">
          <div className="relative w-full flex justify-center">
            <div
              className="w-8 md:w-12 rounded-t-lg bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-500 hover:from-blue-400 hover:to-indigo-400"
              style={{ 
                height: `${Math.max((item.value / maxValue) * (height - 40), 4)}px`,
              }}
            />
          </div>
          <span className={`text-[10px] md:text-xs truncate max-w-full ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsDashboard() {
  const { theme } = useTheme();
  const { totalCreators, totalContents, totalRevenueEth } = usePlatformStats();
  const { isConnected } = useAccount();
  const { isRegistered, balanceEth } = useCreator();

  // Mock data for the chart (in real app, fetch from contract events)
  const revenueData = [
    { label: 'Mon', value: 0.05 },
    { label: 'Tue', value: 0.12 },
    { label: 'Wed', value: 0.08 },
    { label: 'Thu', value: 0.25 },
    { label: 'Fri', value: 0.18 },
    { label: 'Sat', value: 0.32 },
    { label: 'Sun', value: 0.15 },
  ];

  const unlockData = [
    { label: 'Week 1', value: 12 },
    { label: 'Week 2', value: 28 },
    { label: 'Week 3', value: 19 },
    { label: 'Week 4', value: 45 },
  ];

  const trendingContent = [
    { id: 1, title: 'Getting Started Guide', unlocks: 45, revenue: '0.45 ETH' },
    { id: 2, title: 'Advanced Techniques', unlocks: 32, revenue: '0.64 ETH' },
    { id: 3, title: 'Pro Tips Collection', unlocks: 28, revenue: '0.28 ETH' },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</h2>
          <p className={theme === 'dark' ? 'text-white/40' : 'text-gray-500'}>Track your performance and insights</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
          theme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Total Revenue</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalRevenueEth} ETH</p>
          <p className="text-xs text-emerald-400 mt-1">Platform-wide</p>
        </div>

        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📦</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Total Content</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalContents}</p>
          <p className="text-xs text-blue-400 mt-1">Items published</p>
        </div>

        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👩‍🎨</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Creators</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalCreators}</p>
          <p className="text-xs text-purple-400 mt-1">Active creators</p>
        </div>

        <div className={`rounded-2xl p-5 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💎</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Your Balance</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isConnected && isRegistered ? balanceEth : '—'} ETH
          </p>
          <p className="text-xs text-amber-400 mt-1">Available to withdraw</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Revenue Trend</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Last 7 days</p>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs ${
              theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
            }`}>
              +24.5%
            </div>
          </div>
          <SimpleBarChart data={revenueData} height={180} />
        </div>

        {/* Unlock Rate Chart */}
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Unlock Statistics</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Weekly unlocks</p>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs ${
              theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              104 total
            </div>
          </div>
          <SimpleBarChart data={unlockData} height={180} />
        </div>
      </div>

      {/* Trending Content */}
      <div className={`rounded-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`p-4 ${theme === 'dark' ? 'border-b border-white/[0.06]' : 'border-b border-gray-200'}`}>
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Trending Content</h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>Most popular this week</p>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {trendingContent.map((content, i) => (
            <div key={content.id} className={`p-4 flex items-center gap-4 ${
              theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
            } transition-colors`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                i === 0 ? 'bg-amber-500/20 text-amber-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {content.title}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                  {content.unlocks} unlocks
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {content.revenue}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */

function HomeContent() {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<AppView>('home');

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GlowOrb className="bg-blue-600 w-96 h-96 -top-48 -left-48" />
        <GlowOrb className="bg-purple-600 w-96 h-96 -bottom-48 -right-48" />
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        )}
      </div>

      {/* Header */}
      <header className={`relative border-b backdrop-blur-xl sticky top-0 z-50 ${
        theme === 'dark' 
          ? 'border-white/[0.06] bg-black/20' 
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BaseLogo size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>BasePaywall</h1>
              <span className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>Creator Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WalletAddress />
            <NotificationBell />
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Sidebar active={activeView} onChange={setActiveView} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {activeView === 'home' && (
              <>
                {/* Hero Section */}
                <section className={`relative overflow-hidden rounded-3xl p-8 md:p-12 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-indigo-600/20 border border-white/[0.08]'
                    : 'bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 border border-gray-200'
                }`}>
                  <GlowOrb className="bg-blue-500 w-64 h-64 -top-32 -right-32" />
                  <div className="relative max-w-2xl">
                    <div className={`inline-flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium mb-6 ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 text-white/70'
                        : 'bg-white/80 border border-gray-200 text-gray-600'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      HTTP 402 Payment Required
                    </div>
                    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Monetize Your Content{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                        On-Chain
                      </span>
                    </h2>
                    <p className={`text-lg leading-relaxed mb-8 ${theme === 'dark' ? 'text-white/50' : 'text-gray-600'}`}>
                      Create paywalled content, accept one-time payments, give permanent access. 
                      Built on Base for low fees and instant transactions.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setActiveView('creator')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Start Creating →
                      </button>
                      <button 
                        onClick={() => setActiveView('discover')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          theme === 'dark'
                            ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Explore Content
                      </button>
                    </div>
                  </div>
                </section>

                {/* Stats */}
                <PlatformStats />

                {/* How It Works */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>How It Works</h3>
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>4 simple steps</span>
                  </div>
                  <HowItWorks />
                </section>

                {/* Quick Access Content Browser */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Access</h3>
                    <button 
                      onClick={() => setActiveView('discover')}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  <ContentBrowser />
                </section>
              </>
            )}

            {activeView === 'discover' && (
              <section className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Discover Content</h2>
                  <p className={theme === 'dark' ? 'text-white/40' : 'text-gray-500'}>Browse and unlock premium content from creators</p>
                </div>
                <ContentBrowser showSearch />
              </section>
            )}

            {activeView === 'creator' && (
              <section>
                <CreatorDashboardV2 />
              </section>
            )}

            {activeView === 'admin' && (
              <section>
                <PlatformAdminV2 />
              </section>
            )}

            {activeView === 'unlocked' && (
              <section>
                <UserUnlockedContentV2 />
              </section>
            )}

            {activeView === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {activeView === 'idrx' && (
              <IDRXSection />
            )}
          </div>
        </div>
      </div>

      {/* Footer - hidden on mobile due to bottom nav */}
      <footer className={`relative mt-16 border-t pb-20 lg:pb-0 ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BaseLogo size={16} />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>BasePaywall • Creator Hub on Base</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="https://github.com/bandungresearchai/BasePaywall" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                GitHub
              </a>
              <a href="https://base.org" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                Base
              </a>
              <a href="https://onchainkit.xyz" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                OnchainKit
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav active={activeView} onChange={setActiveView} />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT - Wrap with Providers
═══════════════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <HomeContent />
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
