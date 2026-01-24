'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useNetwork } from '@/hooks/useNetwork';

// Wallet icons
const WalletIcons = {
  coinbase: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0052FF"/>
      <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM9.5 10.5H14.5V13.5H9.5V10.5Z" fill="white"/>
    </svg>
  ),
  metamask: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#F6851B"/>
      <path d="M18.527 4L12.613 8.54L13.795 5.89L18.527 4Z" fill="#E2761B"/>
      <path d="M5.462 4L11.321 8.587L10.205 5.89L5.462 4Z" fill="#E4761B"/>
      <path d="M16.365 15.352L14.674 17.97L18.154 18.932L19.162 15.414L16.365 15.352Z" fill="#E4761B"/>
      <path d="M4.849 15.414L5.846 18.932L9.326 17.97L7.636 15.352L4.849 15.414Z" fill="#E4761B"/>
    </svg>
  ),
  walletconnect: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#3B99FC"/>
      <path d="M7.5 10C10.5 7 13.5 7 16.5 10L17 10.5C17.1 10.6 17.1 10.8 17 10.9L16 11.9C15.9 12 15.8 12 15.7 11.9L15.3 11.5C13.3 9.5 10.7 9.5 8.7 11.5L8.3 11.9C8.2 12 8.1 12 8 11.9L7 10.9C6.9 10.8 6.9 10.6 7 10.5L7.5 10Z" fill="white"/>
      <path d="M18.5 12L19.4 12.9C19.5 13 19.5 13.2 19.4 13.3L14.9 17.6C14.8 17.7 14.6 17.7 14.5 17.6L12.3 15.5C12.2 15.4 12.1 15.4 12 15.5L9.8 17.6C9.7 17.7 9.5 17.7 9.4 17.6L4.6 13.3C4.5 13.2 4.5 13 4.6 12.9L5.5 12C5.6 11.9 5.8 11.9 5.9 12L8.1 14.1C8.2 14.2 8.3 14.2 8.4 14.1L10.6 12C10.7 11.9 10.9 11.9 11 12L13.2 14.1C13.3 14.2 13.4 14.2 13.5 14.1L15.7 12C15.8 11.9 16 11.9 16.1 12L18.5 12Z" fill="white"/>
    </svg>
  ),
  google: () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  twitter: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  email: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-10 6-10-6"/>
    </svg>
  ),
  wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  ),
};

// App Logo
const AppLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 14v20l16 10 16-10V14L24 4z" fill="#F97316"/>
    <path d="M24 8l12 7.5v15L24 38 12 30.5v-15L24 8z" fill="#1a1a2e"/>
    <path d="M24 14l6 3.75v7.5L24 29l-6-3.75v-7.5L24 14z" fill="#F97316"/>
  </svg>
);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [showWallets, setShowWallets] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { connectors, connect, isPending } = useConnect();
  const { isConnected } = useAccount();

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when connected
  if (isConnected && isOpen) {
    onClose();
  }

  const handleConnect = useCallback(async (connectorId: string) => {
    setIsConnecting(true);
    const connector = connectors.find(c => c.id === connectorId || c.name.toLowerCase().includes(connectorId));
    if (connector) {
      connect({ connector });
    }
    setIsConnecting(false);
  }, [connectors, connect]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Email login would require backend - show message
    alert('Email login requires additional backend setup. Please use wallet connection for now.');
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} login requires additional backend setup. Please use wallet connection for now.`);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-[#1a1a2e] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-800"
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center px-8 pb-6">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <h2 className="text-xl font-semibold text-white">
            {showWallets ? 'Connect a wallet' : 'Log in or sign up'}
          </h2>
        </div>

        {!showWallets ? (
          /* Main login options */
          <div className="px-8 pb-8 space-y-3">
            {/* Email input */}
            <form onSubmit={handleEmailSubmit} className="relative">
              <div className="flex items-center bg-[#252540] rounded-xl border border-gray-700 focus-within:border-orange-500 transition-colors">
                <div className="pl-4 text-gray-400">
                  <WalletIcons.email />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent px-3 py-4 text-white placeholder-gray-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!email}
                  className="px-4 py-2 mr-2 text-sm font-medium text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Google */}
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <WalletIcons.google />
              <span className="text-white font-medium">Google</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={() => handleSocialLogin('Twitter')}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <WalletIcons.twitter />
              </div>
              <span className="text-white font-medium">Twitter</span>
            </button>

            {/* Continue with wallet */}
            <button
              onClick={() => setShowWallets(true)}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <div className="text-gray-400">
                <WalletIcons.wallet />
              </div>
              <span className="text-white font-medium">Continue with a wallet</span>
            </button>
          </div>
        ) : (
          /* Wallet selection */
          <div className="px-8 pb-8 space-y-3">
            {/* Back button */}
            <button
              onClick={() => setShowWallets(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            {/* Coinbase Wallet */}
            <button
              onClick={() => handleConnect('coinbaseWalletSDK')}
              disabled={isPending || isConnecting}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] disabled:opacity-50 rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <WalletIcons.coinbase />
              <span className="text-white font-medium">Coinbase Wallet</span>
              <span className="ml-auto text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Recommended</span>
            </button>

            {/* MetaMask / Browser Wallet */}
            <button
              onClick={() => handleConnect('injected')}
              disabled={isPending || isConnecting}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] disabled:opacity-50 rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <WalletIcons.metamask />
              <span className="text-white font-medium">MetaMask</span>
            </button>

            {/* WalletConnect */}
            <button
              onClick={() => handleConnect('walletConnect')}
              disabled={isPending || isConnecting}
              className="w-full flex items-center gap-4 bg-[#252540] hover:bg-[#2a2a4a] disabled:opacity-50 rounded-xl px-4 py-4 transition-colors border border-gray-700"
            >
              <WalletIcons.walletconnect />
              <span className="text-white font-medium">WalletConnect</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#151525] px-8 py-4 text-center">
          <span className="text-gray-500 text-sm">Secured by </span>
          <span className="text-orange-500 font-semibold text-sm">BasePaywall</span>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
}

/**
 * Connect Button with Privy-like Modal
 */
export function PrivyStyleWalletConnect() {
  const [showModal, setShowModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chainName, chainId } = useNetwork();
  const { baseSepolia } = require('wagmi/chains');
  
  const isTestnet = chainId === baseSepolia.id;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <>
        <button
          type="button"
          onClick={() => { console.log('Connect clicked'); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 cursor-pointer relative z-50"
        >
          Connect
        </button>
        <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl px-4 py-2 transition-all">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {address ? address.slice(2, 4).toUpperCase() : '??'}
        </div>
        
        {/* Address info */}
        <div className="text-left">
          <div className="text-white font-medium text-sm">
            {address ? formatAddress(address) : 'Connected'}
          </div>
          <div className="text-gray-400 text-xs flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`} />
            {chainName || 'Unknown'}
          </div>
        </div>

        {/* Dropdown arrow */}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {address && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="text-xs text-gray-400">Wallet</div>
            <div className="text-sm text-white font-mono">{formatAddress(address)}</div>
          </div>
        )}
        
        <button
          onClick={() => disconnect()}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors rounded-b-xl"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default PrivyStyleWalletConnect;
