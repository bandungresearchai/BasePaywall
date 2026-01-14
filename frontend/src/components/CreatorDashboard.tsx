'use client';

import { useState } from 'react';
import { useCreatorDashboard, useCreatorActions, useContentStats } from '@/hooks/usePaywall';
import { useExplorer } from '@/hooks/useNetwork';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ContentStatsCard({ contentId }: { contentId: bigint }) {
  const { priceInEth, revenueInEth, unlocks, enabled, isLoading } = useContentStats(contentId);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-6 bg-gray-700 rounded w-3/4" />
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
          <p className="text-white font-medium">{priceInEth.toFixed(4)} ETH</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Revenue</p>
          <p className="text-green-400 font-medium">{revenueInEth.toFixed(4)} ETH</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Unlocks</p>
          <p className="text-base-blue font-medium">{unlocks}</p>
        </div>
      </div>
    </div>
  );
}

function PriceUpdateForm() {
  const [contentId, setContentId] = useState('1');
  const [price, setPrice] = useState('0.001');
  const { setContentPrice, isPending, isConfirming, isSuccess, hash } = useCreatorActions();
  const { getTransactionUrl } = useExplorer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !price) return;
    setContentPrice(BigInt(contentId), price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Update Content Price</h4>
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
          <label className="block text-sm text-gray-400 mb-1">Price (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
            placeholder="0.001"
            min="0"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Updating...'}</span>
          </>
        ) : (
          <span>Update Price</span>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center">
          ✅ Price updated!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
    </form>
  );
}

function ContentToggleForm() {
  const [contentId, setContentId] = useState('1');
  const { setContentEnabled, isPending, isConfirming } = useCreatorActions();

  const handleEnable = () => {
    if (!contentId) return;
    setContentEnabled(BigInt(contentId), true);
  };

  const handleDisable = () => {
    if (!contentId) return;
    setContentEnabled(BigInt(contentId), false);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Enable/Disable Content</h4>
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
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleEnable}
          disabled={isPending || isConfirming}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
        >
          Enable
        </button>
        <button
          onClick={handleDisable}
          disabled={isPending || isConfirming}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
        >
          Disable
        </button>
      </div>
    </div>
  );
}

function NFTToggle() {
  const { nftMintEnabled } = useCreatorDashboard();
  const { setNFTMintEnabled, isPending, isConfirming } = useCreatorActions();

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">NFT Access Pass</h4>
      <p className="text-sm text-gray-400">
        When enabled, users receive an NFT proof of access after payment.
      </p>
      <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
        <span className="text-white">NFT Minting</span>
        <button
          onClick={() => setNFTMintEnabled(!nftMintEnabled)}
          disabled={isPending || isConfirming}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            nftMintEnabled ? 'bg-green-500' : 'bg-gray-600'
          } ${isPending || isConfirming ? 'opacity-50' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              nftMintEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function WithdrawSection() {
  const { balanceInEth, refetchBalance } = useCreatorDashboard();
  const { withdraw, isPending, isConfirming, isSuccess, hash } = useCreatorActions();
  const { getTransactionUrl } = useExplorer();

  const handleWithdraw = () => {
    withdraw();
  };

  // Refetch balance on success
  if (isSuccess) {
    setTimeout(() => refetchBalance(), 2000);
  }

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
      <h4 className="text-lg font-semibold text-white mb-4">Withdraw Funds</h4>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Available Balance</span>
        <span className="text-2xl font-bold text-green-400">{balanceInEth.toFixed(6)} ETH</span>
      </div>
      <button
        onClick={handleWithdraw}
        disabled={isPending || isConfirming || balanceInEth === 0}
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
    </div>
  );
}

export function CreatorDashboard() {
  const { isOwner, totalRevenueInEth } = useCreatorDashboard();
  const [viewContentId, setViewContentId] = useState('1');

  if (!isOwner) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/30">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">👑</span>
        <h3 className="text-2xl font-bold text-white">Creator Dashboard</h3>
      </div>

      {/* Revenue Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">{totalRevenueInEth.toFixed(6)} ETH</p>
        </div>
        <WithdrawSection />
      </div>

      {/* Content Stats Viewer */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">Content Statistics</h4>
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="number"
            value={viewContentId}
            onChange={(e) => setViewContentId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue w-32"
            placeholder="Content ID"
            min="1"
          />
          <span className="text-gray-400">View stats for content ID</span>
        </div>
        {viewContentId && <ContentStatsCard contentId={BigInt(viewContentId)} />}
      </div>

      {/* Management Forms */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <PriceUpdateForm />
          <ContentToggleForm />
        </div>
        <div>
          <NFTToggle />
        </div>
      </div>
    </div>
  );
}
