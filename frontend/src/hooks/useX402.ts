'use client';

import { useCallback, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X402PaymentDetails, createX402PaymentHeader, parseX402Response } from '@/lib/x402';

interface UseX402Options {
  /** Contract address for payments */
  payTo: `0x${string}`;
  /** On successful content unlock */
  onSuccess?: (content: string) => void;
  /** On error */
  onError?: (error: Error) => void;
}

interface X402State {
  status: 'idle' | 'checking' | 'payment-required' | 'paying' | 'confirming' | 'verifying' | 'success' | 'error';
  paymentDetails: X402PaymentDetails | null;
  content: string | null;
  error: string | null;
  transactionHash: `0x${string}` | null;
}

export function useX402(endpoint: string, options: UseX402Options) {
  const { address } = useAccount();
  const [state, setState] = useState<X402State>({
    status: 'idle',
    paymentDetails: null,
    content: null,
    error: null,
    transactionHash: null,
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: state.transactionHash || undefined,
  });

  /**
   * Fetch content with x402 protocol
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
          network: (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia',
          transactionHash: paymentProof.hash,
          payer: paymentProof.payer,
        });
        headers['X-Payment'] = paymentHeader;
      }

      const response = await fetch(endpoint, { headers });

      // Check for 402 Payment Required
      if (response.status === 402) {
        const paymentDetails = parseX402Response(response);
        
        if (paymentDetails) {
          setState(prev => ({
            ...prev,
            status: 'payment-required',
            paymentDetails,
          }));
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
  }, [endpoint, address, options]);

  /**
   * Execute payment for x402
   */
  const pay = useCallback(async () => {
    if (!state.paymentDetails || !address) {
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'paying' }));

      // Send ETH directly to payTo address
      const hash = await writeContractAsync({
        // For direct ETH transfer, we use a simple approach
        // In production, you might want to use the contract's pay() function
        address: state.paymentDetails.payTo,
        abi: [{
          type: 'function',
          name: 'pay',
          inputs: [],
          outputs: [],
          stateMutability: 'payable',
        }],
        functionName: 'pay',
        value: BigInt(state.paymentDetails.maxAmountRequired),
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.paymentDetails, address, writeContractAsync, fetchContent, options]);

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
    });
  }, []);

  return {
    ...state,
    isConfirming,
    fetchContent: () => fetchContent(),
    pay,
    reset,
  };
}
