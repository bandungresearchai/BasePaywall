import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentDetails, X402PaymentPayload } from './types';
import { parseX402Payment, createX402Headers } from './utils';
import { createPublicClient, http } from 'viem';
import { baseSepolia, base } from 'viem/chains';

export interface X402MiddlewareConfig {
  /** Payment recipient address */
  payTo: `0x${string}`;
  /** Amount required in wei */
  amount: string;
  /** Network for payment */
  network: 'base' | 'base-sepolia';
  /** Resource identifier */
  resource: string;
  /** Description of the resource */
  description?: string;
  /** Function to verify payment on-chain */
  verifyPayment?: (payload: X402PaymentPayload, config: X402MiddlewareConfig) => Promise<boolean>;
}

/**
 * Default payment verification using on-chain check
 */
async function defaultVerifyPayment(
  payload: X402PaymentPayload, 
  config: X402MiddlewareConfig
): Promise<boolean> {
  try {
    const chain = payload.network === 'base' ? base : baseSepolia;
    const rpcUrl = payload.network === 'base' 
      ? 'https://mainnet.base.org' 
      : 'https://sepolia.base.org';
    
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
    
    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: payload.transactionHash,
    });
    
    // Verify transaction was successful
    if (receipt.status !== 'success') {
      return false;
    }
    
    // Get transaction details
    const tx = await client.getTransaction({
      hash: payload.transactionHash,
    });
    
    // Verify payment recipient
    if (tx.to?.toLowerCase() !== config.payTo.toLowerCase()) {
      return false;
    }
    
    // Verify payment amount
    if (tx.value < BigInt(config.amount)) {
      return false;
    }
    
    // Verify payer
    if (tx.from.toLowerCase() !== payload.payer.toLowerCase()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

/**
 * Create x402 middleware for Next.js API routes
 */
export function createX402Middleware(config: X402MiddlewareConfig) {
  const verifyPayment = config.verifyPayment || defaultVerifyPayment;
  
  return async function x402Middleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Check for payment header
    const payment = parseX402Payment(request);
    
    if (!payment) {
      // No payment provided, return 402 Payment Required
      const paymentDetails: X402PaymentDetails = {
        version: '1',
        network: config.network,
        payTo: config.payTo,
        maxAmountRequired: config.amount,
        resource: config.resource,
        description: config.description,
      };
      
      const headers = createX402Headers(paymentDetails);
      
      return new NextResponse(
        JSON.stringify({
          status: 402,
          message: 'Payment Required',
          paymentDetails,
        }),
        {
          status: 402,
          statusText: 'Payment Required',
          headers,
        }
      );
    }
    
    // Verify payment
    const isValid = await verifyPayment(payment, config);
    
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({
          status: 402,
          message: 'Payment verification failed',
        }),
        {
          status: 402,
          statusText: 'Payment Required',
        }
      );
    }
    
    // Payment verified, proceed with handler
    return handler();
  };
}

/**
 * Higher-order function to wrap API route with x402 middleware
 */
export function withX402(
  config: X402MiddlewareConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const middleware = createX402Middleware(config);
  
  return async function(request: NextRequest): Promise<NextResponse> {
    return middleware(request, () => handler(request));
  };
}
