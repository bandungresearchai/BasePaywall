'use client';

import { useContentAccess, useUnlockContent, useContent } from '@/hooks/usePaywallV2';
import { useNetwork } from '@/hooks/useNetwork';
import { useNetworkGuard } from '@/components/NetworkGuard';
import { useAccount } from 'wagmi';
import ConfirmModal from '@/components/ConfirmModal';
import React from 'react';
import TransactionReceipt from '@/components/TransactionReceipt';
import Button from '@/components/ui/Button';

interface PaywallContentV2Props {
  contentId: bigint;
  title?: string;
  description?: string;
  unlockedContent?: React.ReactNode;
}

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

// TransactionReceipt moved to shared component

function WrongNetworkBanner() {
  const { switchToDefault, isSwitching, defaultChain } = useNetwork();

  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 w-full mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-red-400">⚠️</span>
          <span className="text-red-400 text-sm">Wrong network detected</span>
        </div>
        <button
          onClick={switchToDefault}
          disabled={isSwitching}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white text-sm px-3 py-1 rounded-lg"
        >
          {isSwitching ? 'Switching...' : `Switch to ${defaultChain.name}`}
        </button>
      </div>
    </div>
  );
}

function ContentNotFound({ contentId }: { contentId: bigint }) {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
      <div className="flex flex-col items-center text-center space-y-4">
        <span className="text-4xl">🔍</span>
        <h2 className="text-xl font-bold text-white">Content Not Found</h2>
        <p className="text-gray-400">
          Content #{contentId.toString()} does not exist or has not been created yet.
        </p>
      </div>
    </div>
  );
}

function ContentDisabled({ contentId }: { contentId: bigint }) {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/30">
      <div className="flex flex-col items-center text-center space-y-4">
        <span className="text-4xl">🚫</span>
        <h2 className="text-xl font-bold text-white">Content Unavailable</h2>
        <p className="text-gray-400">
          Content #{contentId.toString()} has been disabled by the creator.
        </p>
      </div>
    </div>
  );
}

export function PaywallContentV2({
  contentId,
  title = 'Premium Content',
  description = 'Unlock exclusive content with a one-time payment. No subscriptions, no recurring fees.',
  unlockedContent,
}: PaywallContentV2Props) {
  const { isConnected, address } = useAccount();
  const { creator, priceEth, enabled, isLoading: isLoadingContent } = useContent(contentId);
  const { hasAccess, isLoading: isCheckingAccess } = useContentAccess(contentId);
  const {
    unlock,
    txStatus,
    error,
    isPending,
    isConfirming,
    hash,
    reset,
  } = useUnlockContent(contentId);
  const { shouldBlockTransaction, isWrongNetwork } = useNetworkGuard();

  // Check if user is the creator (auto-access)
  const isCreator = address && creator ? address.toLowerCase() === creator.toLowerCase() : false;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <LockIcon />
          <h2 className="text-2xl font-bold text-white">{title} Locked</h2>
          <p className="text-gray-400 max-w-md">
            Connect your wallet to access exclusive content. Pay once with ETH on Base to unlock forever.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingContent || isCheckingAccess) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-400">Checking content status...</p>
        </div>
      </div>
    );
  }

  // Content not found
  if (!creator || creator === '0x0000000000000000000000000000000000000000') {
    return <ContentNotFound contentId={contentId} />;
  }

  // Content disabled (unless user already has access or is creator)
  if (!enabled && !hasAccess && !isCreator) {
    return <ContentDisabled contentId={contentId} />;
  }

  // User has access (paid or is creator)
  if (hasAccess) {
    return (
      <div className="card glow-effect bg-gradient-to-br from-green-900/10 to-blue-900/10 p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <UnlockIcon />
          <h2 className="text-2xl font-bold text-white">🎉 Content Unlocked!</h2>
          {isCreator && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              👩‍🎨 Content Creator
            </span>
          )}
          <div className="card bg-gray-900/80 rounded-xl p-6 w-full mt-4">
            {unlockedContent ? (
              unlockedContent
            ) : (
              <p className="text-gray-200 text-lg leading-relaxed">
                Congratulations! You have unlocked premium content #{contentId.toString()}.
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {isCreator
              ? 'As the content creator, you have permanent access.'
              : 'Thank you for your payment! You now have permanent access.'}
          </p>
        </div>
      </div>
    );
  }

  // Paywall state - user needs to pay
  return (
    <div className="card p-8">
      <div className="flex flex-col items-center text-center space-y-6">
        <LockIcon />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 max-w-md">{description}</p>
        </div>

        {/* Network warning */}
        {isWrongNetwork && <WrongNetworkBanner />}

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
              🔒 Content #{contentId.toString()}
            </span>
          </div>
        </div>

        {/* Price display */}
        <div className="bg-base-blue/10 rounded-xl px-6 py-4 border border-base-blue/30">
          <p className="text-sm text-gray-400">One-time payment</p>
          <p className="text-3xl font-bold text-white">
            {priceEth} <span className="text-primary">ETH</span>
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
            <span>Transaction confirming on Base...</span>
          </div>
        )}

        {txStatus === 'success' && hash && (
          <TransactionReceipt hash={hash} priceEth={priceEth} />
        )}

        {txStatus === 'error' && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 w-full">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-400">❌</span>
              <span className="text-red-400 font-semibold">Transaction Failed</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{error}</p>
            <Button
              onClick={reset}
              className="w-full text-red-400 py-2 rounded-lg transition-colors text-sm bg-red-600/20 hover:bg-red-600/30"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Pay button with confirmation modal */}
        {txStatus !== 'success' && (
          <PayButtonWithConfirmV2
            shouldBlockTransaction={shouldBlockTransaction}
            isPending={isPending}
            isConfirming={isConfirming}
            priceEth={priceEth}
            onPay={unlock}
            hasAccess={hasAccess}
          />
        )}

        {/* HTTP 402 reference */}
        <p className="text-xs text-gray-600 mt-4">
          Powered by HTTP 402 &quot;Payment Required&quot; • Built on Base L2
        </p>
      </div>
    </div>
  );
}

  function PayButtonWithConfirmV2({
    shouldBlockTransaction,
    isPending,
    isConfirming,
    priceEth,
    onPay,
    hasAccess,
  }: {
    shouldBlockTransaction: boolean;
    isPending: boolean;
    isConfirming: boolean;
    priceEth: string;
    onPay: () => void;
    hasAccess: boolean;
  }) {
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleConfirm = () => {
      setShowConfirm(false);
      onPay();
    };

    if (hasAccess) return <div className="text-sm text-gray-400">Already unlocked</div>;

    return (
      <>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={shouldBlockTransaction || isPending || isConfirming}
          variant="primary"
          className={`w-full ${shouldBlockTransaction ? 'opacity-80' : ''}`}
        >
          {isConfirming || isPending ? (
            <>
              <LoadingSpinner />
              <span>{isPending ? 'Confirm in Wallet' : 'Processing...'}</span>
            </>
          ) : shouldBlockTransaction ? (
            <span>Switch Network to Pay</span>
          ) : (
            <>
              <span>🔓</span>
              <span>Unlock Content for {priceEth} ETH</span>
            </>
          )}
        </Button>

        {showConfirm && (
          <ConfirmModal
            title="Confirm Payment"
            description={`Unlock this content for ${priceEth} ETH?`}
            confirmLabel="Pay"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
            loading={isPending || isConfirming}
          />
        )}
      </>
    );
  }
