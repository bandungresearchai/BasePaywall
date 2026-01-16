'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { X402PaymentDetails, createX402PaymentHeader, parseX402Response } from '@/lib/x402';
import { IDRX_ABI, getIDRXAddress, formatIDRX } from '@/config/idrx';

interface UseX402IDRXOptions {
  /** Contract address for payments */
  payTo: `0x${string}`;
  /** On successful content unlock */
  onSuccess?: (content: string) => void;
  /** On error */
  onError?: (error: Error) => void;
}

interface X402IDRXState {
  status: 'idle' | 'checking' | 'payment-required' | 'approving' | 'paying' | 'confirming' | 'verifying' | 'success' | 'error';
  paymentDetails: X402PaymentDetails | null;
  content: string | null;
  error: string | null;
  transactionHash: `0x${string}` | null;
  idrxBalance: bigint | null;
  allowance: bigint | null;
  needsApproval: boolean;
}

export function useX402IDRX(endpoint: string, options: UseX402IDRXOptions) {
  const { address } = useAccount();
  const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia';
  const idrxAddress = getIDRXAddress(network);
  
  const [state, setState] = useState<X402IDRXState>({
    status: 'idle',
    paymentDetails: null,
    content: null,
    error: null,
    transactionHash: null,
    idrxBalance: null,
    allowance: null,
    needsApproval: false,
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: state.transactionHash || undefined,
  });

  // Read IDRX balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: idrxAddress,
    abi: IDRX_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read IDRX allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: idrxAddress,
    abi: IDRX_ABI,
    functionName: 'allowance',
    args: address && options.payTo ? [address, options.payTo] : undefined,
    query: {
      enabled: !!address && !!options.payTo,
    },
  });

  // Update state when balance/allowance changes
  useEffect(() => {
    if (balance !== undefined) {
      setState(prev => ({ ...prev, idrxBalance: balance as bigint }));
    }
  }, [balance]);

  useEffect(() => {
    if (allowance !== undefined && state.paymentDetails) {
      const requiredAmount = BigInt(state.paymentDetails.maxAmountRequired);
      const currentAllowance = allowance as bigint;
      const needsApproval = currentAllowance < requiredAmount;
      setState(prev => ({ 
        ...prev, 
        allowance: currentAllowance,
        needsApproval 
      }));
    }
  }, [allowance, state.paymentDetails]);

  /**
   * Fetch content with x402 protocol (IDRX payment)
   */
  const fetchContent = useCallback(async (paymentProof?: { hash: `0x${string}`; payer: `0x${string}` }) => {
    try {
      setState(prev => ({ ...prev, status: 'checking', error: null }));

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add payment proof if available
      if (paymentProof && address) {
        const paymentHeader = createX402PaymentHeader({
          version: '1',
          network,
          transactionHash: paymentProof.hash,
          payer: paymentProof.payer,
          asset: 'IDRX',
          tokenAddress: idrxAddress,
        });
        headers['X-Payment'] = paymentHeader;
      }

      const response = await fetch(endpoint, { headers });

      // Check for 402 Payment Required
      if (response.status === 402) {
        const paymentDetails = parseX402Response(response);
        
        if (paymentDetails) {
          // Check if we need approval
          const requiredAmount = BigInt(paymentDetails.maxAmountRequired);
          const currentAllowance = (allowance as bigint) || BigInt(0);
          const needsApproval = currentAllowance < requiredAmount;

          setState(prev => ({
            ...prev,
            status: 'payment-required',
            paymentDetails,
            needsApproval,
          }));
          
          // Refresh balance and allowance
          refetchBalance();
          refetchAllowance();
          return;
        }
      }

      // Success - content unlocked
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          status: 'success',
          content: data.content,
        }));
        options.onSuccess?.(data.content);
        return;
      }

      throw new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [endpoint, address, network, idrxAddress, allowance, options, refetchBalance, refetchAllowance]);

  /**
   * Approve IDRX spending
   */
  const approve = useCallback(async () => {
    if (!state.paymentDetails || !address) {
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'approving' }));

      const hash = await writeContractAsync({
        address: idrxAddress,
        abi: IDRX_ABI,
        functionName: 'approve',
        args: [options.payTo, BigInt(state.paymentDetails.maxAmountRequired)],
      });

      // Wait for approval confirmation
      setState(prev => ({
        ...prev,
        status: 'confirming',
        transactionHash: hash,
      }));

      // Wait a bit for the transaction to be indexed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh allowance
      await refetchAllowance();
      
      setState(prev => ({ 
        ...prev, 
        status: 'payment-required',
        needsApproval: false,
        transactionHash: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Approval failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.paymentDetails, address, writeContractAsync, idrxAddress, options, refetchAllowance]);

  /**
   * Execute IDRX payment for x402
   */
  const pay = useCallback(async () => {
    if (!state.paymentDetails || !address) {
      return;
    }

    // Check if approval is needed first
    if (state.needsApproval) {
      await approve();
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'paying' }));

      // Transfer IDRX to payTo address
      const hash = await writeContractAsync({
        address: idrxAddress,
        abi: IDRX_ABI,
        functionName: 'transfer',
        args: [state.paymentDetails.payTo, BigInt(state.paymentDetails.maxAmountRequired)],
      });

      setState(prev => ({
        ...prev,
        status: 'confirming',
        transactionHash: hash,
      }));

      // Wait for confirmation then retry with proof
      setState(prev => ({ ...prev, status: 'verifying' }));
      
      // Small delay to ensure transaction is indexed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Retry request with payment proof
      await fetchContent({ hash, payer: address });

      // Refresh balance
      refetchBalance();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.paymentDetails, state.needsApproval, address, writeContractAsync, idrxAddress, fetchContent, approve, options, refetchBalance]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      paymentDetails: null,
      content: null,
      error: null,
      transactionHash: null,
      idrxBalance: state.idrxBalance,
      allowance: state.allowance,
      needsApproval: false,
    });
  }, [state.idrxBalance, state.allowance]);

  return {
    ...state,
    isConfirming,
    idrxAddress,
    formattedBalance: state.idrxBalance ? formatIDRX(state.idrxBalance) : 'Rp 0',
    fetchContent: () => fetchContent(),
    approve,
    pay,
    reset,
  };
}
