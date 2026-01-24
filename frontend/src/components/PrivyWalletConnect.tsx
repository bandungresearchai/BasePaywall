'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useNetwork } from '@/hooks/useNetwork';
import { baseSepolia } from 'wagmi/chains';

/**
 * Privy Wallet Connect Button
 * Shows Privy login modal with email, Google, Twitter, and wallet options
 */
export function PrivyWalletConnect() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chainName, chainId } = useNetwork();

  // Check if on testnet
  const isTestnet = chainId === baseSepolia.id;
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.email?.address) {
      return user.email.address;
    }
    if (user?.google?.email) {
      return user.google.email;
    }
    if (user?.twitter?.username) {
      return `@${user.twitter.username}`;
    }
    if (address) {
      return formatAddress(address);
    }
    return 'User';
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    disconnect();
  };

  // Not ready yet
  if (!ready) {
    return (
      <button
        disabled
        className="bg-gray-700 text-gray-400 px-4 py-2 rounded-xl font-medium cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  // Not authenticated - show login button
  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="bg-base-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
      >
        Connect
      </button>
    );
  }

  // Authenticated - show user info with dropdown
  return (
    <div className="relative group">
      <button className="flex items-center gap-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl px-4 py-2 transition-all">
        {/* User avatar or icon */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-base-blue to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {getUserDisplayName().charAt(0).toUpperCase()}
        </div>
        
        {/* User info */}
        <div className="text-left">
          <div className="text-white font-medium text-sm">
            {getUserDisplayName()}
          </div>
          {isConnected && address && (
            <div className="text-gray-400 text-xs flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`} />
              {chainName}
            </div>
          )}
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
        
        {user?.email?.address && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="text-xs text-gray-400">Email</div>
            <div className="text-sm text-white">{user.email.address}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors rounded-b-xl"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default PrivyWalletConnect;
