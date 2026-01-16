import { X402PaymentDetails, X402PaymentPayload, X402_HEADER, X402_PAYMENT_HEADER, X402_VERSION, X402PaymentAsset } from './types';

/**
 * Create x402 payment required response headers
 */
export function createX402Headers(paymentDetails: X402PaymentDetails): Headers {
  const headers = new Headers();
  headers.set(X402_HEADER, 'true');
  headers.set('Content-Type', 'application/json');
  headers.set('X-Payment-Version', X402_VERSION);
  headers.set('X-Payment-Network', paymentDetails.network);
  headers.set('X-Payment-PayTo', paymentDetails.payTo);
  headers.set('X-Payment-Amount', paymentDetails.maxAmountRequired);
  headers.set('X-Payment-Resource', paymentDetails.resource);
  
  if (paymentDetails.description) {
    headers.set('X-Payment-Description', paymentDetails.description);
  }
  if (paymentDetails.expiry) {
    headers.set('X-Payment-Expiry', paymentDetails.expiry.toString());
  }
  // ERC20 token support
  if (paymentDetails.asset) {
    headers.set('X-Payment-Asset', paymentDetails.asset);
  }
  if (paymentDetails.tokenAddress) {
    headers.set('X-Payment-TokenAddress', paymentDetails.tokenAddress);
  }
  if (paymentDetails.tokenDecimals !== undefined) {
    headers.set('X-Payment-TokenDecimals', paymentDetails.tokenDecimals.toString());
  }
  if (paymentDetails.tokenSymbol) {
    headers.set('X-Payment-TokenSymbol', paymentDetails.tokenSymbol);
  }
  
  return headers;
}

/**
 * Parse x402 payment header from request
 */
export function parseX402Payment(request: Request): X402PaymentPayload | null {
  const paymentHeader = request.headers.get(X402_PAYMENT_HEADER);
  
  if (!paymentHeader) {
    return null;
  }
  
  try {
    // Payment header is base64 encoded JSON
    const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as X402PaymentPayload;
    
    // Validate required fields
    if (!payload.version || !payload.network || !payload.transactionHash || !payload.payer) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create x402 payment payload for request
 */
export function createX402PaymentHeader(payload: X402PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Parse x402 payment details from response headers
 */
export function parseX402Response(response: Response): X402PaymentDetails | null {
  const isPaymentRequired = response.headers.get(X402_HEADER) === 'true';
  
  if (!isPaymentRequired) {
    return null;
  }
  
  const payTo = response.headers.get('X-Payment-PayTo') as `0x${string}`;
  const amount = response.headers.get('X-Payment-Amount');
  const resource = response.headers.get('X-Payment-Resource');
  const network = response.headers.get('X-Payment-Network') as 'base' | 'base-sepolia';
  
  if (!payTo || !amount || !resource || !network) {
    return null;
  }
  
  // Parse token-related headers
  const asset = response.headers.get('X-Payment-Asset') as X402PaymentAsset | null;
  const tokenAddress = response.headers.get('X-Payment-TokenAddress') as `0x${string}` | null;
  const tokenDecimalsStr = response.headers.get('X-Payment-TokenDecimals');
  const tokenSymbol = response.headers.get('X-Payment-TokenSymbol');
  
  return {
    version: '1',
    network,
    payTo,
    maxAmountRequired: amount,
    resource,
    description: response.headers.get('X-Payment-Description') || undefined,
    expiry: response.headers.get('X-Payment-Expiry') 
      ? parseInt(response.headers.get('X-Payment-Expiry')!) 
      : undefined,
    asset: asset || undefined,
    tokenAddress: tokenAddress || undefined,
    tokenDecimals: tokenDecimalsStr ? parseInt(tokenDecimalsStr) : undefined,
    tokenSymbol: tokenSymbol || undefined,
  };
}

/**
 * Create 402 Payment Required response
 */
export function createPaymentRequiredResponse(paymentDetails: X402PaymentDetails): Response {
  const headers = createX402Headers(paymentDetails);
  
  return new Response(
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
