/**
 * API Route: Upload file to IPFS via Pinata
 * POST /api/ipfs/upload
 * 
 * Required env vars:
 * - PINATA_JWT: Your Pinata JWT token
 */

import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function POST(request: NextRequest) {
  try {
    const pinataJWT = process.env.PINATA_JWT;

    if (!pinataJWT) {
      // If Pinata is not configured, return a mock response for demo
      console.warn('PINATA_JWT not configured, using mock response');
      return NextResponse.json({
        success: true,
        cid: `demo-${Date.now()}`,
        message: 'Demo mode: File not actually uploaded to IPFS',
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Prepare form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: name || file.name,
      keyvalues: {
        app: 'BasePaywall',
        uploadedAt: new Date().toISOString(),
      },
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Upload to Pinata
    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata upload error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to upload to IPFS' },
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
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
