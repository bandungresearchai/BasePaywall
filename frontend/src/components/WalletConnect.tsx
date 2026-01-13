'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useCallback } from 'react';
import { useNetwork } from '@/hooks/useNetwork';

// Wallet icons for the selection modal
const WalletIcons = {
  coinbaseWallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#0052FF"/>
      <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM9.5 10.5H14.5V13.5H9.5V10.5Z" fill="white"/>
    </svg>
  ),
  injected: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#F6851B"/>
      <path d="M18.527 4L12.613 8.54L13.795 5.89L18.527 4Z" fill="#E2761B"/>
      <path d="M5.462 4L11.321 8.587L10.205 5.89L5.462 4ZM16.365 15.352L14.674 17.97L18.154 18.932L19.162 15.414L16.365 15.352Z" fill="#E4761B"/>
      <path d="M4.849 15.414L5.846 18.932L9.326 17.97L7.636 15.352L4.849 15.414Z" fill="#E4761B"/>
      <path d="M9.134 10.896L8.173 12.353L11.621 12.509L11.494 8.802L9.134 10.896Z" fill="#E4761B"/>
      <path d="M14.855 10.896L12.463 8.755L12.379 12.509L15.816 12.353L14.855 10.896Z" fill="#E4761B"/>
      <path d="M9.326 17.97L11.398 16.947L9.618 15.437L9.326 17.97Z" fill="#E4761B"/>
      <path d="M12.591 16.947L14.674 17.97L14.371 15.437L12.591 16.947Z" fill="#E4761B"/>
    </svg>
  ),
  walletConnect: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#3B99FC"/>
      <path d="M7.545 9.255C10.004 6.915 13.996 6.915 16.455 9.255L16.758 9.545C16.88 9.661 16.88 9.851 16.758 9.967L15.712 10.969C15.651 11.027 15.554 11.027 15.493 10.969L15.068 10.561C13.372 8.935 10.628 8.935 8.932 10.561L8.474 11.001C8.413 11.059 8.316 11.059 8.255 11.001L7.209 9.999C7.087 9.883 7.087 9.693 7.209 9.577L7.545 9.255ZM18.539 11.245L19.476 12.142C19.598 12.258 19.598 12.448 19.476 12.564L14.936 16.909C14.814 17.025 14.62 17.025 14.499 16.909L11.302 13.825C11.271 13.796 11.223 13.796 11.192 13.825L7.995 16.909C7.873 17.025 7.679 17.025 7.558 16.909L4.524 12.564C4.402 12.448 4.402 12.258 4.524 12.142L5.461 11.245C5.583 11.129 5.777 11.129 5.898 11.245L9.095 14.329C9.126 14.358 9.174 14.358 9.205 14.329L12.402 11.245C12.524 11.129 12.718 11.129 12.839 11.245L16.036 14.329C16.067 14.358 16.115 14.358 16.146 14.329L19.343 11.245C19.464 11.129 19.658 11.129 19.78 11.245L18.539 11.245Z" fill="white"/>
    </svg>
  ),
};

// Get display name for connector
function getConnectorDisplayName(connectorId: string): string {
  const nameMap: Record<string, string> = {
    'coinbaseWalletSDK': 'Coinbase Wallet',
    'injected': 'Browser Wallet',
    'walletConnect': 'WalletConnect',
    'metaMaskSDK': 'MetaMask',
  };
  return nameMap[connectorId] || connectorId;
}

// Get icon for connector
function getConnectorIcon(connectorId: string) {
  if (connectorId.includes('coinbase')) return WalletIcons.coinbaseWallet;
  if (connectorId === 'walletConnect') return WalletIcons.walletConnect;
  return WalletIcons.injected;
}

/**
 * Wallet Selection Modal
 * Shows available wallet options when user clicks connect
 */
