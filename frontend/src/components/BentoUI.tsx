'use client';

import { useState, useEffect } from 'react';
import { useContent, useUnlockContent, useContentAccess, useNextContentId } from '@/hooks/usePaywallV2';
import { getProductLocal, getIPFSUrl, type ProductMetadata } from '@/lib/ipfs';
import { useAccount } from 'wagmi';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO UI DESIGN SYSTEM - Inspired by Base.org Showcase
═══════════════════════════════════════════════════════════════════════════ */

// Category styling with beautiful gradients
const CATEGORY_STYLES: Record<string, { 
  emoji: string; 
  gradient: string; 
  label: string;
  bgColor: string;
}> = {
  template: { 
    emoji: '📄', 
    gradient: 'from-blue-600 to-indigo-700', 
    label: 'Template',
    bgColor: 'bg-blue-900'
  },
  asset: { 
    emoji: '🎨', 
    gradient: 'from-pink-600 to-rose-700', 
    label: 'Asset Pack',
    bgColor: 'bg-pink-900'
  },
  course: { 
    emoji: '🎓', 
    gradient: 'from-emerald-600 to-teal-700', 
    label: 'Course',
    bgColor: 'bg-emerald-900'
  },
  ebook: { 
    emoji: '📚', 
    gradient: 'from-amber-600 to-orange-700', 
    label: 'eBook',
    bgColor: 'bg-amber-900'
  },
  software: { 
    emoji: '💻', 
    gradient: 'from-violet-600 to-purple-700', 
    label: 'Software',
    bgColor: 'bg-violet-900'
  },
  audio: { 
    emoji: '🎵', 
    gradient: 'from-cyan-600 to-blue-700', 
    label: 'Audio',
    bgColor: 'bg-cyan-900'
  },
  other: { 
    emoji: '📦', 
    gradient: 'from-gray-600 to-slate-700', 
    label: 'Other',
    bgColor: 'bg-gray-800'
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO CARD - Showcase-style card component
═══════════════════════════════════════════════════════════════════════════ */

interface BentoCardProps {
  contentId: bigint;
  size?: 'small' | 'medium' | 'large' | 'featured';
  onPurchase?: () => void;
}

export function BentoCard({ contentId, size = 'medium', onPurchase }: BentoCardProps) {
  const { isConnected } = useAccount();
  const { priceEth, enabled, creator, unlockCount, isLoading } = useContent(contentId);
  const { hasAccess } = useContentAccess(contentId);
  const { unlock, isPending, isConfirming, isSuccess, error, reset } = useUnlockContent(contentId);
  
  const [productMeta, setProductMeta] = useState<ProductMetadata | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load product metadata
  useEffect(() => {
    const id = contentId.toString();
    const localMeta = getProductLocal(id);
    if (localMeta) {
      setProductMeta(localMeta);
      return;
    }

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

  useEffect(() => {
    if (isSuccess) {
      setShowDetails(false);
      onPurchase?.();
    }
  }, [isSuccess, onPurchase]);

  if (isLoading) {
    return (
      <div className={`rounded-3xl overflow-hidden animate-pulse ${
        size === 'featured' ? 'col-span-2 row-span-2' :
        size === 'large' ? 'col-span-2' :
        size === 'small' ? 'col-span-1' : 'col-span-1'
      }`}>
        <div className="w-full h-full min-h-[200px] bg-white/5" />
      </div>
    );
  }

  if (!enabled || !creator || creator === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  const categoryStyle = CATEGORY_STYLES[productMeta?.category || 'other'] || CATEGORY_STYLES.other;
  const title = productMeta?.title || `Product #${contentId.toString()}`;
  const description = productMeta?.description || 'Premium digital content on Base';
  const thumbnail = productMeta?.thumbnailCID;

  // Determine grid span based on size
  const gridClass = 
    size === 'featured' ? 'col-span-2 row-span-2' :
    size === 'large' ? 'col-span-2' :
    size === 'small' ? 'col-span-1' : 'col-span-1';

  const handleBuy = () => {
    if (!isConnected || hasAccess) return;
    reset();
    unlock();
  };

  return (
    <div 
      className={`group relative rounded-3xl overflow-hidden ${gridClass} ${categoryStyle.bgColor} transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} opacity-90`} />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]" />
      </div>

      {/* Custom Thumbnail or Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        {thumbnail && thumbnail.startsWith('data:') ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          />
        ) : thumbnail ? (
          <img 
            src={getIPFSUrl(thumbnail)} 
            alt={title} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          />
        ) : (
          <span className={`text-white/20 ${size === 'featured' ? 'text-[120px]' : size === 'large' ? 'text-8xl' : 'text-6xl'}`}>
            {categoryStyle.emoji}
          </span>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full min-h-[200px] p-6 flex flex-col justify-between">
        {/* Top: Category Badge */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs text-white/90 font-medium">
            {categoryStyle.emoji} {categoryStyle.label}
          </span>
          
          {hasAccess && (
            <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-full text-xs text-white font-medium">
              ✓ Owned
            </span>
          )}
        </div>

        {/* Bottom: Title & Info */}
        <div className={`transform transition-all duration-300 ${showDetails ? 'translate-y-0' : 'translate-y-2'}`}>
          <h3 className={`text-white font-bold mb-2 leading-tight ${
            size === 'featured' ? 'text-3xl' : size === 'large' ? 'text-2xl' : 'text-xl'
          }`}>
            {title}
          </h3>
          
          <p className={`text-white/70 text-sm mb-4 line-clamp-2 transition-opacity duration-300 ${
            showDetails ? 'opacity-100' : 'opacity-0'
          }`}>
            {description}
          </p>

          {/* Stats & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm">
                👤 {creator.slice(0, 6)}...{creator.slice(-4)}
              </span>
              <span className="text-white/60 text-sm">
                🛒 {unlockCount} sold
              </span>
            </div>
            
            {/* Price & Action */}
            {hasAccess ? (
              <span className="text-white font-semibold text-lg">
                Owned ✓
              </span>
            ) : (
              <button
                onClick={handleBuy}
                disabled={!isConnected || isPending || isConfirming}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  isPending || isConfirming 
                    ? 'bg-white/20 text-white/60 cursor-wait'
                    : 'bg-white text-gray-900 hover:bg-white/90 shadow-lg'
                }`}
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isPending ? 'Confirm' : 'Processing'}
                  </span>
                ) : (
                  <span>{priceEth} ETH</span>
                )}
              </button>
            )}
          </div>
          
          {error && (
            <p className="text-red-300 text-xs mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* External Link Arrow */}
      <div className={`absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${
        showDetails ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
      }`}>
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO GRID - CSS Grid Layout for products
═══════════════════════════════════════════════════════════════════════════ */

interface BentoGridProps {
  contentIds: bigint[];
  onPurchase?: () => void;
}

export function BentoGrid({ contentIds, onPurchase }: BentoGridProps) {
  // Assign sizes for visual variety
  const getSizeForIndex = (index: number): 'small' | 'medium' | 'large' | 'featured' => {
    // First item is featured
    if (index === 0) return 'featured';
    // Every 5th item (after first) is large
    if ((index - 1) % 5 === 0) return 'large';
    // Rest alternate between small and medium
    return index % 3 === 0 ? 'small' : 'medium';
  };

  if (contentIds.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-6 block">🏪</span>
        <h3 className="text-2xl font-bold text-white mb-3">No products yet</h3>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          Be the first to list a product on the marketplace and start earning ETH!
        </p>
        <Link 
          href="/v2" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
        >
          <span>🛍️</span>
          <span>Start Selling</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(200px,1fr)]">
      {contentIds.map((contentId, index) => (
        <BentoCard 
          key={contentId.toString()} 
          contentId={contentId} 
          size={getSizeForIndex(index)}
          onPurchase={onPurchase} 
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHOWCASE GALLERY - Featured projects display
═══════════════════════════════════════════════════════════════════════════ */

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  logo?: string;
  color: string;
  url?: string;
}

interface ShowcaseGalleryProps {
  title?: string;
  subtitle?: string;
  items?: ShowcaseItem[];
}

export function ShowcaseGallery({ 
  title = "Showcase", 
  subtitle = "Featured products on BasePaywall",
  items 
}: ShowcaseGalleryProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nextContentId } = useNextContentId();
  
  // Generate showcase from real products or use defaults
  const showcaseItems: ShowcaseItem[] = items || [
    { id: '1', title: 'Premium Templates', description: 'High-quality design templates for your projects', color: 'bg-blue-800' },
    { id: '2', title: 'Course Bundle', description: 'Complete learning experience with video tutorials', color: 'bg-emerald-800' },
    { id: '3', title: 'Asset Pack Pro', description: 'Professional-grade digital assets and resources', color: 'bg-purple-800' },
    { id: '4', title: 'Software Tools', description: 'Powerful tools to boost your productivity', color: 'bg-amber-800' },
    { id: '5', title: 'Audio Collection', description: 'Premium sound effects and music tracks', color: 'bg-pink-800' },
    { id: '6', title: 'eBook Series', description: 'In-depth guides and documentation', color: 'bg-red-800' },
  ];

  return (
    <section className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
        <p className="text-white/50 text-lg">{subtitle}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {showcaseItems.map((item) => (
          <div 
            key={item.id}
            className={`group relative rounded-3xl overflow-hidden ${item.color} p-8 min-h-[280px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
          >
            {/* Logo/Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                {item.logo || '🔥'}
              </span>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end">
              <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm">{item.description}</p>
              
              {/* Arrow */}
              <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE GRID - Platform features display
═══════════════════════════════════════════════════════════════════════════ */

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient?: string;
}

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

export function FeatureGrid({
  title = "Why BasePaywall?",
  subtitle = "Everything you need to monetize your content on-chain",
  features
}: FeatureGridProps) {
  const defaultFeatures: Feature[] = features || [
    { 
      icon: '⚡', 
      title: 'HTTP 402 Protocol', 
      description: 'Native web payment standard for seamless integration',
      gradient: 'from-blue-500/20 to-transparent'
    },
    { 
      icon: '🔐', 
      title: 'One-Time Payment', 
      description: 'Pay once, access forever. No subscriptions needed.',
      gradient: 'from-emerald-500/20 to-transparent'
    },
    { 
      icon: '💎', 
      title: 'Low Fees', 
      description: 'Built on Base L2 for minimal gas costs (~$0.001)',
      gradient: 'from-purple-500/20 to-transparent'
    },
    { 
      icon: '🌐', 
      title: 'Multi-Tenant', 
      description: 'Platform for multiple creators with custom content',
      gradient: 'from-pink-500/20 to-transparent'
    },
    { 
      icon: '📱', 
      title: 'Mobile Ready', 
      description: 'WalletConnect & Coinbase Wallet for smartphone access',
      gradient: 'from-amber-500/20 to-transparent'
    },
    { 
      icon: '🛡️', 
      title: 'On-Chain Proof', 
      description: 'Immutable payment records on Base blockchain',
      gradient: 'from-cyan-500/20 to-transparent'
    },
  ];

  return (
    <section className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
        <p className="text-white/50 text-lg">{subtitle}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultFeatures.map((feature, index) => (
          <div 
            key={index}
            className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH BAR - Bento style
═══════════════════════════════════════════════════════════════════════════ */

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BentoSearchBar({ value, onChange, placeholder = "Search products..." }: SearchBarProps) {
  return (
    <div className="relative max-w-xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default { BentoCard, BentoGrid, ShowcaseGallery, FeatureGrid, BentoSearchBar };
