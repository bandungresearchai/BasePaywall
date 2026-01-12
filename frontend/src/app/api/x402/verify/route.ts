import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { BASEPAYWALL_ADDRESS, PRICE_WEI } from '@/config/contract';

/**
 * POST /api/x402/verify
 * Verify a payment transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionHash, payer, network = 'base-sepolia' } = body;

    if (!transactionHash || !payer) {
      return NextResponse.json(
        { error: 'Missing transactionHash or payer' },
        { status: 400 }
      );
    }

    const chain = network === 'base' ? base : baseSepolia;
    const rpcUrl = network === 'base' 
      ? process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
      : process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

    const client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    });

    if (receipt.status !== 'success') {
      return NextResponse.json({
        verified: false,
        error: 'Transaction failed',
      });
    }

    // Get transaction details
    const tx = await client.getTransaction({
      hash: transactionHash as `0x${string}`,
    });

    // Verify payment details
    const isValidRecipient = tx.to?.toLowerCase() === BASEPAYWALL_ADDRESS?.toLowerCase();
    const isValidAmount = tx.value >= PRICE_WEI;
    const isValidPayer = tx.from.toLowerCase() === payer.toLowerCase();

    const verified = isValidRecipient && isValidAmount && isValidPayer;

    return NextResponse.json({
      verified,
      details: {
        transactionHash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        blockNumber: receipt.blockNumber.toString(),
        status: receipt.status,
        checks: {
          validRecipient: isValidRecipient,
          validAmount: isValidAmount,
          validPayer: isValidPayer,
        },
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        verified: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      },
      { status: 500 }
    );
  }
}