function WalletSelectionModal({ 
  onClose,
  onSelect 
}: { 
  onClose: () => void;
  onSelect: (connectorId: string) => void;
}) {
  const { connectors } = useConnect();
  
  // Filter and deduplicate connectors
  const availableConnectors = connectors.filter((connector, index, self) => 
    index === self.findIndex(c => c.id === connector.id)
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Wallet Options */}
        <div className="p-4 space-y-2">
          {availableConnectors.map((connector) => {
            const Icon = getConnectorIcon(connector.id);
            const displayName = getConnectorDisplayName(connector.id);
            
            return (
              <button
                key={connector.id}
                onClick={() => onSelect(connector.id)}
                className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-base-blue transition-all group"
              >
                <div className="flex-shrink-0">
                  <Icon />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-white font-medium group-hover:text-base-blue transition-colors">
                    {displayName}
                  </span>
                  {connector.id === 'coinbaseWalletSDK' && (
                    <span className="ml-2 text-xs bg-base-blue/20 text-base-blue px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <svg 
                  className="w-5 h-5 text-gray-500 group-hover:text-base-blue transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-gray-500 text-center">
            Only Base and Base Sepolia networks are supported
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Network Switcher Component
 * Shows current network with option to switch
 */
function NetworkSwitcher() {
  const { chain, isWrongNetwork, switchToDefault, isSwitching, supportedChains, switchToChain } = useNetwork();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchToDefault}
        disabled={isSwitching}
        className="flex items-center space-x-2 bg-red-500/20 border border-red-500/50 px-3 py-1.5 rounded-full text-sm text-red-400 hover:bg-red-500/30 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>{isSwitching ? 'Switching...' : 'Wrong Network'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full text-sm hover:bg-gray-800 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${chain?.id === 84532 ? 'bg-yellow-400' : 'bg-green-400'}`} />
        <span className="text-gray-300">{chain?.name || 'Select Network'}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-xl">
            {supportedChains.map((supportedChain) => (
              <button
                key={supportedChain.id}
                onClick={() => {
                  switchToChain(supportedChain.id);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center space-x-2 px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                  chain?.id === supportedChain.id ? 'bg-gray-800/50' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${supportedChain.id === 84532 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <span className="text-gray-300">{supportedChain.name}</span>
                {chain?.id === supportedChain.id && (
                  <svg className="w-4 h-4 text-base-blue ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Main WalletConnect Component
 * Uses OnchainKit for connected state, custom modal for wallet selection
 */
export function WalletConnect() {
  const { isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  useDisconnect(); // OnchainKit handles disconnect via WalletDropdownDisconnect
  const [showModal, setShowModal] = useState(false);

  const handleConnect = useCallback((connectorId: string) => {
    const selectedConnector = connectors.find(c => c.id === connectorId);
    if (selectedConnector) {
      connect({ connector: selectedConnector });
    }
    setShowModal(false);
  }, [connectors, connect]);

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          disabled={isPending}
          className="flex items-center space-x-2 bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 text-white font-medium px-4 py-2 rounded-xl transition-all"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
        
        {showModal && (
          <WalletSelectionModal 
            onClose={() => setShowModal(false)}
            onSelect={handleConnect}
          />
        )}
      </>
    );
  }

  // Connected - use OnchainKit components for identity
  return (
    <div className="flex items-center space-x-3">
      <NetworkSwitcher />
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <div className="px-4 py-2 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Connected via {getConnectorDisplayName(connector?.id || '')}
            </p>
          </div>
          <WalletDropdownLink
            icon="wallet"
            href="https://wallet.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coinbase Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

/**
 * Compact wallet button for use in cards/modals
 */
export function WalletButton({ className = '' }: { className?: string }) {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = useCallback((connectorId: string) => {
    const selectedConnector = connectors.find(c => c.id === connectorId);
    if (selectedConnector) {
      connect({ connector: selectedConnector });
    }
    setShowModal(false);
  }, [connectors, connect]);

  if (isConnected) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className={`bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-all ${className}`}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {showModal && (
        <WalletSelectionModal 
          onClose={() => setShowModal(false)}
          onSelect={handleConnect}
        />
      )}
    </>
  );
}
