'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, Address } from 'viem';
import Link from 'next/link';

// Contract configuration
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x240d8986051FE37f170543e1B04193D3D073DeB0') as `0x${string}`;

const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_creator", "type": "address"}],
    "name": "getCreatorContents",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_contentId", "type": "uint256"}],
    "name": "getContentDetails",
    "outputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_creator", "type": "address"}],
    "name": "creatorBalances",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_contentId", "type": "uint256"}],
    "name": "getUnlockCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ==================== Theme Context ====================
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('basePaywall-theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('basePaywall-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// ==================== Icons ====================
function BaseLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0052FF"/>
      <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" fill="#0052FF"/>
      <path d="M16.0001 24.5C20.6945 24.5 24.5001 20.6944 24.5001 16C24.5001 11.3056 20.6945 7.5 16.0001 7.5C11.5818 7.5 7.94516 10.8773 7.53516 15.1875H19.0626V16.8125H7.53516C7.94516 21.1227 11.5818 24.5 16.0001 24.5Z" fill="white"/>
    </svg>
  );
}

function ArrowLeftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
    </svg>
  );
}

function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function UserIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function ContentIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
  );
}

function UsersIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function WalletIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
    </svg>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  );
}

function ExternalLinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

// ==================== Helper Functions ====================
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

function generateAvatarGradient(address: string): string {
  const hash = address.slice(2, 10);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 40%))`;
}

// ==================== Content Card Component ====================
interface ContentItem {
  id: number;
  title: string;
  price: bigint;
  isActive: boolean;
  unlockCount: number;
}

function ContentCard({ content, theme }: { content: ContentItem; theme: Theme }) {
  return (
    <Link href={`/?contentId=${content.id}`}>
      <div className={`group p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
        theme === 'dark' 
          ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {content.title}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                {formatEther(content.price)} ETH
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                content.isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {content.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className={`text-right ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            <div className="text-2xl font-bold">{content.unlockCount}</div>
            <div className="text-xs">unlocks</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ==================== Stats Card Component ====================
function StatCard({ icon, label, value, subValue, theme }: { 
  icon: ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  theme: Theme;
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark' 
        ? 'bg-white/[0.02] border-white/[0.06]' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
        {label}
      </div>
      {subValue && (
        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}

// ==================== Main Creator Profile Component ====================
function CreatorProfileContent() {
  const { theme, toggleTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const creatorAddress = params.address as string;
  const { address: userAddress } = useAccount();
  
  const [copied, setCopied] = useState(false);
  const [contentDetails, setContentDetails] = useState<ContentItem[]>([]);

  // Fetch creator's content IDs
  const { data: contentIds, isLoading: loadingIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCreatorContents',
    args: [creatorAddress as Address],
  });

  // Fetch creator balance
  const { data: creatorBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'creatorBalances',
    args: [creatorAddress as Address],
  });

  // Fetch content details for each content ID
  const contentCalls = (contentIds || []).map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getContentDetails' as const,
    args: [id],
  }));

  const { data: contentResults } = useReadContracts({
    contracts: contentCalls,
  });

  // Fetch unlock counts
  const unlockCalls = (contentIds || []).map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUnlockCount' as const,
    args: [id],
  }));

  const { data: unlockResults } = useReadContracts({
    contracts: unlockCalls,
  });

  // Process content data
  useEffect(() => {
    if (contentResults && unlockResults && contentIds) {
      const details: ContentItem[] = [];
      for (let i = 0; i < contentIds.length; i++) {
        const result = contentResults[i];
        const unlockResult = unlockResults[i];
        if (result?.status === 'success' && result.result) {
          const [, title, , price, isActive] = result.result as [Address, string, string, bigint, boolean];
          details.push({
            id: Number(contentIds[i]),
            title,
            price,
            isActive,
            unlockCount: unlockResult?.status === 'success' ? Number(unlockResult.result) : 0,
          });
        }
      }
      setContentDetails(details);
    }
  }, [contentResults, unlockResults, contentIds]);

  const copyAddress = () => {
    navigator.clipboard.writeText(creatorAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalUnlocks = contentDetails.reduce((sum, c) => sum + c.unlockCount, 0);
  const activeContent = contentDetails.filter(c => c.isActive).length;
  const totalEarnings = contentDetails.reduce((sum, c) => sum + (Number(formatEther(c.price)) * c.unlockCount), 0);

  const isOwnProfile = userAddress?.toLowerCase() === creatorAddress.toLowerCase();

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0a0a0f] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        theme === 'dark' 
          ? 'bg-[#0a0a0f]/80 border-white/[0.06]' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/[0.06] text-white/60 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeftIcon size={20} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <BaseLogo size={28} />
              <span className="font-semibold hidden sm:block">BasePaywall</span>
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/[0.06] text-white/60 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className={`p-6 rounded-2xl border mb-6 ${
          theme === 'dark' 
            ? 'bg-white/[0.02] border-white/[0.06]' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: generateAvatarGradient(creatorAddress) }}
            >
              <UserIcon size={40} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {shortenAddress(creatorAddress, 6)}
                </h1>
                {isOwnProfile && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    Your Profile
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <button
                  onClick={copyAddress}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white/60'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
                <a
                  href={`https://sepolia.basescan.org/address/${creatorAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white/60'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <ExternalLinkIcon size={14} />
                  BaseScan
                </a>
              </div>

              {/* Bio placeholder */}
              <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                Content creator on BasePaywall
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={<ContentIcon size={20} />}
            label="Total Content"
            value={contentDetails.length.toString()}
            subValue={`${activeContent} active`}
            theme={theme}
          />
          <StatCard 
            icon={<UsersIcon size={20} />}
            label="Total Unlocks"
            value={totalUnlocks.toString()}
            theme={theme}
          />
          <StatCard 
            icon={<WalletIcon size={20} />}
            label="Est. Earnings"
            value={`${totalEarnings.toFixed(4)} ETH`}
            theme={theme}
          />
          <StatCard 
            icon={<WalletIcon size={20} />}
            label="Available Balance"
            value={`${creatorBalance ? Number(formatEther(creatorBalance)).toFixed(4) : '0'} ETH`}
            theme={theme}
          />
        </div>

        {/* Content List */}
        <div className={`p-6 rounded-2xl border ${
          theme === 'dark' 
            ? 'bg-white/[0.02] border-white/[0.06]' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Published Content
          </h2>

          {loadingIds ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-20 rounded-xl animate-pulse ${
                  theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'
                }`} />
              ))}
            </div>
          ) : contentDetails.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
              <ContentIcon size={48} />
              <p className="mt-4">No content published yet</p>
              {isOwnProfile && (
                <Link href="/">
                  <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                    Create Your First Content
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {contentDetails.map((content) => (
                <ContentCard key={content.id} content={content} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-16 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BaseLogo size={16} />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                BasePaywall • Creator Hub on Base
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="https://github.com/bandungresearchai/BasePaywall" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                GitHub
              </a>
              <a 
                href="https://base.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Base
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ==================== Export with Providers ====================
export default function CreatorProfilePage() {
  return (
    <ThemeProvider>
      <CreatorProfileContent />
    </ThemeProvider>
  );
}
