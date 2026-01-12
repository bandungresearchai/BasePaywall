import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402/middleware';
import { BASEPAYWALL_ADDRESS, PRICE_WEI } from '@/config/contract';

const PROTECTED_CONTENT = `
🎉 Welcome to the Premium Zone!

This content was unlocked via the x402 protocol - HTTP 402 "Payment Required"

Here's what you've unlocked:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 EXCLUSIVE CONTENT:
- Full access to premium tutorials
- Downloadable resources
- API documentation
- Early access to new features

🔐 YOUR ACCESS:
- Your payment has been verified on-chain
- This content is now permanently unlocked for your address
- Transaction recorded on Base L2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for supporting decentralized content monetization!
Built with BasePaywall - HTTP 402 on Base L2
`;

// x402 protected endpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    content: PROTECTED_CONTENT,
    unlockedAt: new Date().toISOString(),
  });
}

// Wrap with x402 middleware
export const GET = withX402(
  {
    payTo: BASEPAYWALL_ADDRESS || '0x0000000000000000000000000000000000000000',
    amount: PRICE_WEI.toString(),
    network: (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia',
    resource: '/api/x402/content',
    description: 'Premium content access via BasePaywall',
  },
  handler
);
