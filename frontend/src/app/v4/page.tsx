'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { WalletOnlyConnect } from '@/components/WalletOnlyConnect';
import { NetworkGuard } from '@/components/NetworkGuard';

// ==================== V4 NFT Access Tokens Page ====================

// Mock NFT data
const MOCK_NFT_CONTENT = [
  {
    id: 1,
    title: 'Lifetime API Access Pass',
    description: 'Unlimited access to our premium data API. Transferable NFT pass with 5% royalty on resales.',
    price: '0.1',
    maxSupply: 100,
    minted: 47,
    creator: '0x1234...5678',
    royaltyPercentage: 5,
    imageUrl: '/api/placeholder/400/400',
  },
  {
    id: 2,
    title: 'Exclusive Research Club',
    description: 'Access to private Discord, weekly alpha calls, and detailed market research reports.',
    price: '0.25',
    maxSupply: 50,
    minted: 31,
    creator: '0xabcd...efgh',
    royaltyPercentage: 5,
    imageUrl: '/api/placeholder/400/400',
  },
  {
    id: 3,
    title: 'Web3 Developer Toolkit',
    description: 'Complete toolkit with templates, components, and boilerplate code for Web3 projects.',
    price: '0.05',
    maxSupply: 500,
    minted: 234,
    creator: '0x9876...4321',
    royaltyPercentage: 5,
    imageUrl: '/api/placeholder/400/400',
  },
];

// Mock user's NFTs
const MOCK_USER_NFTS = [
  {
    tokenId: 42,
    contentId: 1,
    title: 'Lifetime API Access Pass',
    acquiredAt: new Date('2026-01-15'),
  },
];

// Icons
const Icons = {
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
      <path d="M19 11l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  ),
  Send: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Percent: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Hash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  Wallet: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  ),
};

// NFT Card
function NFTCard({ nft, onMint }: { nft: typeof MOCK_NFT_CONTENT[0]; onMint: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const remaining = nft.maxSupply - nft.minted;
  const isSoldOut = remaining === 0;

  const handleMint = async () => {
    if (isSoldOut) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasMinted(true);
    setIsLoading(false);
    onMint();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors group"
    >
      {/* NFT Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 text-center">
          <motion.div
            className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icons.Sparkles />
            <span className="text-white text-3xl ml-1">#{nft.id}</span>
          </motion.div>
          <div className="text-sm text-white/50 font-mono">Token ID: {nft.minted + 1}</div>
        </div>

        {/* Supply badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-sm text-white/80">
          {remaining}/{nft.maxSupply}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2">{nft.title}</h3>
        <p className="text-sm text-white/60 mb-4 line-clamp-2">{nft.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Icons.Percent />
            {nft.royaltyPercentage}% royalty
          </span>
          <span className="flex items-center gap-1">
            <Icons.Hash />
            {nft.minted} minted
          </span>
        </div>

        {/* Price & Mint button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50">Price</div>
            <div className="text-xl font-bold text-white">{nft.price} ETH</div>
          </div>

          {hasMinted ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Icons.Check />
              <span className="font-medium">Minted!</span>
            </div>
          ) : (
            <button
              onClick={handleMint}
              disabled={isLoading || isSoldOut}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                isSoldOut
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-violet-500 hover:bg-violet-600 text-white'
              }`}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSoldOut ? (
                'Sold Out'
              ) : (
                <>Mint NFT</>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// User's NFT collection
function UserNFTs() {
  const [transferring, setTransferring] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Your Access NFTs</h3>
      
      {MOCK_USER_NFTS.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/30">
            <Icons.Image />
          </div>
          <p className="text-white/50">You don&apos;t have any access NFTs yet</p>
          <p className="text-sm text-white/30 mt-1">Mint one above to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {MOCK_USER_NFTS.map((nft) => (
            <motion.div
              key={nft.tokenId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  #{nft.tokenId}
                </div>
                <div>
                  <div className="font-medium text-white">{nft.title}</div>
                  <div className="text-xs text-white/50">
                    Acquired: {nft.acquiredAt.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-white/50 hover:text-white transition-colors"
                  title="View on OpenSea"
                >
                  <Icons.ExternalLink />
                </button>
                <button
                  onClick={async () => {
                    setTransferring(nft.tokenId);
                    await new Promise(r => setTimeout(r, 2000));
                    setTransferring(null);
                  }}
                  disabled={transferring === nft.tokenId}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
                >
                  {transferring === nft.tokenId ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Icons.Send />
                      Transfer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create NFT collection form
function CreateNFTCollection() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxSupply, setMaxSupply] = useState('100');
  const [royalty, setRoyalty] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Reset
    setTitle('');
    setDescription('');
    setPrice('');
    setMaxSupply('100');
    setRoyalty('5');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Create NFT Access Collection</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">Collection Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Access Pass Collection"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this NFT grant access to?"
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Price (ETH)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Max Supply</label>
            <input
              type="number"
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Royalty %</label>
            <input
              type="number"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              placeholder="5"
              min="0"
              max="10"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <p className="text-sm text-violet-300">
            <strong>Note:</strong> NFTs can be traded on OpenSea and other marketplaces. 
            You&apos;ll receive {royalty}% royalty on all secondary sales.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title || !price}
          className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.Sparkles />
              Create Collection
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

// Main page
export default function V4Page() {
  useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-nfts' | 'create'>('browse');

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
                  <Icons.Sparkles />
                  NFT Access Tokens
                </h1>
                <p className="text-sm text-white/50">V4 - Transferable Access</p>
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
            className="mb-8 p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <Icons.Sparkles />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">NFT Access Tokens (V4)</h2>
                <p className="text-white/60 text-sm">
                  Access rights as tradeable NFTs. Mint, transfer, or sell your access passes on OpenSea.
                  Creators earn royalties on secondary sales.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'browse', label: 'Browse Collections' },
              { id: 'my-nfts', label: 'My NFTs' },
              { id: 'create', label: 'Create Collection' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'browse' | 'my-nfts' | 'create')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-violet-500 text-white'
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
                {MOCK_NFT_CONTENT.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    onMint={() => console.log('Minted NFT:', nft.id)}
                  />
                ))}
              </motion.div>
            ) : activeTab === 'my-nfts' ? (
              <motion.div
                key="my-nfts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl"
              >
                <UserNFTs />
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl"
              >
                <CreateNFTCollection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </NetworkGuard>
    </div>
  );
}
