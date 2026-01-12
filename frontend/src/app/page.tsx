'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { PaywallContent } from '@/components/PaywallContent';
import { X402ContentDemo } from '@/components/X402Demo';
import { useAccount } from 'wagmi';

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

export default function Home() {
  return (
    <main className="min-h-screen bg-base-dark">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BaseLogo />
            <h1 className="text-xl font-bold text-white">BasePaywall</h1>
          </div>
          <div className="flex items-center space-x-4">
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
            On-Chain Content Paywall
            <span className="text-base-blue"> on Base</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Monetize your content with blockchain payments. One-time payments, 
            permanent access, no subscriptions required.
          </p>
        </div>
      </section>

      {/* Paywall Content Section */}
      <section className="pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <PaywallContent />
        </div>
      </section>

      {/* x402 Protocol Demo Section */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <span className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-400">
              <span>⚡</span>
              <span>x402 Protocol Integration</span>
            </span>
          </div>
          <X402ContentDemo />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-base-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👛</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">1. Connect Wallet</h4>
              <p className="text-gray-400">
                Connect your Coinbase Wallet or any Web3 wallet to get started.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-base-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2. Make Payment</h4>
              <p className="text-gray-400">
                Pay a small amount of ETH on Base to unlock the content permanently.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-base-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔓</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">3. Access Content</h4>
              <p className="text-gray-400">
                Your payment is recorded on-chain. Access the content anytime, forever.
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
            <span>BasePaywall • Built on Base L2</span>
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
