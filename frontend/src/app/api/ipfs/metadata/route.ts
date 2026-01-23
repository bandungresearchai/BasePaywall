/**
 * API Route: Upload JSON metadata to IPFS via Pinata
 * POST /api/ipfs/metadata
 * 
 * Required env vars:
 * - PINATA_JWT: Your Pinata JWT token
 */

import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

export async function POST(request: NextRequest) {
  try {
    const pinataJWT = process.env.PINATA_JWT;
    const metadata = await request.json();

    if (!pinataJWT) {
      // If Pinata is not configured, return a mock response for demo
      console.warn('PINATA_JWT not configured, using mock response');
      return NextResponse.json({
        success: true,
        cid: `demo-meta-${Date.now()}`,
        message: 'Demo mode: Metadata not actually uploaded to IPFS',
      });
    }

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid metadata' },
        { status: 400 }
      );
    }

    // Prepare request body for Pinata
    const pinataBody = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `BasePaywall-Product-${metadata.contentId || 'unknown'}`,
        keyvalues: {
          app: 'BasePaywall',
          type: 'product-metadata',
          contentId: metadata.contentId || '',
          creatorAddress: metadata.creatorAddress || '',
        },
      },
    };

    // Upload to Pinata
    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pinataBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata metadata upload error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to upload metadata to IPFS' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      cid: data.IpfsHash,
      size: data.PinSize,
      timestamp: data.Timestamp,
    });
  } catch (error) {
    console.error('Metadata upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
