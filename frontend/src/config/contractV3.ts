/**
 * BasePaywall V3 Contract Configuration
 * Time-Limited Access on Base L2
 */

// Contract ABI for BasePaywallV3
export const BASEPAYWALL_V3_ABI = [
  // Constructor
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'uint256', name: '_platformFeeBps', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  
  // Errors
  { inputs: [], name: 'AlreadyRegistered', type: 'error' },
  { inputs: [], name: 'AlreadyHasAccess', type: 'error' },
  { inputs: [], name: 'ContentDisabled', type: 'error' },
  { inputs: [], name: 'ContentNotFound', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'required', type: 'uint256' },
      { internalType: 'uint256', name: 'provided', type: 'uint256' },
    ],
    name: 'InsufficientPayment',
    type: 'error',
  },
  { inputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }], name: 'InvalidFee', type: 'error' },
  { inputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }], name: 'InvalidPrice', type: 'error' },
  { inputs: [{ internalType: 'uint256', name: 'duration', type: 'uint256' }], name: 'InvalidDuration', type: 'error' },
  { inputs: [], name: 'NotRegistered', type: 'error' },
  { inputs: [], name: 'NothingToWithdraw', type: 'error' },
  { inputs: [], name: 'NoAccessToExtend', type: 'error' },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'OwnableInvalidOwner', type: 'error' },
  { inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'OwnableUnauthorizedAccount', type: 'error' },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  { inputs: [], name: 'WithdrawalFailed', type: 'error' },
  { inputs: [], name: 'EnforcedPause', type: 'error' },
  { inputs: [], name: 'ExpectedPause', type: 'error' },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'CreatorRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'price', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'accessDuration', type: 'uint256' },
    ],
    name: 'ContentCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'price', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'accessDuration', type: 'uint256' },
    ],
    name: 'ContentUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'expiresAt', type: 'uint256' },
    ],
    name: 'ContentUnlocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newExpiresAt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'AccessExtended',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'CreatorWithdrawal',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PlatformWithdrawal',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldFee', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newFee', type: 'uint256' },
    ],
    name: 'PlatformFeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' }, { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event',
  },

  // Constants
  { inputs: [], name: 'BPS_DENOMINATOR', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_PLATFORM_FEE_BPS', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MIN_CONTENT_PRICE', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_CONTENT_PRICE', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'PERMANENT_ACCESS', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MIN_ACCESS_DURATION', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_ACCESS_DURATION', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },

  // State Variables
  { inputs: [], name: 'nextContentId', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'platformBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'platformFeeBps', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalCreators', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalRevenue', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'paused', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },

  // Creator Functions
  { inputs: [], name: 'registerCreator', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'uint256', name: 'accessDuration', type: 'uint256' },
    ],
    name: 'createContent',
    outputs: [{ internalType: 'uint256', name: 'contentId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
    name: 'createContent',
    outputs: [{ internalType: 'uint256', name: 'contentId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'bool', name: 'enabled', type: 'bool' },
      { internalType: 'uint256', name: 'accessDuration', type: 'uint256' },
    ],
    name: 'updateContent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'bool', name: 'enabled', type: 'bool' },
    ],
    name: 'updateContent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'withdrawCreatorBalance', outputs: [], stateMutability: 'nonpayable', type: 'function' },

  // User Functions
  {
    inputs: [{ internalType: 'uint256', name: 'contentId', type: 'uint256' }],
    name: 'unlock',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'contentId', type: 'uint256' }],
    name: 'extendAccess',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // View Functions
  {
    inputs: [
      { internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'checkAccess',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'contentId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getAccessDetails',
    outputs: [
      { internalType: 'bool', name: 'hasAccess', type: 'bool' },
      { internalType: 'uint256', name: 'expiresAt', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
      { internalType: 'uint256', name: 'timeRemaining', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserUnlocks',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserActiveContent',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'creator', type: 'address' }],
    name: 'getCreatorContents',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'creator', type: 'address' }],
    name: 'getCreator',
    outputs: [
      { internalType: 'bool', name: 'isRegistered', type: 'bool' },
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      { internalType: 'uint256', name: 'contentCount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRevenue', type: 'uint256' },
      { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'contentId', type: 'uint256' }],
    name: 'getContent',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'bool', name: 'enabled', type: 'bool' },
      { internalType: 'uint256', name: 'revenue', type: 'uint256' },
      { internalType: 'uint256', name: 'unlockCount', type: 'uint256' },
      { internalType: 'uint256', name: 'accessDuration', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPlatformStats',
    outputs: [
      { internalType: 'uint256', name: 'totalCreatorsCount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalContents', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRevenueAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'platformBalanceAmount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Platform Admin Functions
  {
    inputs: [{ internalType: 'uint256', name: 'newFeeBps', type: 'uint256' }],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'withdrawPlatformBalance', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

// Contract address (to be updated after deployment)
export const BASEPAYWALL_V3_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Access duration presets
export const ACCESS_DURATIONS = {
  PERMANENT: 0,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  THREE_MONTHS: 7776000,
  ONE_YEAR: 31536000,
} as const;

// Duration labels
export const DURATION_LABELS: Record<number, string> = {
  0: 'Permanent',
  3600: '1 Hour',
  86400: '1 Day',
  604800: '1 Week',
  2592000: '30 Days',
  7776000: '90 Days',
  31536000: '1 Year',
};

// Helper to format duration to human readable
export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Permanent';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days >= 365) return `${Math.floor(days / 365)} year${days >= 730 ? 's' : ''}`;
  if (days >= 30) return `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''}`;
  if (days >= 7) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

// Helper to format time remaining
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || 'Less than 1m';
}

// Helper to format price to ETH
export function formatPriceEth(priceWei: bigint): string {
  const eth = Number(priceWei) / 1e18;
  if (eth >= 1) return eth.toFixed(2);
  if (eth >= 0.01) return eth.toFixed(3);
  return eth.toFixed(4);
}

// Helper to parse ETH to Wei
export function parseEthToWei(ethAmount: string): bigint {
  const eth = parseFloat(ethAmount);
  return BigInt(Math.floor(eth * 1e18));
}
