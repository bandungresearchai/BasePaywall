'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  BASEPAYWALL_V3_ABI, 
  BASEPAYWALL_V3_ADDRESS, 
  formatPriceEth, 
  parseEthToWei, 
  formatDuration,
  formatTimeRemaining,
  ACCESS_DURATIONS 
} from '@/config/contractV3';
import { useEffect, useState, useCallback } from 'react';

// ============ Platform Hooks ============

/**
 * Hook to get the next content ID (useful to know how many contents exist)
 */
export function useNextContentIdV3() {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
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
export function usePlatformOwnerV3() {
  const { address, isConnected } = useAccount();

  const { data: owner, isLoading } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
    functionName: 'owner',
    query: { enabled: isConnected },
  });

  const isOwner = address && owner ? address.toLowerCase() === (owner as string).toLowerCase() : false;

  return { owner: owner as `0x${string}` | undefined, isOwner, isLoading };
}

/**
 * Hook to get platform statistics
 */
export function usePlatformStatsV3() {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
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

// ============ Creator Hooks ============

/**
 * Hook to get creator data for connected wallet
 */
export function useCreatorV3() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
    functionName: 'getCreator',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  const creatorData = data as [boolean, bigint, bigint, bigint, bigint] | undefined;

  return {
    isRegistered: creatorData?.[0] ?? false,
    balance: creatorData?.[1] ?? BigInt(0),
    balanceEth: creatorData ? formatPriceEth(creatorData[1]) : '0',
    contentCount: creatorData ? Number(creatorData[2]) : 0,
    totalRevenue: creatorData?.[3] ?? BigInt(0),
    totalRevenueEth: creatorData ? formatPriceEth(creatorData[3]) : '0',
    registeredAt: creatorData ? Number(creatorData[4]) : 0,
    isLoading,
    refetch,
    address,
    isConnected,
  };
}

/**
 * Hook to get creator's content IDs
 */
