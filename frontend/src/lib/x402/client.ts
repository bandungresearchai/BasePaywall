import { X402PaymentDetails, X402PaymentPayload, X402_PAYMENT_HEADER } from './types';
import { parseX402Response, createX402PaymentHeader } from './utils';

export interface X402ClientConfig {
  /** Function to execute payment and return transaction hash */
  paymentHandler: (details: X402PaymentDetails) => Promise<`0x${string}`>;
  /** Payer's address */
  payerAddress: `0x${string}`;
  /** Maximum retries after payment */
  maxRetries?: number;
}

/**
 * x402 Client for handling automatic payments
 */
export class X402Client {
  private config: X402ClientConfig;
  
  constructor(config: X402ClientConfig) {
    this.config = {
      maxRetries: 3,
      ...config,
    };
  }
  
  /**
   * Fetch with automatic x402 payment handling
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    // Initial request
    const response = await fetch(url, options);
    
    // Check if payment is required (402 status)
    if (response.status !== 402) {
      return response;
    }
    
    // Parse payment details from response
    const paymentDetails = parseX402Response(response);
    
    if (!paymentDetails) {
      throw new Error('Invalid x402 payment response');
    }
    
    // Execute payment
    const transactionHash = await this.config.paymentHandler(paymentDetails);
    
    // Create payment payload
    const payload: X402PaymentPayload = {
      version: '1',
      network: paymentDetails.network,
      transactionHash,
      payer: this.config.payerAddress,
    };
    
    // Retry request with payment proof
    const paymentHeader = createX402PaymentHeader(payload);
    
    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...options?.headers,
        [X402_PAYMENT_HEADER]: paymentHeader,
      },
    };
    
    // Retry with exponential backoff
    for (let i = 0; i < (this.config.maxRetries || 3); i++) {
      const retryResponse = await fetch(url, retryOptions);
      
      if (retryResponse.status !== 402) {
        return retryResponse;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
    
    throw new Error('Payment verification failed after retries');
  }
}

/**
 * Create x402 client with wagmi integration
 */
export function createX402Fetch(
  paymentHandler: (details: X402PaymentDetails) => Promise<`0x${string}`>,
  payerAddress: `0x${string}`
) {
  const client = new X402Client({
    paymentHandler,
    payerAddress,
  });
  
  return client.fetch.bind(client);
}
