'use client';

import { useRef, ReactNode, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ==================== Modern Landing Page 2026 ====================

// Animated gradient orbs background
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-cyan-500/25 rounded-full blur-[100px] animate-pulse delay-500" />
    </div>
  );
}

// Grid pattern background
function GridPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
      <div className="w-full h-full" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </div>
  );
}

// Fade in animation wrapper
function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Modern pill badge
function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' }) {
  const colors = {
    default: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
}

// Bento card component
function BentoCard({ children, className = '', hover = true }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      className={`relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden ${className}`}
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Stats counter
function StatCounter({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
        {value}{suffix}
      </div>
      <div className="text-sm text-white/50 mt-1">{label}</div>
    </div>
  );
}

// Feature icon wrapper
function FeatureIcon({ children, gradient = 'from-blue-500 to-cyan-500' }: { children: ReactNode; gradient?: string }) {
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
      {children}
    </div>
  );
}

// Icons
const Icons = {
  Lock: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Wallet: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2L9 12l-7-3 7 3-3 10 3-7 3 7-3-10 7 3-7-3 3-10z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  Book: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  GitHub: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

// Navigation
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Docs', href: '/docs' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="max-w-6xl mx-auto px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.9"/>
                  <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.8579 8 8.42516 11.0773 8.03516 15.0875H17.5V16.9125H8.03516C8.42516 20.9227 11.8579 24 16 24Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">BasePaywall</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="https://github.com/bandungresearchai/BasePaywall"
                target="_blank"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Icons.GitHub />
              </Link>
              <Link href="/">
                <motion.button
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Launch App
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white/60"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <button className="w-full px-5 py-3 bg-blue-500 text-white rounded-xl font-medium">
                      Launch App
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
      <GradientOrbs />
      <GridPattern />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <FadeIn>
          <Badge>✨ Built on Base L2 • Low Gas Fees</Badge>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-8 text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight">
            <span className="text-white">Monetize Content</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              One Payment Away
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            The simplest way to sell digital content. No subscriptions, no accounts, no complexity.
            One payment unlocks permanent access.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <motion.button
                className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Creating
                <Icons.ArrowRight />
              </motion.button>
            </Link>
            <Link href="/docs">
              <motion.button
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Read Docs
              </motion.button>
            </Link>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.4}>
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <StatCounter value="2.5" label="Platform Fee" suffix="%" />
            <StatCounter value="<$0.01" label="Gas Cost" />
            <StatCounter value="2s" label="Finality" />
          </div>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

