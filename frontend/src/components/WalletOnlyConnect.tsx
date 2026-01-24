'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useNetwork } from '@/hooks/useNetwork';
import { baseSepolia } from 'wagmi/chains';

/* ═══════════════════════════════════════════════════════════════════════════
   WALLET ICONS - Modern, smartphone-friendly
═══════════════════════════════════════════════════════════════════════════ */

const WalletIcons = {
  coinbase: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0052FF"/>
      <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM9.5 10.5H14.5V13.5H9.5V10.5Z" fill="white"/>
    </svg>
  ),
  metamask: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#F6851B"/>
      <path d="M18.527 4L12.613 8.54L13.795 5.89L18.527 4Z" fill="#E2761B"/>
      <path d="M5.462 4L11.321 8.587L10.205 5.89L5.462 4Z" fill="#E4761B"/>
      <path d="M16.365 15.352L14.674 17.97L18.154 18.932L19.162 15.414L16.365 15.352Z" fill="#E4761B"/>
      <path d="M4.849 15.414L5.846 18.932L9.326 17.97L7.636 15.352L4.849 15.414Z" fill="#E4761B"/>
    </svg>
  ),
  walletconnect: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#3B99FC"/>
      <path d="M7.5 10C10.5 7 13.5 7 16.5 10L17 10.5C17.1 10.6 17.1 10.8 17 10.9L16 11.9C15.9 12 15.8 12 15.7 11.9L15.3 11.5C13.3 9.5 10.7 9.5 8.7 11.5L8.3 11.9C8.2 12 8.1 12 8 11.9L7 10.9C6.9 10.8 6.9 10.6 7 10.5L7.5 10Z" fill="white"/>
      <path d="M18.5 12L19.4 12.9C19.5 13 19.5 13.2 19.4 13.3L14.9 17.6C14.8 17.7 14.6 17.7 14.5 17.6L12.3 15.5C12.2 15.4 12.1 15.4 12 15.5L9.8 17.6C9.7 17.7 9.5 17.7 9.4 17.6L4.6 13.3C4.5 13.2 4.5 13 4.6 12.9L5.5 12C5.6 11.9 5.8 11.9 5.9 12L8.1 14.1C8.2 14.2 8.3 14.2 8.4 14.1L10.6 12C10.7 11.9 10.9 11.9 11 12L13.2 14.1C13.3 14.2 13.4 14.2 13.5 14.1L15.7 12C15.8 11.9 16 11.9 16.1 12L18.5 12Z" fill="white"/>
    </svg>
  ),
};

// App Logo
const AppLogo = () => (
  <svg width="56" height="56" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
      fill="#0052FF"
    />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   WALLET MODAL - Clean wallet-only interface
═══════════════════════════════════════════════════════════════════════════ */

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { connectors, connect, isPending } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when connected
  useEffect(() => {
    if (isConnected && isOpen) {
      onClose();
    }
  }, [isConnected, isOpen, onClose]);

  const handleConnect = useCallback(async (connectorId: string) => {
    setIsConnecting(connectorId);
    const connector = connectors.find(c => 
      c.id === connectorId || 
      c.id.toLowerCase().includes(connectorId.toLowerCase())
    );
    if (connector) {
      try {
        connect({ connector });
      } catch (err) {
        console.error('Connection failed:', err);
      }
    }
    // Note: isConnecting will be reset when modal closes on success
  }, [connectors, connect]);

  if (!isOpen || !mounted) return null;

  const walletOptions = [
    {
      id: 'coinbaseWalletSDK',
      name: 'Coinbase Wallet',
      description: 'Best for mobile & desktop',
      icon: WalletIcons.coinbase,
      recommended: true,
    },
    {
      id: 'injected',
      name: 'MetaMask',
      description: 'Browser extension',
      icon: WalletIcons.metamask,
      recommended: false,
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      description: 'Scan with any wallet app',
      icon: WalletIcons.walletconnect,
      recommended: false,
      mobileFirst: true,
    },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f0f1a] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20">
              <AppLogo />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400 text-sm">
            Choose a wallet to get started with BasePaywall
          </p>
        </div>

        {/* Wallet Options */}
        <div className="px-6 pb-6 space-y-3">
          {walletOptions.map((wallet) => {
            const isLoading = isConnecting === wallet.id || (isPending && isConnecting === wallet.id);
            const Icon = wallet.icon;
            
            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isPending}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
                  ${wallet.recommended 
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/30 hover:border-blue-500/50' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98]
                `}
              >
                <div className="flex-shrink-0">
                  <Icon />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{wallet.name}</span>
                    {wallet.recommended && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300">
                        Recommended
                      </span>
                    )}
                    {wallet.mobileFirst && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                        📱 Mobile
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{wallet.description}</span>
                </div>
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-white text-sm font-medium mb-1">New to crypto wallets?</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Download <a href="https://www.coinbase.com/wallet" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Coinbase Wallet</a> on 
                  your phone for the easiest experience. Or use WalletConnect to scan a QR code with any wallet app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4 text-center">
          <p className="text-gray-500 text-xs">
            Powered by <span className="text-blue-400 font-medium">Base Network</span> • Low fees & fast transactions
          </p>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONNECT BUTTON - Wallet-only authentication
═══════════════════════════════════════════════════════════════════════════ */

export function WalletOnlyConnect() {
  const [showModal, setShowModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chainName, chainId } = useNetwork();
  
  const isTestnet = chainId === baseSepolia.id;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer active:scale-[0.98]"
        >
          Connect Wallet
        </button>
        <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all">
        {/* Wallet Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10">
          {address ? address.slice(2, 4).toUpperCase() : '??'}
        </div>
        
        {/* Address & Network */}
        <div className="text-left hidden sm:block">
          <div className="text-white font-medium text-sm font-mono">
            {address ? formatAddress(address) : 'Connected'}
          </div>
          <div className="text-gray-400 text-xs flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isTestnet ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {chainName || 'Base'}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        {/* Wallet Info */}
        <div className="p-4 border-b border-white/5">
          <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
          <div className="text-white font-mono text-sm">{address ? formatAddress(address) : ''}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${isTestnet ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-xs text-gray-400">{chainName}</span>
          </div>
        </div>

        {/* Copy Address */}
        <button
          onClick={() => {
            if (address) {
              navigator.clipboard.writeText(address);
            }
          }}
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Address
        </button>

        {/* View on Explorer */}
        <a
          href={`https://${isTestnet ? 'sepolia.' : ''}basescan.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on Explorer
        </a>

        {/* Disconnect */}
        <button
          onClick={() => disconnect()}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default WalletOnlyConnect;
