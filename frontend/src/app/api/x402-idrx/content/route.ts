import { NextRequest, NextResponse } from 'next/server';
import { withX402IDRX } from '@/lib/x402/middlewareIDRX';
import { BASEPAYWALL_ADDRESS } from '@/config/contract';
import { getIDRXAddress, DEFAULT_PRICE_IDRX, formatIDRX } from '@/config/idrx';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia';

const PROTECTED_CONTENT_IDRX = `
🇮🇩 Selamat datang di Zona Premium IDRX!

Konten ini dibuka menggunakan IDRX - stablecoin berbasis Rupiah!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 TENTANG PEMBAYARAN IDRX:
- IDRX adalah stablecoin yang didukung oleh Rupiah Indonesia
- Transparan dan stabil - 1 IDRX = 1 IDR
- Pembayaran tercatat di blockchain Base

📚 KONTEN EKSKLUSIF:
- Akses penuh ke tutorial premium
- Sumber daya yang dapat diunduh
- Dokumentasi API lengkap
- Akses awal ke fitur baru

🔐 AKSES ANDA:
- Pembayaran telah diverifikasi on-chain
- Konten ini sekarang dibuka secara permanen
- Transaksi tercatat di Base L2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 IDRX x BasePaywall x x402 Protocol
Monetisasi konten terdesentralisasi dengan stablecoin Rupiah!

🌐 Pelajari lebih lanjut: https://docs.idrx.co
`;

// x402 protected endpoint with IDRX
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    content: PROTECTED_CONTENT_IDRX,
    unlockedAt: new Date().toISOString(),
    paymentMethod: 'IDRX',
    price: formatIDRX(DEFAULT_PRICE_IDRX),
  });
}

// Wrap with x402 IDRX middleware
export const GET = withX402IDRX(
  {
    payTo: BASEPAYWALL_ADDRESS || '0x0000000000000000000000000000000000000000',
    amount: DEFAULT_PRICE_IDRX.toString(),
    tokenAddress: getIDRXAddress(network),
    network,
    resource: '/api/x402-idrx/content',
    description: 'Premium content access via BasePaywall - Pay with IDRX (Indonesian Rupiah Stablecoin)',
  },
  handler
);