// Features Bento Grid
function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="success">Features</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              A complete toolkit for content monetization on the blockchain
            </p>
          </div>
        </FadeIn>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Large Feature Card */}
          <FadeIn delay={0.1}>
            <BentoCard className="md:col-span-2 md:row-span-2 p-8">
              <div className="h-full flex flex-col">
                <FeatureIcon gradient="from-blue-500 to-cyan-500">
                  <Icons.Lock />
                </FeatureIcon>
                <h3 className="mt-6 text-2xl font-bold text-white">Permanent Access</h3>
                <p className="mt-3 text-white/60 flex-grow">
                  One payment grants lifetime access to content. No recurring fees, no expiration. 
                  Your purchase is recorded on-chain forever.
                </p>
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <code className="text-sm text-blue-400">
                    unlockContent(contentId) → hasAccess = true ✓
                  </code>
                </div>
              </div>
            </BentoCard>
          </FadeIn>

          {/* Small Feature Cards */}
          <FadeIn delay={0.2}>
            <BentoCard className="p-6">
              <FeatureIcon gradient="from-purple-500 to-pink-500">
                <Icons.Zap />
              </FeatureIcon>
              <h3 className="mt-4 text-lg font-bold text-white">Instant Settlement</h3>
              <p className="mt-2 text-sm text-white/60">
                Payments go directly to creators. No delays, no holdbacks.
              </p>
            </BentoCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <BentoCard className="p-6">
              <FeatureIcon gradient="from-amber-500 to-orange-500">
                <Icons.Shield />
              </FeatureIcon>
              <h3 className="mt-4 text-lg font-bold text-white">No Chargebacks</h3>
              <p className="mt-2 text-sm text-white/60">
                Blockchain payments are final. Protect your revenue.
              </p>
            </BentoCard>
          </FadeIn>

          {/* Time Limited Access */}
          <FadeIn delay={0.4}>
            <BentoCard className="p-6">
              <FeatureIcon gradient="from-emerald-500 to-teal-500">
                <Icons.Clock />
              </FeatureIcon>
              <h3 className="mt-4 text-lg font-bold text-white">Time-Limited Access</h3>
              <p className="mt-2 text-sm text-white/60">
                Offer rental periods with V3 contracts. Perfect for time-sensitive content.
              </p>
              <div className="mt-3">
                <Badge variant="success">New in V3</Badge>
              </div>
            </BentoCard>
          </FadeIn>

          {/* NFT Access */}
          <FadeIn delay={0.5}>
            <BentoCard className="p-6">
              <FeatureIcon gradient="from-indigo-500 to-violet-500">
                <Icons.Sparkles />
              </FeatureIcon>
              <h3 className="mt-4 text-lg font-bold text-white">NFT Access Tokens</h3>
              <p className="mt-2 text-sm text-white/60">
                Transferable access passes with V4. Trade or gift your access.
              </p>
              <div className="mt-3">
                <Badge variant="warning">Coming Soon</Badge>
              </div>
            </BentoCard>
          </FadeIn>

          {/* API Access */}
          <FadeIn delay={0.6}>
            <BentoCard className="p-6">
              <FeatureIcon gradient="from-rose-500 to-red-500">
                <Icons.Code />
              </FeatureIcon>
              <h3 className="mt-4 text-lg font-bold text-white">x402 Protocol</h3>
              <p className="mt-2 text-sm text-white/60">
                HTTP 402 Payment Required. Monetize APIs with native web payments.
              </p>
            </BentoCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// How It Works
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Create Content',
      description: 'Upload your premium content and set your price in ETH. Takes less than 2 minutes.',
      icon: <Icons.Book />,
    },
    {
      step: '02',
      title: 'Share Your Link',
      description: 'Get a unique link for your content. Share it anywhere - social media, newsletters, websites.',
      icon: <Icons.Globe />,
    },
    {
      step: '03',
      title: 'Get Paid Instantly',
      description: 'When readers pay, funds go directly to your wallet. No intermediaries, no delays.',
      icon: <Icons.Wallet />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge>How It Works</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
              Simple as 1-2-3
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <FadeIn key={item.step} delay={i * 0.1}>
              <div className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
                
                <BentoCard className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 mb-6">
                    {item.icon}
                  </div>
                  <div className="text-sm font-mono text-blue-400 mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </BentoCard>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Comparison Section
function ComparisonSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="warning">Why BasePaywall?</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
              Traditional vs Web3
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <FadeIn delay={0.1}>
            <BentoCard className="p-8 opacity-60">
              <h3 className="text-xl font-bold text-white/80 mb-6">Traditional Platforms</h3>
              <ul className="space-y-4">
                {[
                  '10-30% platform fees',
                  'Weekly/monthly payouts',
                  'Account required for readers',
                  'Chargeback risks',
                  'Platform can shut you down',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/50">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </BentoCard>
          </FadeIn>

          {/* BasePaywall */}
          <FadeIn delay={0.2}>
            <BentoCard className="p-8 border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-6">BasePaywall</h3>
              <ul className="space-y-4">
                {[
                  '2.5% platform fee only',
                  'Instant settlement',
                  'No account needed - just wallet',
                  'No chargebacks ever',
                  'Decentralized & censorship-resistant',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Icons.Check />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </BentoCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <BentoCard className="p-12 md:p-16 text-center relative overflow-hidden" hover={false}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start Monetizing Today
              </h2>
              <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
                Join creators who are already earning with BasePaywall.
                No setup fees, no commitments.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/">
                  <motion.button
                    className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Launch App
                    <Icons.ArrowRight />
                  </motion.button>
                </Link>
                <Link href="/docs">
                  <motion.button
                    className="px-8 py-4 text-white/60 hover:text-white transition-colors flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    Read Documentation
                    <Icons.ArrowRight />
                  </motion.button>
                </Link>
              </div>
            </div>
          </BentoCard>
        </FadeIn>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/landing" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.9"/>
                  <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.8579 8 8.42516 11.0773 8.03516 15.0875H17.5V16.9125H8.03516C8.42516 20.9227 11.8579 24 16 24Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">BasePaywall</span>
            </Link>
            <p className="text-white/50 max-w-sm">
              Decentralized content monetization on Base L2. 
              Simple, transparent, and creator-first.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Marketplace', 'Pricing', 'Docs'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Docs' ? '/docs' : item === 'Marketplace' ? '/marketplace' : `#${item.toLowerCase()}`} className="text-white/50 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: 'GitHub', href: 'https://github.com/bandungresearchai/BasePaywall' },
                { label: 'Base Network', href: 'https://base.org' },
                { label: 'Smart Contracts', href: '/docs#contracts' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/50 hover:text-white transition-colors" target={item.href.startsWith('http') ? '_blank' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 BasePaywall. Built with ❤️ on Base.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/bandungresearchai/BasePaywall" target="_blank" className="text-white/40 hover:text-white transition-colors">
              <Icons.GitHub />
            </Link>
            <Link href="https://twitter.com/basepaywall" target="_blank" className="text-white/40 hover:text-white transition-colors">
              <Icons.Twitter />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </div>
  );
}
