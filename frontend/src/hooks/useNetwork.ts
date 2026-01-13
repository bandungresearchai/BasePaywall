'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { isSupportedChain, defaultChain, supportedChains } from '@/config/wagmi';

/**
 * Hook for network validation and switching
 * Provides utilities to check if user is on correct network and switch if needed
 */
export function useNetwork() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();

  const isSupported = isSupportedChain(chain?.id);
  const isWrongNetwork = isConnected && !isSupported;
  const isCorrectNetwork = isConnected && isSupported;

  const switchToDefault = () => {
    if (switchChain) {
      switchChain({ chainId: defaultChain.id });
    }
  };

  const switchToChain = (chainId: number) => {
    if (switchChain && supportedChains.some((c) => c.id === chainId)) {
      switchChain({ chainId });
    }
  };

  return {
    // Current chain info
    chain,
    chainId: chain?.id,
    chainName: chain?.name,
    
    // Network status
    isConnected,
    isSupported,
    isWrongNetwork,
    isCorrectNetwork,
    
    // Available chains
    supportedChains,
    defaultChain,
    
    // Switch functions
    switchToDefault,
    switchToChain,
    isSwitching,
    switchError,
  };
}

/**
 * Hook to get explorer URLs for the current chain
 */
export function useExplorer() {
  const { chain } = useAccount();
  
  const getTransactionUrl = (hash: string) => {
    if (!chain?.blockExplorers?.default?.url) {
      return `https://sepolia.basescan.org/tx/${hash}`;
    }
    return `${chain.blockExplorers.default.url}/tx/${hash}`;
  };

  const getAddressUrl = (address: string) => {
    if (!chain?.blockExplorers?.default?.url) {
      return `https://sepolia.basescan.org/address/${address}`;
    }
    return `${chain.blockExplorers.default.url}/address/${address}`;
  };

  return {
    explorerUrl: chain?.blockExplorers?.default?.url || 'https://sepolia.basescan.org',
    getTransactionUrl,
    getAddressUrl,
  };
}
