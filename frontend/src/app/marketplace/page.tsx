'use client';

import { useState, useEffect, useMemo } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkGuard } from '@/components/NetworkGuard';
import { ProductCard } from '@/components/ProductCard';
import { useAccount } from 'wagmi';
import { useNextContentId, usePlatformStats, useUserUnlocks } from '@/hooks/usePaywallV2';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════ */

function BaseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
        fill="currentColor"
        className="text-[#0052FF]"
      />
    </svg>
  );
}

function NetworkBadge() {
  const { chain } = useAccount();
  if (!chain) return null;

  const isTestnet = chain.id === 84532;
  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
      <span className={`w-2 h-2 rounded-full animate-pulse ${isTestnet ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      <span className="text-white/70">{chain.name}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER & SEARCH
═══════════════════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { value: 'all', label: '🏪 All Products' },
  { value: 'template', label: '📄 Templates' },
  { value: 'asset', label: '🎨 Asset Packs' },
  { value: 'course', label: '🎓 Courses' },
  { value: 'ebook', label: '📚 eBooks' },
  { value: 'software', label: '💻 Software' },
  { value: 'audio', label: '🎵 Audio' },
  { value: 'other', label: '📦 Other' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}

function FilterBar({ search, setSearch, category, setCategory, sort, setSort }: FilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS BANNER
═══════════════════════════════════════════════════════════════════════════ */

function StatsBanner() {
  const { totalCreators, totalContents, totalRevenueEth } = usePlatformStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-4 text-center">
        <p className="text-3xl font-bold text-white">{totalContents}</p>
        <p className="text-sm text-gray-400">Products Listed</p>
      </div>
      <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-4 text-center">
        <p className="text-3xl font-bold text-white">{totalCreators}</p>
        <p className="text-sm text-gray-400">Active Sellers</p>
      </div>
      <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-4 text-center">
        <p className="text-3xl font-bold text-white">{totalRevenueEth} ETH</p>
        <p className="text-sm text-gray-400">Total Volume</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT GRID
═══════════════════════════════════════════════════════════════════════════ */

interface ProductGridProps {
  contentIds: bigint[];
  onPurchase?: () => void;
}

function ProductGrid({ contentIds, onPurchase }: ProductGridProps) {
  if (contentIds.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🏪</span>
        <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
        <p className="text-gray-400 mb-6">Be the first to list a product on the marketplace!</p>
        <Link 
          href="/v2" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <span>🛍️</span>
          <span>Start Selling</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contentIds.map((contentId) => (
        <ProductCard key={contentId.toString()} contentId={contentId} onPurchase={onPurchase} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MY PURCHASES
═══════════════════════════════════════════════════════════════════════════ */

function MyPurchases() {
  const { isConnected } = useAccount();
  const { contentIds, isLoading } = useUserUnlocks();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) return null;
  if (contentIds.length === 0) return null;

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-600/30 transition-colors"
      >
        <span>🎁</span>
        <span>My Purchases ({contentIds.length})</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-400">Loading...</div>
          ) : (
            contentIds.map((contentId) => (
              <ProductCard key={contentId.toString()} contentId={contentId} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const { nextContentId } = useNextContentId();
  const { refetch: refetchUnlocks } = useUserUnlocks();
  
  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  
  // Generate content IDs from 1 to nextContentId - 1
  const allContentIds = useMemo(() => {
    const ids: bigint[] = [];
    for (let i = 1; i < nextContentId; i++) {
      ids.push(BigInt(i));
    }
    return ids;
  }, [nextContentId]);

  // For now, show all products (filtering will be enhanced later)
  // In production, you'd filter based on metadata from IPFS
  const filteredContentIds = useMemo(() => {
    let ids = [...allContentIds];
    
    // Sort
    if (sort === 'oldest') {
      // Keep as is (oldest first)
    } else if (sort === 'newest') {
      ids.reverse();
    }
    // Other sorts would require metadata
    
    return ids;
  }, [allContentIds, sort]);

  const handlePurchase = () => {
    refetchUnlocks();
  };

  return (
    <NetworkGuard>
      <div className="min-h-screen bg-[#0A0B0D] text-white">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <BaseLogo size={32} />
                <div>
                  <h1 className="text-lg font-bold text-white">BasePaywall</h1>
                  <p className="text-xs text-white/40">Marketplace</p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <Link 
                  href="/v2" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-600/30 transition-colors text-sm"
                >
                  <span>🛍️</span>
                  <span>Sell Products</span>
                </Link>
                <NetworkBadge />
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Digital Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Marketplace</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover and purchase premium digital products directly from creators. 
              Pay with ETH on Base network.
            </p>
          </div>

          {/* Stats Banner */}
          <StatsBanner />

          {/* My Purchases */}
          <MyPurchases />

          {/* Filters */}
          <FilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
          />

          {/* Products Grid */}
          <ProductGrid contentIds={filteredContentIds} onPurchase={handlePurchase} />

          {/* Connect Prompt */}
          {!isConnected && allContentIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-xl border border-white/10 max-w-md">
              <p className="text-white text-center mb-2">
                Connect your wallet to purchase products
              </p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-white/5 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              Powered by <span className="text-blue-400">Base Network</span> • 
              Built with <span className="text-purple-400">BasePaywall</span>
            </p>
          </div>
        </footer>
      </div>
    </NetworkGuard>
  );
}
