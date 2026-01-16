import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentDetails, X402PaymentPayload } from './types';
import { parseX402Payment, createX402Headers } from './utils';
import { createPublicClient, http } from 'viem';
import { baseSepolia, base } from 'viem/chains';

export interface X402IDRXMiddlewareConfig {
  /** Payment recipient address */
  payTo: `0x${string}`;
  /** Amount required in IDRX (smallest unit with 2 decimals) */
  amount: string;
  /** IDRX token address */
  tokenAddress: `0x${string}`;
  /** Network for payment */
  network: 'base' | 'base-sepolia';
  /** Resource identifier */
  resource: string;
  /** Description of the resource */
  description?: string;
  /** Function to verify payment on-chain */
  verifyPayment?: (payload: X402PaymentPayload, config: X402IDRXMiddlewareConfig) => Promise<boolean>;
}

/**
 * Default IDRX payment verification using on-chain check
 */
async function defaultVerifyIDRXPayment(
  payload: X402PaymentPayload, 
  config: X402IDRXMiddlewareConfig
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
      console.log('Transaction not successful');
      return false;
    }
    
    // Look for Transfer event in the logs
    const transferLogs = receipt.logs.filter(log => {
      // Check if this is the IDRX token contract
      if (log.address.toLowerCase() !== config.tokenAddress.toLowerCase()) {
        return false;
      }
      
      // Check if this is a Transfer event (topic0 matches)
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      return log.topics[0] === transferTopic;
    });

    // Find transfer to our payTo address
    const validTransfer = transferLogs.find(log => {
      // Topic1 is 'from' address (padded to 32 bytes)
      // Topic2 is 'to' address (padded to 32 bytes)
      const fromAddress = '0x' + log.topics[1]?.slice(-40);
      const toAddress = '0x' + log.topics[2]?.slice(-40);
      const amount = BigInt(log.data);

      return (
        fromAddress.toLowerCase() === payload.payer.toLowerCase() &&
        toAddress.toLowerCase() === config.payTo.toLowerCase() &&
        amount >= BigInt(config.amount)
      );
    });

    if (!validTransfer) {
      console.log('No valid IDRX transfer found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('IDRX payment verification error:', error);
    return false;
  }
}

/**
 * Create x402 middleware for IDRX payments
 */
export function createX402IDRXMiddleware(config: X402IDRXMiddlewareConfig) {
  const verifyPayment = config.verifyPayment || defaultVerifyIDRXPayment;
  
  return async function x402IDRXMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Check for payment header
    const payment = parseX402Payment(request);
    
    if (!payment) {
      // No payment provided, return 402 Payment Required with IDRX details
      const paymentDetails: X402PaymentDetails = {
        version: '1',
        network: config.network,
        payTo: config.payTo,
        maxAmountRequired: config.amount,
        resource: config.resource,
        description: config.description,
        asset: 'IDRX',
        tokenAddress: config.tokenAddress,
        tokenDecimals: 2,
        tokenSymbol: 'IDRX',
      };
      
      const headers = createX402Headers(paymentDetails);
      
      return new NextResponse(
        JSON.stringify({
          status: 402,
          message: 'Payment Required (IDRX)',
          paymentDetails,
        }),
        {
          status: 402,
          statusText: 'Payment Required',
          headers,
        }
      );
    }
    
    // Verify IDRX payment
    const isValid = await verifyPayment(payment, config);
    
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({
          status: 402,
          message: 'IDRX payment verification failed',
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
 * Higher-order function to wrap API route with x402 IDRX middleware
 */
export function withX402IDRX(
  config: X402IDRXMiddlewareConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const middleware = createX402IDRXMiddleware(config);
  
  return async function(request: NextRequest): Promise<NextResponse> {
    return middleware(request, () => handler(request));
  };
}
