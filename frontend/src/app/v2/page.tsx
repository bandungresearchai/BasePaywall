'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { PaywallContentV2 } from '@/components/PaywallContentV2';
import { NetworkGuard } from '@/components/NetworkGuard';
import { CreatorDashboardV2 } from '@/components/CreatorDashboardV2';
import { UserUnlockedContentV2 } from '@/components/UserUnlockedContentV2';
import { PlatformAdminV2 } from '@/components/PlatformAdminV2';
import { useAccount } from 'wagmi';
import { usePlatformStats } from '@/hooks/usePaywallV2';
import { useState } from 'react';

function BaseLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
        fill="#0052FF"
      />
    </svg>
  );
}

function NetworkBadge() {
  const { chain } = useAccount();

  if (!chain) return null;

  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full text-sm">
      <span className={`w-2 h-2 rounded-full ${chain.id === 84532 ? 'bg-yellow-400' : 'bg-green-400'}`} />
      <span className="text-gray-300">{chain.name}</span>
    </div>
  );
}

function WalletAddress() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) return null;

  return (
    <span className="text-gray-400 text-sm font-mono hidden md:inline">
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
}

function PlatformStats() {
  const { totalCreators, totalContents, totalRevenueEth } = usePlatformStats();

  return (
    <div className="flex items-center space-x-6 text-sm text-gray-400">
      <span>{totalCreators} creators</span>
      <span>•</span>
      <span>{totalContents} content items</span>
      <span>•</span>
      <span>{totalRevenueEth} ETH total</span>
    </div>
  );
}

function ContentBrowser() {
  const [contentId, setContentId] = useState<string>('1');
  const currentContentId = BigInt(contentId || '1');

  return (
    <div className="space-y-4">
      {/* Content ID Selector */}
      <div className="flex items-center justify-center space-x-4">
        <label className="text-gray-400 text-sm">Content ID:</label>
        <input
          type="number"
          min="1"
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-base-blue"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setContentId(String(Math.max(1, Number(contentId) - 1)))}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
          >
            ←
          </button>
          <button
            onClick={() => setContentId(String(Number(contentId) + 1))}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
          >
            →
          </button>
        </div>
      </div>

      {/* Paywall Content */}
      <NetworkGuard>
        <PaywallContentV2
          contentId={currentContentId}
          title={`Premium Content #${contentId}`}
          description="Unlock exclusive content with a one-time payment. No subscriptions, no recurring fees."
          unlockedContent={
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">🎉 Welcome to Content #{contentId}!</h3>
              <p className="text-gray-300">
                This is your exclusive premium content. As a supporter, you now have permanent access
                to this material. Thank you for your support!
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
                <p>Content ID: {contentId}</p>
                <p>Access: Permanent</p>
                <p>Network: Base L2</p>
              </div>
            </div>
          }
        />
      </NetworkGuard>
    </div>
  );
}

function DashboardSection() {
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <section className="pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Platform Admin - only for owner */}
        <PlatformAdminV2 />

        {/* Creator Dashboard - for all connected users */}
        <CreatorDashboardV2 />

        {/* User's Unlocked Content */}
        <UserUnlockedContentV2 />
      </div>
    </section>
  );
}

export default function HomeV2() {
  return (
    <main className="min-h-screen bg-base-dark">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BaseLogo />
            <div>
              <h1 className="text-xl font-bold text-white">BasePaywall</h1>
              <span className="text-xs text-gray-500">v2 • Multi-tenant</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <WalletAddress />
            <NetworkBadge />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-base-blue/10 border border-base-blue/30 rounded-full px-4 py-2 text-sm text-base-blue">
            <span>🔐</span>
            <span>HTTP 402 Payment Required</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Multi-Creator Paywall
            <span className="text-base-blue"> on Base</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create and monetize paywalled content. One-time payments,
            permanent access, no subscriptions required.
          </p>
          {/* Platform Stats */}
          <div className="pt-4">
            <PlatformStats />
          </div>
        </div>
      </section>

      {/* Content Browser Section */}
      <section className="pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <ContentBrowser />
        </div>
      </section>

      {/* Dashboard Section */}
      <DashboardSection />

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👩‍🎨</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">1. Become a Creator</h4>
              <p className="text-gray-400 text-sm">
                Register with your wallet. No approval needed, start creating instantly.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-base-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2. Create Content</h4>
              <p className="text-gray-400 text-sm">
                Set your price and create paywalled content. Full control over your work.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">3. Users Pay</h4>
              <p className="text-gray-400 text-sm">
                Users pay once with ETH on Base to unlock content permanently.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">4. Get Paid</h4>
              <p className="text-gray-400 text-sm">
                Withdraw your earnings anytime. 97.5% goes to you, 2.5% platform fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <BaseLogo />
            <span>BasePaywall v2 • Multi-tenant Web3 SaaS on Base</span>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a
              href="https://github.com/bandungresearchai/BasePaywall"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Base
            </a>
            <a
              href="https://onchainkit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              OnchainKit
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
