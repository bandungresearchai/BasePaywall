'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BASEPAYWALL_ABI, BASEPAYWALL_ADDRESS, PRICE_WEI } from '@/config/contract';
import { useEffect, useState } from 'react';

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

export function usePaywallStatus() {
  const { address, isConnected } = useAccount();
  const { isOwner } = useContractOwner();

  const {
    data: hasPaid,
    isLoading: isCheckingStatus,
    refetch: refetchStatus,
  } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'checkHasPaid',
    args: address ? [address] : undefined,
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
  };
}

export function usePaywallPayment() {
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isPending) {
      setTxStatus('pending');
      setError(null);
    } else if (isConfirming) {
      setTxStatus('confirming');
    } else if (isSuccess) {
      setTxStatus('success');
    } else if (writeError) {
      setTxStatus('error');
      setError(writeError.message || 'Transaction failed');
    }
  }, [isPending, isConfirming, isSuccess, writeError]);

  const pay = () => {
    setError(null);
    writeContract({
      address: BASEPAYWALL_ADDRESS,
      abi: BASEPAYWALL_ABI,
      functionName: 'pay',
      value: PRICE_WEI,
    });
  };

  const reset = () => {
    setTxStatus('idle');
    setError(null);
  };

  return {
    pay,
    reset,
    txStatus,
    error,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function usePaywallContent() {
  const { address, isConnected } = useAccount();

  const {
    data: content,
    isLoading,
    error,
  } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'content',
    query: {
      enabled: !!address && isConnected,
    },
  });

  return {
    content: content as string | undefined,
    isLoading,
    error,
  };
}

export function usePaywallPrice() {
  const { data: price, isLoading } = useReadContract({
    address: BASEPAYWALL_ADDRESS,
    abi: BASEPAYWALL_ABI,
    functionName: 'getPrice',
  });

  return {
    price: price ?? PRICE_WEI,
    priceInEth: price ? Number(price) / 1e18 : 0.001,
    isLoading,
  };
}
