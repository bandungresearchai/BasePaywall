import { NextResponse } from 'next/server';
import { BASEPAYWALL_ADDRESS, PRICE_WEI, PRICE_ETH } from '@/config/contract';

/**
 * GET /api/x402/info
 * Returns x402 payment configuration info
 */
export async function GET() {
  return NextResponse.json({
    protocol: 'x402',
    version: '1',
    description: 'BasePaywall x402 HTTP 402 Payment Required Protocol',
    endpoints: {
      content: '/api/x402/content',
      verify: '/api/x402/verify',
    },
    payment: {
      network: process.env.NEXT_PUBLIC_NETWORK || 'base-sepolia',
      payTo: BASEPAYWALL_ADDRESS,
      amount: PRICE_WEI.toString(),
      amountEth: PRICE_ETH,
      currency: 'ETH',
    },
    headers: {
      request: 'X-Payment (base64 encoded JSON payload)',
      response: [
        'X-Payment-Required: true',
        'X-Payment-Version: 1',
        'X-Payment-Network: base-sepolia',
        'X-Payment-PayTo: <address>',
        'X-Payment-Amount: <wei>',
        'X-Payment-Resource: <endpoint>',
      ],
    },
    documentation: 'https://github.com/bandungresearchai/BasePaywall',
  });
}
