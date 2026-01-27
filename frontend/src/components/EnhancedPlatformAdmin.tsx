'use client';

import { useState } from 'react';
import { usePlatformOwner, usePlatformStats, usePlatformFee, usePlatformWithdraw } from '@/hooks/usePaywallV2';
import { useExplorer } from '@/hooks/useNetwork';

function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS CARDS - Beautiful metric displays
═══════════════════════════════════════════════════════════════════════════ */

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  gradient: string;
}

function MetricCard({ label, value, icon, change, changeType = 'neutral', gradient }: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} border border-white/10 group hover:border-white/20 transition-all duration-300`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {change && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              changeType === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
              changeType === 'negative' ? 'bg-red-500/20 text-red-400' :
              'bg-white/10 text-white/60'
            }`}>
              {change}
            </span>
          )}
        </div>
        
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/50 text-sm">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED BAR CHART - Interactive visualization
═══════════════════════════════════════════════════════════════════════════ */

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

function EnhancedBarChart({ 
  data, 
  height = 200,
  showValues = true,
  animated = true 
}: { 
  data: BarChartData[]; 
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end gap-2 justify-between px-2" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = Math.max((item.value / maxValue) * (height - 60), 8);
        const isHovered = hoveredIndex === i;
        
        return (
          <div 
            key={i} 
            className="flex flex-col items-center flex-1 gap-2 group"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Value label */}
            {showValues && (
              <span className={`text-xs font-medium transition-all duration-200 ${
                isHovered ? 'text-white scale-110' : 'text-white/40'
              }`}>
                {typeof item.value === 'number' && item.value < 1 
                  ? item.value.toFixed(3) 
                  : item.value}
              </span>
            )}
            
            {/* Bar */}
            <div className="relative w-full flex justify-center">
              <div
                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                  animated ? 'animate-grow-up' : ''
                } ${isHovered ? 'opacity-100' : 'opacity-80'}`}
                style={{ 
                  height: `${barHeight}px`,
                  background: item.color || `linear-gradient(to top, #3B82F6, #8B5CF6)`,
                  boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                  transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                }}
              />
            </div>
            
            {/* Label */}
            <span className={`text-[10px] transition-colors duration-200 ${
              isHovered ? 'text-white' : 'text-white/40'
            }`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DONUT CHART - For distribution visualization
═══════════════════════════════════════════════════════════════════════════ */

interface DonutData {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ data, size = 160 }: { data: DonutData[]; size?: number }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" className="-rotate-90">
        {data.map((slice, i) => {
          const percent = slice.value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;
          
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          
          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Inner circle for donut effect */}
        <circle cx="0" cy="0" r="0.6" fill="#0a0a0f" />
      </svg>
      
      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-white/60 text-sm">{item.label}</span>
            <span className="text-white font-medium text-sm">{((item.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIVITY FEED - Real-time transaction list
═══════════════════════════════════════════════════════════════════════════ */

interface ActivityItem {
  type: 'unlock' | 'withdraw' | 'create' | 'register';
  address: string;
  amount?: string;
  contentId?: string;
  timestamp: Date;
}

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'unlock': return '🔓';
      case 'withdraw': return '💰';
      case 'create': return '📝';
      case 'register': return '✨';
    }
  };

  const getLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'unlock': return 'Content Unlocked';
      case 'withdraw': return 'Withdrawal';
      case 'create': return 'Content Created';
      case 'register': return 'Creator Registered';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-1">
      {activities.map((activity, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            {getIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">{getLabel(activity.type)}</p>
            <p className="text-white/40 text-xs truncate font-mono">
              {activity.address.slice(0, 8)}...{activity.address.slice(-6)}
              {activity.contentId && ` • Content #${activity.contentId}`}
            </p>
          </div>
          
          <div className="text-right">
            {activity.amount && (
              <p className="text-emerald-400 text-sm font-medium">{activity.amount}</p>
            )}
            <p className="text-white/30 text-xs">{formatTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED PLATFORM ADMIN
═══════════════════════════════════════════════════════════════════════════ */

export function EnhancedPlatformAdmin() {
  const { isOwner, isLoading: isLoadingOwner } = usePlatformOwner();
  const { 
    totalCreators, 
    totalContents, 
    totalRevenueEth, 
    platformBalanceEth,
    isLoading: isLoadingStats 
  } = usePlatformStats();
  const { feePercent } = usePlatformFee();
  const { 
    withdraw, 
    isPending, 
    isConfirming, 
    isSuccess, 
    hash, 
    error 
  } = usePlatformWithdraw();
  const { getTransactionUrl } = useExplorer();

  // Mock data for charts
  const weeklyRevenue = [
    { label: 'Mon', value: 0.05 },
    { label: 'Tue', value: 0.12 },
    { label: 'Wed', value: 0.08 },
    { label: 'Thu', value: 0.25 },
    { label: 'Fri', value: 0.18 },
    { label: 'Sat', value: 0.32 },
    { label: 'Sun', value: 0.15 },
  ];

  const distributionData = [
    { label: 'Templates', value: 35, color: '#3B82F6' },
    { label: 'Courses', value: 25, color: '#8B5CF6' },
    { label: 'Assets', value: 20, color: '#10B981' },
    { label: 'Other', value: 20, color: '#F59E0B' },
  ];

  const recentActivity: ActivityItem[] = [
    { type: 'unlock', address: '0x1234567890abcdef1234567890abcdef12345678', amount: '0.01 ETH', contentId: '3', timestamp: new Date(Date.now() - 300000) },
    { type: 'create', address: '0xabcdef1234567890abcdef1234567890abcdef12', contentId: '12', timestamp: new Date(Date.now() - 1800000) },
    { type: 'register', address: '0x7890abcdef1234567890abcdef1234567890abcd', timestamp: new Date(Date.now() - 3600000) },
    { type: 'withdraw', address: '0xdef1234567890abcdef1234567890abcdef1234', amount: '0.25 ETH', timestamp: new Date(Date.now() - 7200000) },
    { type: 'unlock', address: '0x4567890abcdef1234567890abcdef1234567890', amount: '0.005 ETH', contentId: '7', timestamp: new Date(Date.now() - 14400000) },
  ];

  if (isLoadingOwner) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🔐</span>
        <h3 className="text-xl font-bold text-white mb-2">Admin Access Required</h3>
        <p className="text-white/50">This section is only available to platform administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👑</span>
            <h2 className="text-2xl font-bold text-white">Platform Admin</h2>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
              Owner
            </span>
          </div>
          <p className="text-white/40">Manage platform settings and monitor performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Live Data</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {isLoadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon="💰"
            label="Platform Revenue"
            value={`${totalRevenueEth} ETH`}
            gradient="from-emerald-600/20 to-emerald-900/20"
            change="+24.5%"
            changeType="positive"
          />
          <MetricCard
            icon="📦"
            label="Total Content"
            value={totalContents}
            gradient="from-blue-600/20 to-blue-900/20"
            change="+12"
            changeType="positive"
          />
          <MetricCard
            icon="👩‍🎨"
            label="Active Creators"
            value={totalCreators}
            gradient="from-purple-600/20 to-purple-900/20"
            change="+3"
            changeType="positive"
          />
          <MetricCard
            icon="⚙️"
            label="Platform Fee"
            value={`${feePercent}%`}
            gradient="from-amber-600/20 to-amber-900/20"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Revenue Trend</h3>
              <p className="text-white/40 text-sm">Last 7 days</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs font-medium">
              +24.5%
            </span>
          </div>
          <EnhancedBarChart data={weeklyRevenue} height={200} />
        </div>

        {/* Distribution Chart */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-white font-semibold">Content Distribution</h3>
            <p className="text-white/40 text-sm">By category</p>
          </div>
          <DonutChart data={distributionData} />
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/5 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Platform Fees Available</h3>
            <p className="text-3xl font-bold text-amber-400">{platformBalanceEth} ETH</p>
            <p className="text-white/40 text-sm mt-1">Ready to withdraw</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={withdraw}
              disabled={isPending || isConfirming || platformBalanceEth === '0.0000'}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <LoadingSpinner size={18} />
                  <span>{isPending ? 'Confirm in Wallet' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <span>💰</span>
                  <span>Withdraw Fees</span>
                </>
              )}
            </button>
            
            {isSuccess && hash && (
              <div className="text-emerald-400 text-sm text-center">
                ✅ Success!{' '}
                <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
                  View Transaction
                </a>
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Recent Activity</h3>
          <p className="text-white/40 text-sm">Platform-wide transactions</p>
        </div>
        <div className="p-2">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes grow-up {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
        .animate-grow-up {
          animation: grow-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default EnhancedPlatformAdmin;
