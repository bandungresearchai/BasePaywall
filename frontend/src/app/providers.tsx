'use client';

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { wagmiConfig, defaultChain, isSupportedChain } from '@/config/wagmi';
import { ToastProvider } from '@/components/ui/Toast';

// Create query client outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Network Guard Component
 * Automatically prompts users to switch to a supported network (Base or Base Sepolia)
 */
function NetworkGuard({ children }: { children: ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const [showNetworkError, setShowNetworkError] = useState(false);

  const isWrongNetwork = isConnected && chain && !isSupportedChain(chain.id);

  useEffect(() => {
    if (isWrongNetwork) {
      setShowNetworkError(true);
      // Automatically prompt to switch network
      switchChain?.({ chainId: defaultChain.id });
    } else {
      setShowNetworkError(false);
    }
  }, [isWrongNetwork, switchChain]);

  if (showNetworkError && isWrongNetwork) {
    return (
      <div className="min-h-screen bg-base-dark flex items-center justify-center p-4">
        <div className="bg-gray-900/80 border border-red-500/50 rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Wrong Network</h2>
          <p className="text-gray-400">
            BasePaywall only supports <span className="text-base-blue font-semibold">Base</span> and{' '}
            <span className="text-yellow-400 font-semibold">Base Sepolia</span> networks.
          </p>
          <p className="text-sm text-gray-500">
            Currently connected to: <span className="text-red-400">{chain?.name || 'Unknown'}</span>
          </p>
          <button
            onClick={() => switchChain?.({ chainId: defaultChain.id })}
            disabled={isPending}
            className="w-full bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            {isPending ? 'Switching...' : `Switch to ${defaultChain.name}`}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={defaultChain}
        >
          <ToastProvider>
            <NetworkGuard>{children}</NetworkGuard>
          </ToastProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
