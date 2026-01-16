/**
 * IDRX Token Configuration
 * IDRX is a transparent Rupiah-backed stablecoin designed for Indonesia
 * https://docs.idrx.co/api/getting-started
 */

// IDRX Token addresses per network
export const IDRX_ADDRESSES = {
  'base': '0x18Dd5B087bCA9920562aFf7A0199b96B9230438b' as `0x${string}`, // Base Mainnet
  'base-sepolia': '0x18Dd5B087bCA9920562aFf7A0199b96B9230438b' as `0x${string}`, // Base Sepolia (placeholder - update with actual testnet address)
} as const;

// IDRX Token decimals (IDRX uses 2 decimals like IDR)
export const IDRX_DECIMALS = 2;

// Get IDRX address for current network
export function getIDRXAddress(network: 'base' | 'base-sepolia' = 'base-sepolia'): `0x${string}` {
  return IDRX_ADDRESSES[network];
}

// IDRX ERC20 ABI (standard ERC20 functions)
export const IDRX_ABI = [
  // Read functions
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const;

// Default price in IDRX (15000 IDR = Rp 15.000)
export const DEFAULT_PRICE_IDRX = BigInt(1500000); // 15000.00 IDRX (with 2 decimals)
export const DEFAULT_PRICE_IDRX_DISPLAY = '15,000'; // Rp 15.000

// Format IDRX amount for display
export function formatIDRX(amount: bigint): string {
  const value = Number(amount) / (10 ** IDRX_DECIMALS);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Parse IDRX amount from display value (e.g., "15000" -> BigInt)
export function parseIDRX(amount: string): bigint {
  const value = parseFloat(amount.replace(/[^0-9.]/g, ''));
  return BigInt(Math.round(value * (10 ** IDRX_DECIMALS)));
}

// Convert IDR to IDRX smallest unit
export function idrToIDRX(idr: number): bigint {
  return BigInt(Math.round(idr * (10 ** IDRX_DECIMALS)));
}