export function useCreatorContentsV3() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
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
export function useRegisterCreatorV3() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = useCreatorV3();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const register = useCallback(() => {
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
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
 * Hook for creating content with time-limited or permanent access
 */
export function useCreateContentV3() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch: refetchCreator } = useCreatorV3();
  const { refetch: refetchContents } = useCreatorContentsV3();

  useEffect(() => {
    if (isSuccess) {
      refetchCreator();
      refetchContents();
    }
  }, [isSuccess, refetchCreator, refetchContents]);

  /**
   * Create content with specified access duration
   * @param priceEth Price in ETH
   * @param accessDuration Duration in seconds (0 = permanent)
   */
  const createContent = useCallback((priceEth: string, accessDuration: number = 0) => {
    const priceWei = parseEthToWei(priceEth);
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
      functionName: 'createContent',
      args: [priceWei, BigInt(accessDuration)],
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
export function useUpdateContentV3() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateContent = useCallback((
    contentId: bigint, 
    priceEth: string, 
    enabled: boolean,
    accessDuration?: number
  ) => {
    const priceWei = priceEth ? parseEthToWei(priceEth) : BigInt(0);
    
    if (accessDuration !== undefined) {
      writeContract({
        address: BASEPAYWALL_V3_ADDRESS,
        abi: BASEPAYWALL_V3_ABI,
        functionName: 'updateContent',
        args: [contentId, priceWei, enabled, BigInt(accessDuration)],
      });
    } else {
      // Keep existing duration
      writeContract({
        address: BASEPAYWALL_V3_ADDRESS,
        abi: BASEPAYWALL_V3_ABI,
        functionName: 'updateContent',
        args: [contentId, priceWei, enabled],
      });
    }
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
export function useCreatorWithdrawV3() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = useCreatorV3();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const withdraw = useCallback(() => {
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
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
 * Hook to get content details (V3 includes accessDuration)
 */
export function useContentV3(contentId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
    functionName: 'getContent',
    args: [contentId],
    query: { enabled: contentId > BigInt(0) },
  });

  const content = data as [string, bigint, boolean, bigint, bigint, bigint] | undefined;

  return {
    creator: content ? (content[0] as `0x${string}`) : undefined,
    price: content ? content[1] : BigInt(0),
    priceEth: content ? formatPriceEth(content[1]) : '0',
    enabled: content ? content[2] : false,
    revenue: content ? content[3] : BigInt(0),
    revenueEth: content ? formatPriceEth(content[3]) : '0',
    unlockCount: content ? Number(content[4]) : 0,
    accessDuration: content ? Number(content[5]) : 0,
    accessDurationFormatted: content ? formatDuration(Number(content[5])) : 'Permanent',
    isPermanent: content ? Number(content[5]) === 0 : true,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get user access details for content (V3 includes expiration)
 */
export function useContentAccessV3(contentId: bigint) {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
    functionName: 'getAccessDetails',
    args: address ? [contentId, address] : undefined,
    query: { enabled: !!address && isConnected && contentId > BigInt(0) },
  });

  const accessData = data as [boolean, bigint, boolean, bigint] | undefined;

  return {
    hasPurchased: accessData?.[0] ?? false,
    expiresAt: accessData ? Number(accessData[1]) : 0,
    isActive: accessData?.[2] ?? false,
    timeRemaining: accessData ? Number(accessData[3]) : 0,
    timeRemainingFormatted: accessData ? formatTimeRemaining(Number(accessData[3])) : '',
    isPermanent: accessData ? Number(accessData[1]) === 0 : true,
    isExpired: accessData ? (accessData[0] && !accessData[2]) : false,
    isLoading,
    refetch,
    address,
    isConnected,
  };
}

/**
 * Hook for unlocking content (first purchase)
 */
export function useUnlockContentV3(contentId: bigint) {
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const { price, priceEth, accessDuration } = useContentV3(contentId);
  const { isActive, hasPurchased, refetch: refetchAccess } = useContentAccessV3(contentId);

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
    if (isActive) return;
    setTxStatus('pending');
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
      functionName: 'unlock',
      args: [contentId],
      value: price,
    });
  }, [writeContract, contentId, price, isActive]);

  const reset = useCallback(() => {
    setTxStatus('idle');
    resetWrite();
  }, [resetWrite]);

  return {
    unlock,
    price,
    priceEth,
    accessDuration,
    isActive,
    hasPurchased,
    txStatus,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError?.message || null,
    reset,
  };
}

/**
 * Hook for extending/renewing access
 */
export function useExtendAccessV3(contentId: bigint) {
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const { price, priceEth, accessDuration, isPermanent } = useContentV3(contentId);
  const { isActive, hasPurchased, expiresAt, refetch: refetchAccess } = useContentAccessV3(contentId);

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

  const extend = useCallback(() => {
    if (!hasPurchased || isPermanent) return;
    setTxStatus('pending');
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
      functionName: 'extendAccess',
      args: [contentId],
      value: price,
    });
  }, [writeContract, contentId, price, hasPurchased, isPermanent]);

  const reset = useCallback(() => {
    setTxStatus('idle');
    resetWrite();
  }, [resetWrite]);

  // Calculate new expiration date after renewal
  const calculateNewExpiration = () => {
    const baseTime = isActive && expiresAt > 0 ? expiresAt : Math.floor(Date.now() / 1000);
    return baseTime + accessDuration;
  };

  return {
    extend,
    price,
    priceEth,
    accessDuration,
    isActive,
    hasPurchased,
    isPermanent,
    currentExpiration: expiresAt,
    newExpirationAfterRenewal: calculateNewExpiration(),
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
 * Hook to get user's all unlocked content IDs (includes expired)
 */
export function useUserUnlocksV3() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
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

/**
 * Hook to get user's active content IDs (excludes expired)
 */
export function useUserActiveContentV3() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: BASEPAYWALL_V3_ADDRESS,
    abi: BASEPAYWALL_V3_ABI,
    functionName: 'getUserActiveContent',
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
export function usePlatformWithdrawV3() {
  const { isOwner } = usePlatformOwnerV3();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { refetch } = usePlatformStatsV3();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const withdraw = useCallback(() => {
    if (!isOwner) return;
    writeContract({
      address: BASEPAYWALL_V3_ADDRESS,
      abi: BASEPAYWALL_V3_ABI,
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

// Re-export utilities
export { ACCESS_DURATIONS, formatDuration, formatTimeRemaining, formatPriceEth, parseEthToWei };
