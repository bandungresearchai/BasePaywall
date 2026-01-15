'use client';

import { useUserUnlocks, useContent } from '@/hooks/usePaywallV2';
import { useAccount } from 'wagmi';

function UnlockedContentItem({ contentId }: { contentId: bigint }) {
  const { priceEth, creator } = useContent(contentId);

  // Shorten creator address for display
  const shortCreator = creator
    ? `${creator.slice(0, 6)}...${creator.slice(-4)}`
    : '...';

  return (
    <div className="card flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <span className="text-green-400">✓</span>
        </div>
        <div>
          <p className="text-white font-medium">Content #{contentId.toString()}</p>
          <p className="text-gray-500 text-sm">
            Paid {priceEth} ETH • by {shortCreator}
          </p>
        </div>
      </div>
      <span className="text-green-400 text-sm">Unlocked</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card text-center p-6">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📭</span>
      </div>
      <p className="text-gray-400">No content unlocked yet</p>
      <p className="text-gray-500 text-sm mt-2">
        Pay to unlock premium content and it will appear here.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserUnlockedContentV2() {
  const { isConnected } = useAccount();
  const { contentIds, count, isLoading } = useUserUnlocks();

  if (!isConnected) {
      return (
        <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">My Unlocked Content</h3>
        <p className="text-gray-400 text-center py-4">
          Connect wallet to see your unlocked content
        </p>
      </div>
    );
  }

  return (
     <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">My Unlocked Content</h3>
        {count > 0 && (
          <span className="bg-base-blue/20 text-base-blue px-3 py-1 rounded-full text-sm">
            {count} item{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : contentIds.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {contentIds.map((contentId) => (
            <UnlockedContentItem key={contentId.toString()} contentId={contentId} />
          ))}
        </div>
      )}
    </div>
  );
}
