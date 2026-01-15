'use client';

import { usePlatformOwner, usePlatformStats, usePlatformFee, usePlatformWithdraw } from '@/hooks/usePaywallV2';
import { useExplorer } from '@/hooks/useNetwork';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PlatformAdminV2() {
  const { isOwner, isLoading: isLoadingOwner } = usePlatformOwner();
  const { 
    totalCreators, 
    totalContents, 
    totalRevenueEth, 
    platformBalanceEth,
    isLoading: isLoadingStats 
  } = usePlatformStats();
  const { feePercent } = usePlatformFee();
  const { 
    withdraw, 
    isPending, 
    isConfirming, 
    isSuccess, 
    hash, 
    error 
  } = usePlatformWithdraw();
  const { getTransactionUrl } = useExplorer();

  // Don't show for non-owners
  if (isLoadingOwner) {
    return null;
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="card p-8">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">👑</span>
        <h3 className="text-2xl font-bold text-white">Platform Admin</h3>
        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">Owner</span>
      </div>

      {isLoadingStats ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="text-gray-400 ml-2">Loading platform stats...</span>
        </div>
      ) : (
        <>
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Creators</p>
              <p className="text-2xl font-bold text-white">{totalCreators}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Content Items</p>
              <p className="text-2xl font-bold text-white">{totalContents}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{totalRevenueEth} ETH</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Platform Fee</p>
              <p className="text-2xl font-bold text-yellow-400">{feePercent}%</p>
            </div>
          </div>

          {/* Platform Withdrawal */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Platform Fees</h4>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Available to Withdraw</span>
              <span className="text-2xl font-bold text-yellow-400">{platformBalanceEth} ETH</span>
            </div>
            <button
              onClick={withdraw}
              disabled={isPending || isConfirming || platformBalanceEth === '0.0000'}
              className="btn w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isPending || isConfirming ? (
                <>
                  <LoadingSpinner />
                  <span>{isPending ? 'Confirm in Wallet' : 'Withdrawing...'}</span>
                </>
              ) : (
                <>
                  <span>💰</span>
                  <span>Withdraw Platform Fees</span>
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
        </>
      )}
    </div>
  );
}
