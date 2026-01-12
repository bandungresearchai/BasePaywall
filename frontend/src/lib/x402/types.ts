/**
 * x402 Protocol Types
 * Implementation of Coinbase's x402 HTTP 402 Payment Required protocol
 */

export interface X402PaymentDetails {
  /** Version of x402 protocol */
  version: '1';
  /** Network/chain for payment */
  network: 'base' | 'base-sepolia';
  /** Payment recipient address */
  payTo: `0x${string}`;
  /** Maximum amount willing to pay (in wei) */
  maxAmountRequired: string;
  /** Resource being paid for */
  resource: string;
  /** Optional: Description of the resource */
  description?: string;
  /** Optional: MIME type of the protected content */
  mimeType?: string;
  /** Optional: Expiration timestamp */
  expiry?: number;
}

export interface X402PaymentPayload {
  /** Version of x402 protocol */
  version: '1';
  /** Network used for payment */
  network: 'base' | 'base-sepolia';
  /** Transaction hash as proof of payment */
  transactionHash: `0x${string}`;
  /** Payer's address */
  payer: `0x${string}`;
}

export interface X402Response {
  /** Whether payment is required */
  paymentRequired: boolean;
  /** Payment details if required */
  paymentDetails?: X402PaymentDetails;
  /** Content if payment verified */
  content?: string;
  /** Error message if any */
  error?: string;
}

export const X402_HEADER = 'X-Payment-Required';
export const X402_PAYMENT_HEADER = 'X-Payment';
export const X402_VERSION = '1';
