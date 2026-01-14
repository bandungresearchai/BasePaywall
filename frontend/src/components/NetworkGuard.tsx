'use client';

import { useNetwork } from '@/hooks/useNetwork';
import { ReactNode } from 'react';

interface NetworkGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function SwitchNetworkButton() {
  const { switchToDefault, isSwitching, defaultChain } = useNetwork();

  return (
    <button
      onClick={switchToDefault}
      disabled={isSwitching}
      className="bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
    >
      {isSwitching ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Switching...</span>
        </>
      ) : (
        <>
          <span>🔄</span>
          <span>Switch to {defaultChain.name}</span>
        </>
      )}
    </button>
  );
}

function WrongNetworkWarning() {
  const { chainName, defaultChain } = useNetwork();

  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Wrong Network</h2>
        <p className="text-gray-400 max-w-md">
          You&apos;re connected to <span className="text-red-400 font-medium">{chainName || 'an unsupported network'}</span>.
          Please switch to <span className="text-base-blue font-medium">{defaultChain.name}</span> to continue.
        </p>
        <SwitchNetworkButton />
      </div>
    </div>
  );
}

/**
 * NetworkGuard component
 * Wraps content and shows a warning if user is on wrong network
 * Blocks interaction until user switches to correct network
 */
export function NetworkGuard({ children, fallback }: NetworkGuardProps) {
  const { isWrongNetwork, isConnected } = useNetwork();

  // If not connected, show children (wallet connection prompts will handle it)
  if (!isConnected) {
    return <>{children}</>;
  }

  // If on wrong network, show warning
  if (isWrongNetwork) {
    return fallback ?? <WrongNetworkWarning />;
  }

  // All good, show children
  return <>{children}</>;
}

/**
 * Hook-based network guard for programmatic use
 * Returns whether transactions should be blocked
 */
export function useNetworkGuard() {
  const { isWrongNetwork, isConnected, switchToDefault, isSwitching } = useNetwork();

  const shouldBlockTransaction = isConnected && isWrongNetwork;

  return {
    shouldBlockTransaction,
    isWrongNetwork,
    switchToDefault,
    isSwitching,
  };
}
