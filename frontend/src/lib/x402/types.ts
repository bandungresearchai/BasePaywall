/**
 * x402 Protocol Types
 * Implementation of Coinbase's x402 HTTP 402 Payment Required protocol
 * Extended with ERC20 token support for IDRX stablecoin integration
 */

/** Supported payment assets */
export type X402PaymentAsset = 'ETH' | 'IDRX' | 'USDC';

export interface X402PaymentDetails {
  /** Version of x402 protocol */
  version: '1';
  /** Network/chain for payment */
  network: 'base' | 'base-sepolia';
  /** Payment recipient address */
  payTo: `0x${string}`;
  /** Maximum amount willing to pay (in wei for ETH, smallest unit for tokens) */
  maxAmountRequired: string;
  /** Resource being paid for */
  resource: string;
  /** Optional: Description of the resource */
  description?: string;
  /** Optional: MIME type of the protected content */
  mimeType?: string;
  /** Optional: Expiration timestamp */
  expiry?: number;
  /** Optional: Payment asset type (default: ETH) */
  asset?: X402PaymentAsset;
  /** Optional: Token contract address for ERC20 payments */
  tokenAddress?: `0x${string}`;
  /** Optional: Token decimals for display */
  tokenDecimals?: number;
  /** Optional: Token symbol for display */
  tokenSymbol?: string;
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
  /** Optional: Payment asset type */
  asset?: X402PaymentAsset;
  /** Optional: Token address for ERC20 payments */
  tokenAddress?: `0x${string}`;
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
