'use client';

import { usePaywallStatus, usePaywallPayment, usePaywallContent, usePaywallPrice } from '@/hooks/usePaywall';
import { useEffect } from 'react';

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16 text-green-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function PaywallContent() {
  const { hasAccess, isOwner, isCheckingStatus, isConnected, refetchStatus } = usePaywallStatus();
  const { pay, txStatus, error, isPending, isConfirming, isSuccess, reset, hash } = usePaywallPayment();
  const { content, isLoading: isLoadingContent } = usePaywallContent();
  const { priceInEth } = usePaywallPrice();

  // Refetch payment status after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetchStatus();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchStatus]);

  if (!isConnected) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
        <div className="flex flex-col items-center text-center space-y-4">
          <LockIcon />
          <h2 className="text-2xl font-bold text-white">Premium Content Locked</h2>
          <p className="text-gray-400 max-w-md">
            Connect your wallet to access exclusive content. Pay once with ETH on Base to unlock forever.
          </p>
        </div>
      </div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
        <div className="flex flex-col items-center text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-400">Checking payment status...</p>
        </div>
      </div>
    );
  }

  // Show unlocked content for owner or users who have paid
  if (hasAccess) {
    return (
      <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl p-8 border border-green-500/30 glow-effect">
        <div className="flex flex-col items-center text-center space-y-4">
          <UnlockIcon />
          <h2 className="text-2xl font-bold text-white">🎉 Content Unlocked!</h2>
          {isOwner && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              👑 Contract Owner
            </span>
          )}
          <div className="bg-gray-900/80 rounded-xl p-6 w-full mt-4">
            {isLoadingContent ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <p className="text-gray-200 text-lg leading-relaxed">
                {content || 'Congratulations! You have unlocked the premium content.'}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {isOwner 
              ? 'As the contract owner, you have permanent access to all content.'
              : 'Thank you for your payment! You now have permanent access.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
      <div className="flex flex-col items-center text-center space-y-6">
        <LockIcon />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Premium Content</h2>
          <p className="text-gray-400 max-w-md">
            Unlock exclusive content with a one-time payment. No subscriptions, no recurring fees.
          </p>
        </div>

        {/* Blurred preview content */}
        <div className="relative w-full">
          <div className="bg-gray-800/50 rounded-xl p-6 locked-overlay">
            <p className="text-gray-500 blur-sm select-none">
              This is premium content that will be revealed after payment. It contains exclusive
              information, tutorials, or digital assets that you&apos;ll unlock permanently.
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-gray-900/90 px-4 py-2 rounded-full text-sm text-gray-300 border border-gray-700">
              🔒 Locked Content
            </span>
          </div>
        </div>

        {/* Price display */}
        <div className="bg-base-blue/10 rounded-xl px-6 py-4 border border-base-blue/30">
          <p className="text-sm text-gray-400">One-time payment</p>
          <p className="text-3xl font-bold text-white">
            {priceInEth} <span className="text-base-blue">ETH</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">on Base Network</p>
        </div>

        {/* Transaction status messages */}
        {txStatus === 'pending' && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <LoadingSpinner />
            <span>Confirm transaction in your wallet...</span>
          </div>
        )}

        {txStatus === 'confirming' && (
          <div className="flex items-center space-x-2 text-blue-400">
            <LoadingSpinner />
            <span>Transaction confirming...</span>
          </div>
        )}

        {txStatus === 'success' && (
          <div className="text-green-400 space-y-2">
            <p>✅ Payment successful!</p>
            {hash && (
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                View transaction →
              </a>
            )}
          </div>
        )}

        {txStatus === 'error' && (
          <div className="text-red-400 space-y-2">
            <p>❌ Transaction failed</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={reset}
              className="text-sm text-blue-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pay button */}
        {txStatus !== 'success' && (
          <button
            onClick={pay}
            disabled={isPending || isConfirming}
            className="w-full bg-base-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isPending || isConfirming ? (
              <>
                <LoadingSpinner />
                <span>{isPending ? 'Confirm in Wallet' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>Unlock Content for {priceInEth} ETH</span>
              </>
            )}
          </button>
        )}

        {/* HTTP 402 reference */}
        <p className="text-xs text-gray-600 mt-4">
          Powered by HTTP 402 &quot;Payment Required&quot; • Built on Base L2
        </p>
      </div>
    </div>
  );
}
