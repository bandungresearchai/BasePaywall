'use client';

import { useState, useEffect } from 'react';
import { useContent, useUnlockContent, useContentAccess } from '@/hooks/usePaywallV2';
import { getProductLocal, getIPFSUrl, type ProductMetadata } from '@/lib/ipfs';
import { useAccount } from 'wagmi';

interface ProductCardProps {
  contentId: bigint;
  onPurchase?: () => void;
}

// Category styling map
const CATEGORY_STYLES: Record<string, { emoji: string; gradient: string; label: string }> = {
  template: { emoji: '📄', gradient: 'from-blue-500/20 to-purple-500/10', label: 'Template' },
  asset: { emoji: '🎨', gradient: 'from-pink-500/20 to-orange-500/10', label: 'Asset Pack' },
  course: { emoji: '🎓', gradient: 'from-green-500/20 to-teal-500/10', label: 'Course' },
  ebook: { emoji: '📚', gradient: 'from-amber-500/20 to-yellow-500/10', label: 'eBook' },
  software: { emoji: '💻', gradient: 'from-violet-500/20 to-indigo-500/10', label: 'Software' },
  audio: { emoji: '🎵', gradient: 'from-cyan-500/20 to-blue-500/10', label: 'Audio' },
  other: { emoji: '📦', gradient: 'from-gray-500/20 to-slate-500/10', label: 'Other' },
};

export function ProductCard({ contentId, onPurchase }: ProductCardProps) {
  const { isConnected } = useAccount();
  const { priceEth, enabled, creator, unlockCount, isLoading } = useContent(contentId);
  const { hasAccess } = useContentAccess(contentId);
  const { unlock, isPending, isConfirming, isSuccess, error, reset } = useUnlockContent(contentId);
  
  const [productMeta, setProductMeta] = useState<ProductMetadata | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load product metadata
  useEffect(() => {
    const id = contentId.toString();
    
    // Try local storage first (demo mode)
    const localMeta = getProductLocal(id);
    if (localMeta) {
      setProductMeta(localMeta);
      return;
    }

    // Fallback: try to load from old localStorage array format
    try {
      const products = JSON.parse(localStorage.getItem('basePaywallProducts') || '[]');
      if (Array.isArray(products)) {
        const product = products[parseInt(id) - 1];
        if (product) {
          setProductMeta({
            title: product.title || `Product #${id}`,
            description: product.description || '',
            category: product.category || 'other',
            price: priceEth,
            thumbnailCID: product.thumbnailPreview,
            creatorAddress: creator || '',
            contentId: id,
            createdAt: product.createdAt || '',
          });
        }
      }
    } catch (e) {
      console.error('Failed to load product metadata:', e);
    }
  }, [contentId, priceEth, creator]);

  // Handle successful purchase
  useEffect(() => {
    if (isSuccess) {
      setShowConfirm(false);
      onPurchase?.();
    }
  }, [isSuccess, onPurchase]);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 animate-pulse">
        <div className="aspect-video bg-gray-700" />
        <div className="p-4">
          <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!enabled || !creator || creator === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  const categoryStyle = CATEGORY_STYLES[productMeta?.category || 'other'] || CATEGORY_STYLES.other;
  const title = productMeta?.title || `Product #${contentId.toString()}`;
  const description = productMeta?.description || 'No description available';
  const thumbnail = productMeta?.thumbnailCID;

  const handleBuyClick = () => {
    if (!isConnected) return;
    if (hasAccess) return;
    setShowConfirm(true);
  };

  const handleConfirmPurchase = () => {
    reset();
    unlock();
  };

  return (
    <>
      <div className="group relative bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
        {/* Thumbnail */}
        <div className={`aspect-video bg-gradient-to-br ${categoryStyle.gradient} relative overflow-hidden`}>
          {thumbnail && thumbnail.startsWith('data:') ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : thumbnail ? (
            <img 
              src={getIPFSUrl(thumbnail)} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50">{categoryStyle.emoji}</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white/80 flex items-center gap-1">
              <span>{categoryStyle.emoji}</span>
              <span>{categoryStyle.label}</span>
            </span>
          </div>

          {/* Owned Badge */}
          {hasAccess && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                ✓ Owned
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold mb-1 truncate group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-3 h-10">
            {description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <span>👤</span>
              <span className="font-mono">
                {creator.slice(0, 6)}...{creator.slice(-4)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span>🛒</span>
              <span>{unlockCount} sold</span>
            </span>
          </div>

          {/* Price & Buy Button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-bold text-white">{priceEth} ETH</p>
            </div>
            
            {hasAccess ? (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium cursor-default"
                disabled
              >
                ✓ Purchased
              </button>
            ) : (
              <button
                onClick={handleBuyClick}
                disabled={!isConnected || isPending || isConfirming}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isPending || isConfirming ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{isPending ? 'Confirm...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>🛒</span>
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Purchase</h3>
            <p className="text-gray-400 mb-4">
              You are about to purchase <span className="text-white font-medium">{title}</span>
            </p>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Price</span>
                <span className="text-white font-medium">{priceEth} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Fee</span>
                <span className="text-white font-medium">~0.0001 ETH</span>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); reset(); }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isPending || isConfirming}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isPending || isConfirming ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{isPending ? 'Confirm in Wallet' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>💎</span>
                    <span>Pay {priceEth} ETH</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;
