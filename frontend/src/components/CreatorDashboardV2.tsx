'use client';

import { useState } from 'react';
import {
  useCreator,
  useCreatorContents,
  useContent,
  useRegisterCreator,
  useCreateContent,
  useUpdateContent,
  useCreatorWithdraw,
  usePlatformFee,
} from '@/hooks/usePaywallV2';
import { useExplorer } from '@/hooks/useNetwork';
import { useAccount } from 'wagmi';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ============ Content Stats Card ============

function ContentStatsCard({ contentId }: { contentId: bigint }) {
  const { priceEth, revenueEth, unlockCount, enabled, creator, isLoading } = useContent(contentId);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-6 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (!creator || creator === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-500 text-center">Content not found</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border ${enabled ? 'border-gray-700' : 'border-red-500/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">Content #{contentId.toString()}</span>
        <span className={`px-2 py-0.5 rounded text-xs ${enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {enabled ? 'Active' : 'Disabled'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-gray-500 text-xs">Price</p>
          <p className="text-white font-medium">{priceEth} ETH</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Revenue</p>
          <p className="text-green-400 font-medium">{revenueEth} ETH</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Unlocks</p>
          <p className="text-base-blue font-medium">{unlockCount}</p>
        </div>
      </div>
    </div>
  );
}

// ============ Registration Section ============

function RegistrationSection() {
  const { isRegistered, isLoading: isLoadingCreator } = useCreator();
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterCreator();

  if (isLoadingCreator) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (isRegistered) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
      <h4 className="text-lg font-semibold text-white mb-2">Become a Creator</h4>
      <p className="text-gray-400 text-sm mb-4">
        Register to start creating paywalled content. One-time registration, no fees.
      </p>
      <button
        onClick={register}
        disabled={isPending || isConfirming}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Registering...'}</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Register as Creator</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
      {isSuccess && (
        <p className="text-green-400 text-sm mt-2 text-center">✅ Successfully registered as creator!</p>
      )}
    </div>
  );
}

// ============ Create Content Form ============

function CreateContentForm() {
  const [price, setPrice] = useState('0.001');
  const { createContent, isPending, isConfirming, isSuccess, hash, error } = useCreateContent();
  const { getTransactionUrl } = useExplorer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;
    createContent(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Create New Content</h4>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Price (ETH)</label>
        <input
          type="number"
          step="0.0001"
          min="0.0001"
          max="10"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
          placeholder="0.001"
        />
        <p className="text-xs text-gray-500 mt-1">Min: 0.0001 ETH • Max: 10 ETH</p>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming || !price}
        className="w-full bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Creating...'}</span>
          </>
        ) : (
          <>
            <span>➕</span>
            <span>Create Content</span>
          </>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center">
          ✅ Content created!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </form>
  );
}

// ============ Update Content Form ============

function UpdateContentForm() {
  const [contentId, setContentId] = useState('1');
  const [price, setPrice] = useState('');
  const [enabled, setEnabled] = useState(true);
  const { updateContent, isPending, isConfirming, isSuccess, hash, error } = useUpdateContent();
  const { getTransactionUrl } = useExplorer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) return;
    updateContent(BigInt(contentId), price, enabled);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Update Content</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Content ID</label>
          <input
            type="number"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
            placeholder="1"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">New Price (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
            placeholder="Leave empty to keep"
          />
        </div>
      </div>
      <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
        <span className="text-white">Content Enabled</span>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Updating...'}</span>
          </>
        ) : (
          <>
            <span>✏️</span>
            <span>Update Content</span>
          </>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center">
          ✅ Content updated!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </form>
  );
}

// ============ Withdraw Section ============

function WithdrawSection() {
  const { balance, balanceEth } = useCreator();
  const { withdraw, isPending, isConfirming, isSuccess, hash, error } = useCreatorWithdraw();
  const { getTransactionUrl } = useExplorer();

  const handleWithdraw = () => {
    withdraw();
  };

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
      <h4 className="text-lg font-semibold text-white mb-4">Withdraw Earnings</h4>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Available Balance</span>
        <span className="text-2xl font-bold text-green-400">{balanceEth} ETH</span>
      </div>
      <button
        onClick={handleWithdraw}
        disabled={isPending || isConfirming || balance === BigInt(0)}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Withdrawing...'}</span>
          </>
        ) : (
          <>
            <span>💰</span>
            <span>Withdraw All</span>
          </>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center mt-4">
          ✅ Withdrawal successful!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
    </div>
  );
}

// ============ Creator Content List ============

function CreatorContentList() {
  const { contentIds, isLoading } = useCreatorContents();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (contentIds.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
        <p className="text-gray-400">No content created yet</p>
        <p className="text-gray-500 text-sm mt-1">Create your first paywalled content above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {contentIds.map((contentId) => (
        <ContentStatsCard key={contentId.toString()} contentId={contentId} />
      ))}
    </div>
  );
}

// ============ Creator Stats Overview ============

function CreatorStatsOverview() {
  const { contentCount, totalRevenueEth, balanceEth } = useCreator();
  const { feePercent } = usePlatformFee();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Content Items</p>
        <p className="text-2xl font-bold text-white">{contentCount}</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Total Revenue</p>
        <p className="text-2xl font-bold text-green-400">{totalRevenueEth} ETH</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Available</p>
        <p className="text-2xl font-bold text-blue-400">{balanceEth} ETH</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Platform Fee</p>
        <p className="text-2xl font-bold text-gray-400">{feePercent}%</p>
      </div>
    </div>
  );
}

// ============ Main Creator Dashboard ============

export function CreatorDashboardV2() {
  const { isConnected } = useAccount();
  const { isRegistered, isLoading } = useCreator();

  if (!isConnected) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
        <div className="text-center">
          <span className="text-4xl mb-4 block">👩‍🎨</span>
          <h3 className="text-xl font-bold text-white mb-2">Creator Dashboard</h3>
          <p className="text-gray-400">Connect your wallet to access the creator dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner />
          <span className="text-gray-400">Loading creator data...</span>
        </div>
      </div>
    );
  }

  // Show registration if not a creator yet
  if (!isRegistered) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">👩‍🎨</span>
          <h3 className="text-2xl font-bold text-white">Creator Dashboard</h3>
        </div>
        <RegistrationSection />
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/30">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">👩‍🎨</span>
        <h3 className="text-2xl font-bold text-white">Creator Dashboard</h3>
        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Registered</span>
      </div>

      {/* Stats Overview */}
      <CreatorStatsOverview />

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Create & Update */}
        <div className="space-y-8">
          <CreateContentForm />
          <UpdateContentForm />
        </div>

        {/* Right Column - Withdraw & Content List */}
        <div className="space-y-8">
          <WithdrawSection />
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Your Content</h4>
            <CreatorContentList />
          </div>
        </div>
      </div>
    </div>
  );
}
