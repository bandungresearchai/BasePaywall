'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ==================== Documentation Page ====================

// Fade in animation wrapper
function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

// Icons
const Icons = {
  Book: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  Rocket: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Puzzle: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z" />
    </svg>
  ),
  Terminal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 17l6-6-6-6M12 19h8" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  GitHub: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 6L9 17l-5-5" />
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
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

// Code block with copy
function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-white/10">
      {title && (
        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/50 font-mono">{title}</span>
          <span className="text-xs text-white/30">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-white/80 font-mono">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? <Icons.Check /> : <Icons.Copy />}
        </button>
      </div>
    </div>
  );
}

// Section component
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <FadeIn>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-blue-500 rounded-full" />
          {title}
        </h2>
        <div className="space-y-6">{children}</div>
      </FadeIn>
    </section>
  );
}

// Expandable FAQ item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <Icons.ChevronDown />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-white/60">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sidebar navigation
const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: <Icons.Rocket /> },
  { id: 'installation', label: 'Installation', icon: <Icons.Terminal /> },
  { id: 'contracts', label: 'Smart Contracts', icon: <Icons.Code /> },
  { id: 'v2-features', label: 'V2: Categories & Fees', icon: <Icons.Puzzle /> },
  { id: 'v3-time-limited', label: 'V3: Time-Limited Access', icon: <Icons.Clock /> },
  { id: 'v4-nft', label: 'V4: NFT Access Tokens', icon: <Icons.Sparkles /> },
  { id: 'x402-protocol', label: 'x402 Protocol', icon: <Icons.Shield /> },
  { id: 'faq', label: 'FAQ', icon: <Icons.Book /> },
];

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white/60 hover:text-white"
            >
              {sidebarOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
            <Link href="/landing" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.9"/>
                  <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.8579 8 8.42516 11.0773 8.03516 15.0875H17.5V16.9125H8.03516C8.42516 20.9227 11.8579 24 16 24Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">BasePaywall</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">Docs</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/bandungresearchai/BasePaywall"
              target="_blank"
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <Icons.GitHub />
            </Link>
            <Link href="/">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors">
                Launch App
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-950 border-r border-white/[0.08] overflow-y-auto z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {section.icon}
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 py-12 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-16">
            {/* Hero */}
            <FadeIn>
              <div className="mb-12">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                  Documentation
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  BasePaywall Documentation
                </h1>
                <p className="text-lg text-white/60">
                  Everything you need to integrate BasePaywall into your application.
                  From basic setup to advanced features.
                </p>
              </div>
            </FadeIn>

            {/* Getting Started */}
            <Section id="getting-started" title="Getting Started">
              <p className="text-white/70">
                BasePaywall is a decentralized content monetization platform built on Base L2.
                It allows creators to sell digital content with one-time payments, no subscriptions required.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'For Creators', desc: 'Upload content, set prices, get paid instantly', href: '/' },
                  { title: 'For Developers', desc: 'Integrate paywalls into your dApp', href: '#installation' },
                ].map((item) => (
                  <Link key={item.title} href={item.href}>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>

            {/* Installation */}
            <Section id="installation" title="Installation">
              <p className="text-white/70 mb-4">
                Clone the repository and install dependencies:
              </p>
              <CodeBlock
                title="Terminal"
                language="bash"
                code={`# Clone the repository
git clone https://github.com/bandungresearchai/BasePaywall.git
cd BasePaywall

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev`}
              />
              <p className="text-white/70 mt-6 mb-4">
                For smart contract development:
              </p>
              <CodeBlock
                title="Terminal"
                language="bash"
                code={`# Navigate to contracts
cd contracts

# Install Foundry dependencies
forge install

# Run tests
forge test

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast`}
              />
            </Section>

            {/* Smart Contracts */}
            <Section id="contracts" title="Smart Contracts">
              <p className="text-white/70 mb-4">
                BasePaywall uses a versioned smart contract architecture. Each version adds new features
                while maintaining backward compatibility.
              </p>
              <div className="space-y-4">
                {[
                  { version: 'V1', name: 'BasePaywall', desc: 'Core paywall functionality - permanent access' },
                  { version: 'V2', name: 'BasePaywallV2', desc: 'Categories, platform fees, analytics' },
                  { version: 'V3', name: 'BasePaywallV3', desc: 'Time-limited access (rental model)' },
                  { version: 'V4', name: 'BasePaywallV4', desc: 'NFT access tokens (ERC721)' },
                ].map((contract) => (
                  <div key={contract.version} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 text-xs font-mono bg-blue-500/20 text-blue-400 rounded">
                        {contract.version}
                      </span>
                      <span className="font-mono text-white">{contract.name}</span>
                    </div>
                    <p className="text-sm text-white/60">{contract.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* V2 Features */}
            <Section id="v2-features" title="V2: Categories & Platform Fees">
              <p className="text-white/70 mb-4">
                V2 introduces content categories, platform fees for sustainable operation,
                and enhanced analytics.
              </p>
              <CodeBlock
                title="BasePaywallV2.sol"
                language="solidity"
                code={`// Create content with category
function createContent(
    string memory _metadataURI,
    uint256 _price,
    Category _category
) external returns (uint256 contentId)

// Categories available
enum Category { 
    Article,   // Blog posts, news
    Tutorial,  // How-to guides
    Template,  // Design templates
    API,       // API access
    Course,    // Educational content
    Other      // Miscellaneous
}`}
              />
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-sm">
                  <strong>Platform Fee:</strong> 2.5% fee on all transactions goes to platform maintenance.
                  Creators receive 97.5% of the payment directly.
                </p>
              </div>
            </Section>

            {/* V3 Time-Limited */}
            <Section id="v3-time-limited" title="V3: Time-Limited Access">
              <p className="text-white/70 mb-4">
                V3 enables rental-style access where users pay for temporary access to content.
                Perfect for time-sensitive materials or subscription-like experiences.
              </p>
              <CodeBlock
                title="Creating Time-Limited Content"
                language="solidity"
                code={`// Create content with 30-day access duration
function createContent(
    string memory _metadataURI,
    uint256 _price,
    Category _category,
    uint256 _accessDuration  // in seconds (e.g., 30 days = 2592000)
) external returns (uint256 contentId)

// Users can extend their access
function extendAccess(uint256 _contentId) external payable

// Check if user still has access
function hasAccess(uint256 _contentId, address _user) 
    external view returns (bool)`}
              />
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {[
                  { duration: '1 Hour', seconds: '3,600' },
                  { duration: '1 Day', seconds: '86,400' },
                  { duration: '7 Days', seconds: '604,800' },
                  { duration: '30 Days', seconds: '2,592,000' },
                ].map((item) => (
                  <div key={item.duration} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-medium text-white">{item.duration}</div>
                    <div className="text-sm text-white/50 font-mono">{item.seconds} seconds</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* V4 NFT */}
            <Section id="v4-nft" title="V4: NFT Access Tokens">
              <p className="text-white/70 mb-4">
                V4 introduces NFT-based access tokens. When users unlock content, they receive an ERC721 token
                that proves ownership and can be transferred or sold.
              </p>
              <CodeBlock
                title="NFT Access Features"
                language="solidity"
                code={`// V4 is an ERC721 contract
contract BasePaywallV4 is ERC721Enumerable, ERC2981, Ownable, Pausable {
    
    // Mint access token when unlocking
    function unlockContent(uint256 _contentId) external payable {
        // ... payment logic
        _mintAccessToken(msg.sender, _contentId);
    }
    
    // Check access via NFT ownership
    function hasAccess(uint256 _contentId, address _user) 
        external view returns (bool) {
        // Returns true if user owns any token for this content
    }
    
    // Royalties (EIP-2981)
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external view returns (address receiver, uint256 amount)
}`}
              />
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm">
                  <strong>Benefits:</strong> Transferable access, secondary market sales,
                  built-in royalties (5% default), OpenSea compatible.
                </p>
              </div>
            </Section>

            {/* x402 Protocol */}
            <Section id="x402-protocol" title="x402 Protocol">
              <p className="text-white/70 mb-4">
                x402 enables HTTP 402 &quot;Payment Required&quot; responses for API monetization.
                Clients automatically handle payment flows.
              </p>
              <CodeBlock
                title="API Integration"
                language="typescript"
                code={`// Server-side middleware
import { x402Middleware } from '@/lib/x402/middleware';

export async function GET(request: Request) {
  // Check payment status
  const paymentRequired = await x402Middleware.verify(request);
  
  if (paymentRequired) {
    return new Response(null, {
      status: 402,
      headers: {
        'X-Payment-Address': CREATOR_ADDRESS,
        'X-Payment-Amount': '0.001',
        'X-Content-Id': 'premium-api-1'
      }
    });
  }
  
  // Return premium content
  return Response.json({ data: 'Premium API response' });
}`}
              />
              <CodeBlock
                title="Client-side Usage"
                language="typescript"
                code={`import { x402Fetch } from '@/lib/x402/client';

// Automatically handles 402 responses
const response = await x402Fetch('/api/x402/content');
const data = await response.json();`}
              />
            </Section>

            {/* FAQ */}
            <Section id="faq" title="FAQ">
              <div className="space-y-3">
                <FAQItem
                  question="What blockchain does BasePaywall use?"
                  answer="BasePaywall is built on Base, an Ethereum Layer 2 network by Coinbase. This provides low gas fees (~$0.001-0.01 per transaction) and fast confirmation times (~2 seconds)."
                />
                <FAQItem
                  question="How much are the platform fees?"
                  answer="The platform fee is 2.5% of each transaction. This is significantly lower than traditional platforms like Substack (10%) or Gumroad (10%+). Creators receive 97.5% of payments directly."
                />
                <FAQItem
                  question="Can users get refunds?"
                  answer="Blockchain payments are final and cannot be reversed. This protects creators from chargebacks but means buyers should be confident before purchasing."
                />
                <FAQItem
                  question="Do users need to create accounts?"
                  answer="No! Users only need a Web3 wallet (Coinbase Wallet, MetaMask, etc.). No email, no password, no personal information required."
                />
                <FAQItem
                  question="Is the content stored on-chain?"
                  answer="Content metadata (title, description, price) is stored on IPFS with the hash recorded on-chain. The actual content can be stored on IPFS, your own servers, or any storage solution."
                />
              </div>
            </Section>

            {/* Footer */}
            <div className="pt-12 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/40 text-sm">
                  © 2026 BasePaywall. Open source under MIT License.
                </p>
                <div className="flex items-center gap-6">
                  <Link href="https://github.com/bandungresearchai/BasePaywall" target="_blank" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Icons.GitHub />
                    View on GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
