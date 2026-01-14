'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BASEPAYWALL_ABI, BASEPAYWALL_ADDRESS, DEFAULT_PRICE_WEI } from '@/config/contract';
import { useEffect, useState, useCallback } from 'react';
import { parseEther } from 'viem';

// Default content ID for backward compatibility
export const DEFAULT_CONTENT_ID = BigInt(1);

export function useContractOwner() {
  const { address, isConnected } = useAccount();

  const { data: owner, isLoading } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'owner',
    query: {
      enabled: isConnected,
    },
  });

  const isOwner = address && owner ? address.toLowerCase() === (owner as string).toLowerCase() : false;

  return {
    owner: owner as `0x${string}` | undefined,
    isOwner,
    isLoading,
  };
}

export function usePaywallStatus(contentId: bigint = DEFAULT_CONTENT_ID) {
  const { address, isConnected } = useAccount();
  const { isOwner } = useContractOwner();

  const {
    data: hasPaid,
    isLoading: isCheckingStatus,
    refetch: refetchStatus,
  } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'hasAccess',
    args: address ? [contentId, address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Owner always has access
  const hasAccess = isOwner || (hasPaid ?? false);

  return {
    hasPaid: hasPaid ?? false,
    hasAccess,
    isOwner,
    isCheckingStatus,
    refetchStatus,
    isConnected,
    address,
    contentId,
  };
}

export function usePaywallPayment(contentId: bigint = DEFAULT_CONTENT_ID) {
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { price } = usePaywallPrice(contentId);
  const { hasAccess, refetchStatus } = usePaywallStatus(contentId);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  // Auto-refetch access status on success
  useEffect(() => {
    if (isSuccess) {
      setTxStatus('success');
      // Refetch after a short delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchStatus();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchStatus]);

  useEffect(() => {
    if (isPending) {
      setTxStatus('pending');
      setError(null);
    } else if (isConfirming) {
      setTxStatus('confirming');
    } else if (writeError) {
      setTxStatus('error');
      setError(writeError.message || 'Transaction failed');
    }
  }, [isPending, isConfirming, writeError]);

  const pay = useCallback(() => {
    // Safety guard: prevent double payment
    if (hasAccess) {
      setError('You already have access to this content');
      setTxStatus('error');
      return;
    }
    if (isPending || isConfirming) {
      return; // Prevent double submission
    }
    setError(null);
    writeContract({
      address: BASEPAYWALL_ADDRESS,
      abi: BASEPAYWALL_ABI,
      functionName: 'pay',
      args: [contentId],
      value: price,
    });
  }, [hasAccess, isPending, isConfirming, writeContract, contentId, price]);

  const reset = useCallback(() => {
    setTxStatus('idle');
    setError(null);
    resetWrite();
  }, [resetWrite]);

  return {
    pay,
    reset,
    txStatus,
    error,
    hash,
    receipt,
    isPending,
    isConfirming,
    isSuccess,
    contentId,
    // Transaction safety
    canPay: !hasAccess && !isPending && !isConfirming,
    isTransactionPending: isPending || isConfirming,
  };
}

export function usePaywallPrice(contentId: bigint = DEFAULT_CONTENT_ID) {
  const { data: price, isLoading } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getContentPrice',
    args: [contentId],
  });

  return {
    price: price ?? DEFAULT_PRICE_WEI,
    priceInEth: price ? Number(price) / 1e18 : 0.001,
    isLoading,
    contentId,
  };
}

// Hook to get user's unlocked content history
export function useUserUnlockedContent() {
  const { address, isConnected } = useAccount();

  const {
    data: unlockedContent,
    isLoading,
    refetch,
  } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getUserUnlockedContent',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { data: unlockCount } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getUserUnlockCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  return {
    unlockedContent: (unlockedContent as bigint[]) ?? [],
    unlockCount: Number(unlockCount ?? 0),
    isLoading,
    refetch,
  };
}

// Hook for creator dashboard - contract stats
export function useCreatorDashboard() {
  const { isOwner } = useContractOwner();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getBalance',
  });

  const { data: totalRevenue, refetch: refetchRevenue } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getTotalRevenue',
  });

  const { data: nftMintEnabled } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'nftMintEnabled',
  });

  return {
    isOwner,
    balance: balance ?? BigInt(0),
    balanceInEth: balance ? Number(balance) / 1e18 : 0,
    totalRevenue: totalRevenue ?? BigInt(0),
    totalRevenueInEth: totalRevenue ? Number(totalRevenue) / 1e18 : 0,
    nftMintEnabled: nftMintEnabled ?? false,
    refetchBalance,
    refetchRevenue,
  };
}

// Hook for content stats (creator view)
export function useContentStats(contentId: bigint) {
  const { data: stats, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getContentStats',
    args: [contentId],
  });

  const [price, revenue, unlocks, enabled] = (stats as [bigint, bigint, bigint, boolean]) ?? [
    BigInt(0),
    BigInt(0),
    BigInt(0),
    true,
  ];

  return {
    price,
    priceInEth: Number(price) / 1e18,
    revenue,
    revenueInEth: Number(revenue) / 1e18,
    unlocks: Number(unlocks),
    enabled,
    isLoading,
    refetch,
  };
}

// Hook for creator actions (set price, enable/disable content, withdraw)
export function useCreatorActions() {
  const { isOwner } = useContractOwner();
  const { writeContract, isPending, error, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setContentPrice = useCallback(
    (contentId: bigint, priceInEth: string) => {
      if (!isOwner) return;
      const priceWei = parseEther(priceInEth);
      writeContract({
        address: BASEPAYWALL_ADDRESS,
        abi: BASEPAYWALL_ABI,
        functionName: 'setContentPrice',
        args: [contentId, priceWei],
      });
    },
    [isOwner, writeContract]
  );

  const setContentEnabled = useCallback(
    (contentId: bigint, enabled: boolean) => {
      if (!isOwner) return;
      writeContract({
        address: BASEPAYWALL_ADDRESS,
        abi: BASEPAYWALL_ABI,
        functionName: 'setContentEnabled',
        args: [contentId, enabled],
      });
    },
    [isOwner, writeContract]
  );

  const setNFTMintEnabled = useCallback(
    (enabled: boolean) => {
      if (!isOwner) return;
      writeContract({
        address: BASEPAYWALL_ADDRESS,
        abi: BASEPAYWALL_ABI,
        functionName: 'setNFTMintEnabled',
        args: [enabled],
      });
    },
    [isOwner, writeContract]
  );

  const withdraw = useCallback(() => {
    if (!isOwner) return;
    writeContract({
      address: BASEPAYWALL_ADDRESS,
      abi: BASEPAYWALL_ABI,
      functionName: 'withdraw',
    });
  }, [isOwner, writeContract]);

  return {
    setContentPrice,
    setContentEnabled,
    setNFTMintEnabled,
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    isOwner,
  };
}
