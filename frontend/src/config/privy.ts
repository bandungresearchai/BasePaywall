import { PrivyClientConfig } from '@privy-io/react-auth';
import { baseSepolia, base } from 'wagmi/chains';

// Privy App ID from environment
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

// Privy configuration
export const privyConfig: PrivyClientConfig = {
  // Login methods - email, Google, Twitter, wallet
  loginMethods: ['email', 'google', 'twitter', 'wallet'],
  
  // Appearance customization
  appearance: {
    theme: 'dark',
    accentColor: '#F97316', // Orange accent to match BasePaywall branding
    logo: '/logo.svg', // Your app logo
    showWalletLoginFirst: false,
    walletChainType: 'ethereum-only',
  },

  // Supported chains
  defaultChain: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia,
  supportedChains: [base, baseSepolia],

  // Embedded wallet configuration
  embeddedWallets: {
    createOnLogin: 'users-without-wallets', // Auto-create for email/social login users
    requireUserPasswordOnCreate: false,
  },

  // Legal links (optional)
  legal: {
    termsAndConditionsUrl: 'https://basepaywall.xyz/terms',
    privacyPolicyUrl: 'https://basepaywall.xyz/privacy',
  },
};
