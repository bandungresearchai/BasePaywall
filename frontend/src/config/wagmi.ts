import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from env
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Supported chains - Base and Base Sepolia only
export const supportedChains = [baseSepolia, base] as const;

// Default chain based on environment
export const defaultChain = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    // Coinbase Wallet - primary/default wallet
    coinbaseWallet({
      appName: 'BasePaywall',
      preference: 'all', // Support both smart wallet and EOA
    }),
    // Injected wallets (MetaMask, Brave, etc. installed in browser)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect - supports MetaMask Mobile, Trust Wallet, Rainbow, etc.
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            showQrModal: true,
            metadata: {
              name: 'BasePaywall',
              description: 'On-chain content paywall on Base L2',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://basepaywall.xyz',
              icons: ['https://basepaywall.xyz/icon.png'],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    ),
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
    ),
  },
  // SSR-safe storage
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

// Helper to check if chain is supported
export function isSupportedChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return supportedChains.some((chain) => chain.id === chainId);
}
