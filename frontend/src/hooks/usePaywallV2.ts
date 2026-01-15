'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BASEPAYWALL_V2_ABI, BASEPAYWALL_V2_ADDRESS, formatPriceEth, parseEthToWei } from '@/config/contractV2';
import { useEffect, useState, useCallback } from 'react';

// ============ Platform Hooks ============

/**
 * Hook to get the next content ID (useful to know how many contents exist)
 */
export function useNextContentId() {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'nextContentId',
  });

  return {
    nextContentId: data ? (data as bigint) : BigInt(1),
    isLoading,
    refetch,
  };
}

/**
 * Hook to check if connected wallet is the platform owner
 */
export function usePlatformOwner() {
  const { address, isConnected } = useAccount();

  const { data: owner, isLoading } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'owner',
    query: { enabled: isConnected },
  });

  const isOwner = address && owner ? address.toLowerCase() === (owner as string).toLowerCase() : false;

  return { owner: owner as `0x${string}` | undefined, isOwner, isLoading };
}

/**
 * Hook to get platform statistics
 */
export function usePlatformStats() {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getPlatformStats',
  });

  const stats = data as [bigint, bigint, bigint, bigint] | undefined;

  return {
    totalCreators: stats ? Number(stats[0]) : 0,
    totalContents: stats ? Number(stats[1]) : 0,
    totalRevenue: stats ? stats[2] : BigInt(0),
    totalRevenueEth: stats ? formatPriceEth(stats[2]) : '0',
    platformBalance: stats ? stats[3] : BigInt(0),
    platformBalanceEth: stats ? formatPriceEth(stats[3]) : '0',
    isLoading,
    refetch,
  };
}

/**
 * Hook for platform fee
 */
export function usePlatformFee() {
  const { data: feeBps, isLoading } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'platformFeeBps',
  });

  return {
    feeBps: feeBps ? Number(feeBps) : 0,
    feePercent: feeBps ? Number(feeBps) / 100 : 0,
    isLoading,
  };
}

// ============ Creator Hooks ============

/**
 * Hook to get creator data for connected wallet
 */
export function useCreator() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getCreator',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  const creator = data as [boolean, bigint, bigint, bigint] | undefined;

  return {
    isRegistered: creator ? creator[0] : false,
    balance: creator ? creator[1] : BigInt(0),
    balanceEth: creator ? formatPriceEth(creator[1]) : '0',
    contentCount: creator ? Number(creator[2]) : 0,
    totalRevenue: creator ? creator[3] : BigInt(0),
    totalRevenueEth: creator ? formatPriceEth(creator[3]) : '0',
    isLoading,
    refetch,
  };
}

/**
 * Hook to get creator's content IDs
 */
export function useCreatorContents() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getCreatorContents',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  return {
    contentIds: (data as bigint[]) || [],
    isLoading,
    refetch,
  };
}

/**
 * Hook for creator registration
 */
export function useRegisterCreator() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = useCreator();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const register = useCallback(() => {
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'registerCreator',
    });
  }, [writeContract]);

  return {
    register,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: error?.message || null,
    reset,
  };
}

/**
 * Hook for creating content
 */
export function useCreateContent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch: refetchCreator } = useCreator();
  const { refetch: refetchContents } = useCreatorContents();

  useEffect(() => {
    if (isSuccess) {
      refetchCreator();
      refetchContents();
    }
  }, [isSuccess, refetchCreator, refetchContents]);

  const createContent = useCallback((priceEth: string) => {
    const priceWei = parseEthToWei(priceEth);
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'createContent',
      args: [priceWei],
    });
  }, [writeContract]);

  return {
    createContent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: error?.message || null,
    reset,
  };
}

/**
 * Hook for updating content
 */
export function useUpdateContent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateContent = useCallback((contentId: bigint, priceEth: string, enabled: boolean) => {
    const priceWei = priceEth ? parseEthToWei(priceEth) : BigInt(0);
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'updateContent',
      args: [contentId, priceWei, enabled],
    });
  }, [writeContract]);

  return {
    updateContent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: error?.message || null,
    reset,
  };
}

/**
 * Hook for creator withdrawal
 */
export function useCreatorWithdraw() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = useCreator();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const withdraw = useCallback(() => {
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'withdrawCreatorBalance',
    });
  }, [writeContract]);

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: error?.message || null,
    reset,
  };
}

// ============ Content Hooks ============

/**
 * Hook to get content details
 */
export function useContent(contentId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getContent',
    args: [contentId],
    query: { enabled: contentId > BigInt(0) },
  });

  const content = data as [string, bigint, boolean, bigint, bigint] | undefined;

  return {
    creator: content ? (content[0] as `0x${string}`) : undefined,
    price: content ? content[1] : BigInt(0),
    priceEth: content ? formatPriceEth(content[1]) : '0',
    enabled: content ? content[2] : false,
    revenue: content ? content[3] : BigInt(0),
    revenueEth: content ? formatPriceEth(content[3]) : '0',
    unlockCount: content ? Number(content[4]) : 0,
    isLoading,
    refetch,
  };
}

/**
 * Hook to check user access to content
 */
export function useContentAccess(contentId: bigint) {
  const { address, isConnected } = useAccount();

  const { data: hasAccess, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'checkAccess',
    args: address ? [contentId, address] : undefined,
    query: { enabled: !!address && isConnected && contentId > BigInt(0) },
  });

  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    refetch,
    address,
    isConnected,
  };
}

/**
 * Hook for unlocking content (payment)
 */
export function useUnlockContent(contentId: bigint) {
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const { price, priceEth } = useContent(contentId);
  const { hasAccess, refetch: refetchAccess } = useContentAccess(contentId);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setTxStatus('success');
      setTimeout(() => refetchAccess(), 1000);
    }
  }, [isSuccess, refetchAccess]);

  useEffect(() => {
    if (isPending) {
      setTxStatus('pending');
    } else if (isConfirming) {
      setTxStatus('confirming');
    } else if (writeError) {
      setTxStatus('error');
    }
  }, [isPending, isConfirming, writeError]);

  const unlock = useCallback(() => {
    if (hasAccess) return;
    setTxStatus('pending');
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'unlock',
      args: [contentId],
      value: price,
    });
  }, [writeContract, contentId, price, hasAccess]);

  const reset = useCallback(() => {
    setTxStatus('idle');
    resetWrite();
  }, [resetWrite]);

  return {
    unlock,
    price,
    priceEth,
    hasAccess,
    txStatus,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError?.message || null,
    reset,
  };
}

// ============ User Hooks ============

/**
 * Hook to get user's unlocked content IDs
 */
export function useUserUnlocks() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getUserUnlocks',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  return {
    contentIds: (data as bigint[]) || [],
    count: (data as bigint[])?.length || 0,
    isLoading,
    refetch,
  };
}

// ============ Platform Admin Hooks ============

/**
 * Hook for platform owner to withdraw fees
 */
export function usePlatformWithdraw() {
  const { isOwner } = usePlatformOwner();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = usePlatformStats();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const withdraw = useCallback(() => {
    if (!isOwner) return;
    writeContract({
      address: BASEPAYWALL_V2_ADDRESS,
      abi: BASEPAYWALL_V2_ABI,
      functionName: 'withdrawPlatformBalance',
    });
  }, [writeContract, isOwner]);

  return {
    withdraw,
    isOwner,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: error?.message || null,
    reset,
  };
}
