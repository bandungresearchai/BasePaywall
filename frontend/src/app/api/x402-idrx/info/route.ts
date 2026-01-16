import { NextResponse } from 'next/server';
import { BASEPAYWALL_ADDRESS } from '@/config/contract';
import { getIDRXAddress, DEFAULT_PRICE_IDRX, formatIDRX, IDRX_DECIMALS } from '@/config/idrx';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia';

/**
 * GET /api/x402-idrx/info
 * Returns x402 IDRX payment configuration info
 */
export async function GET() {
  const idrxAddress = getIDRXAddress(network);
  
  return NextResponse.json({
    protocol: 'x402',
    version: '1',
    asset: {
      type: 'ERC20',
      symbol: 'IDRX',
      name: 'Indonesian Rupiah Stablecoin',
      decimals: IDRX_DECIMALS,
      address: idrxAddress,
      description: 'IDRX is a transparent Rupiah-backed stablecoin designed for Indonesia',
      documentation: 'https://docs.idrx.co/api/getting-started',
    },
    payment: {
      network,
      payTo: BASEPAYWALL_ADDRESS,
      amount: DEFAULT_PRICE_IDRX.toString(),
      amountFormatted: formatIDRX(DEFAULT_PRICE_IDRX),
      resource: '/api/x402-idrx/content',
    },
    endpoints: {
      content: '/api/x402-idrx/content',
      info: '/api/x402-idrx/info',
    },
    headers: {
      request: [
        'X-Payment: <base64-encoded-payment-payload>',
      ],
      response: [
        'X-Payment-Required: true',
        'X-Payment-Version: 1',
        'X-Payment-Network: <network>',
        'X-Payment-PayTo: <address>',
        'X-Payment-Amount: <amount>',
        'X-Payment-Asset: IDRX',
        'X-Payment-TokenAddress: <token-address>',
        'X-Payment-Resource: <endpoint>',
      ],
    },
    links: {
      documentation: 'https://github.com/bandungresearchai/BasePaywall',
      idrx: 'https://docs.idrx.co',
      basescan: network === 'base' 
        ? `https://basescan.org/token/${idrxAddress}`
        : `https://sepolia.basescan.org/token/${idrxAddress}`,
    },
  });
}
