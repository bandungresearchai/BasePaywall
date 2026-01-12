'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia, base } from 'wagmi/chains';
import { wagmiConfig } from '@/config/wagmi';

const queryClient = new QueryClient();

// Use Base Sepolia for development, Base mainnet for production
const activeChain = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={activeChain}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
