'use client';

import { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON - Loading placeholder with shimmer effect
═══════════════════════════════════════════════════════════════════════════ */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-white/10';
  
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = animate 
    ? 'animate-pulse relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent'
    : '';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      style={style}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT CARD SKELETON
═══════════════════════════════════════════════════════════════════════════ */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-video" variant="rectangular" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Price and button */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO GRID SKELETON
═══════════════════════════════════════════════════════════════════════════ */

export function BentoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div 
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD SKELETON
═══════════════════════════════════════════════════════════════════════════ */

export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
        <Skeleton className="w-12 h-12" variant="circular" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE SKELETON
═══════════════════════════════════════════════════════════════════════════ */

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-white/5 px-6 py-4 border-b border-white/5">
        <div className="flex gap-6">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="px-6 py-4 border-b border-white/5 last:border-0">
          <div className="flex gap-6">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-5 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SPINNER
═══════════════════════════════════════════════════════════════════════════ */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export function Spinner({ size = 'md', color = 'blue', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'text-blue-400',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING OVERLAY
═══════════════════════════════════════════════════════════════════════════ */

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: ReactNode;
}

export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <Spinner size="lg" />
          {message && <p className="text-white text-sm">{message}</p>}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE LOADER
═══════════════════════════════════════════════════════════════════════════ */

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 111 111" fill="none">
            <path
              d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
              fill="#0052FF"
            />
          </svg>
        </div>
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════════════════════════════ */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading the content.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

export default Skeleton;
