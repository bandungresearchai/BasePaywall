/**
 * IPFS/Pinata Integration for BasePaywall
 * 
 * This module provides utilities for uploading and fetching files from IPFS
 * using Pinata as the pinning service.
 * 
 * Setup:
 * 1. Create account at https://pinata.cloud
 * 2. Get API key and secret from dashboard
 * 3. Set environment variables:
 *    - NEXT_PUBLIC_PINATA_GATEWAY (e.g., "your-gateway.mypinata.cloud")
 *    - PINATA_JWT (server-side only)
 */

export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
}

export interface ProductMetadata {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnailCID?: string;
  productFileCID?: string;
  productFileName?: string;
  creatorAddress: string;
  contentId: string;
  createdAt: string;
}

// Pinata Gateway URL - replace with your gateway or use public gateway
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

/**
 * Get IPFS URL from CID
 */
export function getIPFSUrl(cid: string): string {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * Upload file to IPFS via Pinata API route
 * This calls our Next.js API endpoint which handles the actual upload
 */
export async function uploadToIPFS(file: File, name?: string): Promise<IPFSUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Upload failed' };
    }

    const data = await response.json();
    return {
      success: true,
      cid: data.cid,
      url: getIPFSUrl(data.cid),
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadMetadataToIPFS(metadata: ProductMetadata): Promise<IPFSUploadResult> {
  try {
    const response = await fetch('/api/ipfs/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Metadata upload failed' };
    }

    const data = await response.json();
    return {
      success: true,
      cid: data.cid,
      url: getIPFSUrl(data.cid),
    };
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Metadata upload failed',
    };
  }
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchFromIPFS<T = ProductMetadata>(cid: string): Promise<T | null> {
  try {
    const url = getIPFSUrl(cid);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch from IPFS:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
}

/**
 * Store product metadata locally (fallback when IPFS is not configured)
 * This uses localStorage for demo purposes
 */
export function storeProductLocal(contentId: string, metadata: ProductMetadata): void {
  try {
    const products = JSON.parse(localStorage.getItem('basePaywallProducts') || '{}');
    products[contentId] = metadata;
    localStorage.setItem('basePaywallProducts', JSON.stringify(products));
  } catch (error) {
    console.error('Failed to store product locally:', error);
  }
}

/**
 * Get product metadata from local storage
 */
export function getProductLocal(contentId: string): ProductMetadata | null {
  try {
    const products = JSON.parse(localStorage.getItem('basePaywallProducts') || '{}');
    return products[contentId] || null;
  } catch (error) {
    console.error('Failed to get product locally:', error);
    return null;
  }
}

/**
 * Get all products from local storage
 */
export function getAllProductsLocal(): Record<string, ProductMetadata> {
  try {
    return JSON.parse(localStorage.getItem('basePaywallProducts') || '{}');
  } catch (error) {
    console.error('Failed to get products locally:', error);
    return {};
  }
}

/**
 * Check if IPFS is configured
 */
export function isIPFSConfigured(): boolean {
  // Check if we have the gateway configured
  return !!process.env.NEXT_PUBLIC_PINATA_GATEWAY;
}
