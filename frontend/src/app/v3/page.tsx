'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { WalletOnlyConnect } from '@/components/WalletOnlyConnect';
import { NetworkGuard } from '@/components/NetworkGuard';

// ==================== V3 Time-Limited Access Page ====================

// Mock data for demo (would come from contract in production)
const MOCK_TIME_LIMITED_CONTENT = [
  {
    id: 1,
    title: 'Premium Analytics Dashboard Access',
    description: 'Full access to real-time crypto market analytics, including whale tracking, DEX flows, and sentiment analysis.',
    price: '0.01',
    accessDuration: 30 * 24 * 60 * 60, // 30 days
    creator: '0x1234...5678',
    category: 'API',
    totalPurchases: 127,
    imageUrl: '/api/placeholder/400/200',
  },
  {
    id: 2,
    title: 'Solidity Masterclass - Complete Course',
    description: 'Learn advanced Solidity patterns, security best practices, and gas optimization techniques.',
    price: '0.05',
    accessDuration: 90 * 24 * 60 * 60, // 90 days
    creator: '0xabcd...efgh',
    category: 'Course',
    totalPurchases: 89,
    imageUrl: '/api/placeholder/400/200',
  },
  {
    id: 3,
    title: 'Weekly DeFi Alpha Newsletter',
    description: 'Curated insights on yield opportunities, new protocols, and market analysis delivered weekly.',
    price: '0.005',
    accessDuration: 7 * 24 * 60 * 60, // 7 days
    creator: '0x9876...4321',
    category: 'Article',
    totalPurchases: 342,
    imageUrl: '/api/placeholder/400/200',
  },
];

// Icons
const Icons = {
  Clock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Unlock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// Format duration
function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  return `${days} day${days > 1 ? 's' : ''}`;
}

// Content card
function ContentCard({ content, onUnlock }: { content: typeof MOCK_TIME_LIMITED_CONTENT[0]; onUnlock: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const handleUnlock = async () => {
    setIsLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasAccess(true);
    setExpiresAt(new Date(Date.now() + content.accessDuration * 1000));
    setIsLoading(false);
    onUnlock();
  };

  const handleExtend = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (expiresAt) {
      setExpiresAt(new Date(expiresAt.getTime() + content.accessDuration * 1000));
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
    >
      {/* Gradient header */}
      <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 mb-2">
            <Icons.Clock />
            {formatDuration(content.accessDuration)} access
          </div>
          <div className="text-2xl font-bold text-white">{content.price} ETH</div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
            {content.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Icons.Users />
            {content.totalPurchases} purchases
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{content.title}</h3>
        <p className="text-sm text-white/60 mb-4 line-clamp-2">{content.description}</p>

        {hasAccess ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Icons.Check />
                <span className="font-medium">Access Active</span>
              </div>
              {expiresAt && (
                <p className="text-xs text-white/50">
                  Expires: {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleExtend}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icons.Refresh />
                  Extend Access ({content.price} ETH)
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Icons.Unlock />
                Unlock for {formatDuration(content.accessDuration)}
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Creator form for time-limited content
function CreateTimeLimitedContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durations = [
    { label: '1 Hour', value: '0.041667' },
    { label: '1 Day', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '365 Days', value: '365' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('30');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Create Time-Limited Content</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Premium Content"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your content..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Price (ETH)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.01"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Access Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-900">
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title || !price}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Create Content'
          )}
        </button>
      </form>
    </motion.div>
  );
}

// Main page
export default function V3Page() {
  useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white/60 hover:text-white transition-colors">
                <Icons.ArrowLeft />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icons.Clock />
                  Time-Limited Access
                </h1>
                <p className="text-sm text-white/50">V3 - Rental Model</p>
              </div>
            </div>
            <WalletOnlyConnect />
          </div>
        </div>
      </header>

      <NetworkGuard>
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Feature banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Icons.Clock />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Time-Limited Access (V3)</h2>
                <p className="text-white/60 text-sm">
                  Create content with rental periods. Users pay once for temporary access, 
                  and can extend when it expires. Perfect for courses, newsletters, and premium APIs.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'browse', label: 'Browse Content' },
              { id: 'create', label: 'Create Content' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'browse' | 'create')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'browse' ? (
              <motion.div
                key="browse"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {MOCK_TIME_LIMITED_CONTENT.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onUnlock={() => console.log('Unlocked:', content.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl"
              >
                <CreateTimeLimitedContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </NetworkGuard>
    </div>
  );
}
