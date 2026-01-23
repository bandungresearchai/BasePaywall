'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { PaywallContentV2 } from '@/components/PaywallContentV2';
import { NetworkGuard } from '@/components/NetworkGuard';
import { CreatorDashboardV2 } from '@/components/CreatorDashboardV2';
import { UserUnlockedContentV2 } from '@/components/UserUnlockedContentV2';
import { PlatformAdminV2 } from '@/components/PlatformAdminV2';
import { useAccount } from 'wagmi';
import { usePlatformStats, useCreator, useNextContentId } from '@/hooks/usePaywallV2';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM - Onchain Creator Hub Style
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

function GlowOrb({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
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

function WalletAddress() {
  const { address, isConnected } = useAccount();
  if (!isConnected || !address) return null;

  return (
    <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className="text-white/60 text-xs font-mono">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS & METRICS
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon, gradient }: { label: string; value: string | number; icon: string; gradient: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/10 transition-all duration-300">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function PlatformStats() {
  const { totalCreators, totalContents, totalRevenueEth } = usePlatformStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard 
        label="Active Creators" 
        value={totalCreators} 
        icon="👩‍🎨" 
        gradient="bg-gradient-to-br from-purple-500/10 to-transparent" 
      />
      <StatCard 
        label="Content Items" 
        value={totalContents} 
        icon="📦" 
        gradient="bg-gradient-to-br from-blue-500/10 to-transparent" 
      />
      <StatCard 
        label="Total Revenue" 
        value={`${totalRevenueEth} ETH`} 
        icon="💎" 
        gradient="bg-gradient-to-br from-emerald-500/10 to-transparent" 
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK START GUIDE
═══════════════════════════════════════════════════════════════════════════ */

function QuickStartGuide() {
  const { isConnected } = useAccount();
  const { isRegistered } = useCreator();
  const { nextContentId } = useNextContentId();
  const hasContent = nextContentId > 1;

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 border border-amber-500/20 p-6">
        <GlowOrb className="bg-amber-500 w-32 h-32 -top-10 -right-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Get Started</h3>
              <p className="text-xs text-white/40">Connect to begin your journey</p>
            </div>
          </div>
          <ol className="space-y-3">
            {[
              'Connect your wallet using the button above',
              'Register as a creator in the Dashboard',
              'Create content with your price',
              'Share and start earning'
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const steps = [
    { done: isConnected, text: 'Connect wallet', icon: '🔗' },
    { done: isRegistered, text: 'Register as creator', icon: '✍️' },
    { done: hasContent, text: 'Create content', icon: '📝' },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const allDone = completedSteps === steps.length;

  if (allDone) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 border border-emerald-500/20 p-6">
        <GlowOrb className="bg-emerald-500 w-32 h-32 -top-10 -right-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">You&apos;re All Set!</h3>
              <p className="text-xs text-white/40">Ready to monetize your content</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            Content IDs available: <span className="text-emerald-400 font-medium">1 to {(nextContentId - BigInt(1)).toString()}</span>
          </p>
          <p className="text-xs text-white/40 mt-2">
            Test unlocks with a different wallet to see the full flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 border border-blue-500/20 p-6">
      <GlowOrb className="bg-blue-500 w-32 h-32 -top-10 -right-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Setup Progress</h3>
              <p className="text-xs text-white/40">{completedSteps} of {steps.length} completed</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-400">{Math.round((completedSteps / steps.length) * 100)}%</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${step.done ? 'bg-emerald-500/10' : 'bg-white/[0.02]'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
              }`}>
                {step.done ? '✓' : step.icon}
              </span>
              <span className={`text-sm ${step.done ? 'text-emerald-400 line-through' : 'text-white/70'}`}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT BROWSER
═══════════════════════════════════════════════════════════════════════════ */

function ContentBrowser() {
  const [contentId, setContentId] = useState<string>('1');
  const { nextContentId } = useNextContentId();
  const hasContent = nextContentId > 1;
  const currentContentId = BigInt(contentId || '1');
  const maxId = hasContent ? Number(nextContentId - BigInt(1)) : 1;

  return (
    <div className="space-y-6">
      <QuickStartGuide />

      {/* Content Navigator */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <span className="text-white/40 text-sm">Browse Content</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentId(String(Math.max(1, Number(contentId) - 1)))}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={Number(contentId) <= 1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={maxId}
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-20 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-center font-medium focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => setContentId(String(Math.min(maxId, Number(contentId) + 1)))}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!hasContent || Number(contentId) >= maxId}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {hasContent && (
          <span className="text-white/30 text-xs">
            {maxId} item{maxId > 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Paywall Content */}
      <NetworkGuard>
        <PaywallContentV2
          contentId={currentContentId}
          title={`Premium Content #${contentId}`}
          description="Unlock exclusive content with a one-time payment. No subscriptions, no recurring fees."
          unlockedContent={
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Content #{contentId} Unlocked!</h3>
                  <p className="text-sm text-white/40">You have permanent access</p>
                </div>
              </div>
              <p className="text-white/60">
                This is your exclusive premium content. As a supporter, you now have permanent access
                to this material. Thank you for your support!
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-xs text-white/40 mb-1">Content ID</p>
                  <p className="text-sm font-medium text-white">{contentId}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-xs text-white/40 mb-1">Access</p>
                  <p className="text-sm font-medium text-emerald-400">Permanent</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-xs text-white/40 mb-1">Network</p>
                  <p className="text-sm font-medium text-blue-400">Base</p>
                </div>
              </div>
            </div>
          }
        />
      </NetworkGuard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

type AppView = 'home' | 'discover' | 'creator' | 'unlocked' | 'admin' | 'analytics';

interface NavItem {
  key: AppView;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', description: 'Overview & stats' },
  { key: 'discover', label: 'Discover', icon: '🔍', description: 'Browse content' },
  { key: 'creator', label: 'Create', icon: '✨', description: 'Creator dashboard' },
  { key: 'unlocked', label: 'Library', icon: '📚', description: 'Your unlocks' },
  { key: 'admin', label: 'Admin', icon: '⚙️', description: 'Platform settings' },
  { key: 'analytics', label: 'Analytics', icon: '📊', description: 'View insights' },
];

function Sidebar({ active, onChange }: { active: AppView; onChange: (v: AppView) => void }) {
  return (
    <aside className="space-y-2">
      {/* Logo Section */}
      <div className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BaseLogo size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">BasePaywall</h3>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Creator Hub</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
              active === item.key 
                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/5' 
                : 'hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <span className={`text-lg transition-transform duration-200 ${active === item.key ? 'scale-110' : 'group-hover:scale-105'}`}>
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${active === item.key ? 'text-blue-400' : 'text-white/70'}`}>
                {item.label}
              </p>
              <p className="text-[10px] text-white/30 truncate">{item.description}</p>
            </div>
            {active === item.key && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Network Badge */}
      <div className="px-4 pt-6">
        <NetworkBadge />
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const steps = [
    { icon: '👩‍🎨', title: 'Register', desc: 'Connect wallet & become a creator', gradient: 'from-purple-500/20' },
    { icon: '📝', title: 'Create', desc: 'Publish paywalled content', gradient: 'from-blue-500/20' },
    { icon: '💳', title: 'Monetize', desc: 'Users pay in ETH on Base', gradient: 'from-emerald-500/20' },
    { icon: '💰', title: 'Earn', desc: 'Withdraw anytime', gradient: 'from-amber-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {steps.map((step, i) => (
        <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-white/10 transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-1">{step.title}</h4>
            <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
          </div>
          {/* Step number */}
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-[10px] text-white/30 font-medium">{i + 1}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */

export default function HomeV2() {
  const [activeView, setActiveView] = useState<AppView>('home');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GlowOrb className="bg-blue-600 w-96 h-96 -top-48 -left-48" />
        <GlowOrb className="bg-purple-600 w-96 h-96 -bottom-48 -right-48" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BaseLogo size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white">BasePaywall</h1>
              <span className="text-[10px] text-white/30">v2 Creator Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/marketplace" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-600/30 transition-colors text-sm"
            >
              <span>🏪</span>
              <span>Marketplace</span>
            </a>
            <WalletAddress />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Sidebar active={activeView} onChange={setActiveView} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {activeView === 'home' && (
              <>
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-indigo-600/20 border border-white/[0.08] p-8 md:p-12">
                  <GlowOrb className="bg-blue-500 w-64 h-64 -top-32 -right-32" />
                  <div className="relative max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white/70 mb-6">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      HTTP 402 Payment Required
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                      Monetize Your Content{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        On-Chain
                      </span>
                    </h2>
                    <p className="text-lg text-white/50 leading-relaxed mb-8">
                      Create paywalled content, accept one-time payments, give permanent access. 
                      Built on Base for low fees and instant transactions.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setActiveView('creator')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Start Creating →
                      </button>
                      <button 
                        onClick={() => setActiveView('discover')}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300"
                      >
                        Explore Content
                      </button>
                    </div>
                  </div>
                </section>

                {/* Stats */}
                <PlatformStats />

                {/* How It Works */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">How It Works</h3>
                    <span className="text-xs text-white/30">4 simple steps</span>
                  </div>
                  <HowItWorks />
                </section>

                {/* Quick Access Content Browser */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Quick Access</h3>
                    <button 
                      onClick={() => setActiveView('discover')}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  <ContentBrowser />
                </section>
              </>
            )}

            {activeView === 'discover' && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Discover Content</h2>
                  <p className="text-white/40">Browse and unlock premium content from creators</p>
                </div>
                <ContentBrowser />
              </section>
            )}

            {activeView === 'creator' && (
              <section>
                <CreatorDashboardV2 />
              </section>
            )}

            {activeView === 'admin' && (
              <section>
                <PlatformAdminV2 />
              </section>
            )}

            {activeView === 'unlocked' && (
              <section>
                <UserUnlockedContentV2 />
              </section>
            )}

            {activeView === 'analytics' && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
                  <p className="text-white/40">Track your performance and insights</p>
                </div>
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Detailed analytics including revenue trends, unlock rates, and audience insights will be available soon.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BaseLogo size={16} />
              </div>
              <span className="text-sm text-white/40">BasePaywall • Creator Hub on Base</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="https://github.com/bandungresearchai/BasePaywall" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                Base
              </a>
              <a href="https://onchainkit.xyz" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                OnchainKit
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
