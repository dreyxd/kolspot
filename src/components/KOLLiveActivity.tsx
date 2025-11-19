import { useState, useEffect } from 'react';
import type { SwapActivity } from '../services/moralis';

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

interface EnrichedSwap extends SwapActivity {
  kolName: string;
  kolWallet: string;
}

const KOLLiveActivity = () => {
  const [swaps, setSwaps] = useState<EnrichedSwap[]>([]);
  const [trackedKOLs] = useState([
    'Cented', 'Walta', 'Gh0stee', 'Daumen', 'Coler', 
    'Jijo', 'iconXBT', 'AdamJae', 'Art', 'Limfork.eth'
  ]);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/kol-activity/swaps`);
        if (!response.ok) {
          throw new Error('Failed to fetch KOL activity');
        }
        const data = await response.json();
        setSwaps(data);
      } catch (error) {
        console.error('Error fetching KOL activity:', error);
      }
    };

    fetchSwaps();
    // Refresh every 15 seconds silently in background
    const interval = setInterval(fetchSwaps, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const shortAddress = (addr: string, start = 4, end = 4) => {
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return 'N/A';
    const num = parseFloat(amount);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (swaps.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <div className="text-4xl mb-2">📊</div>
        <div className="mb-2">No recent activity</div>
        <div className="text-xs text-neutral-600">
          Tracking: {trackedKOLs.join(', ')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {swaps.map((swap, idx) => (
        <div
          key={`${swap.transactionHash}-${idx}`}
          className="p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                swap.transactionType === 'buy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {swap.transactionType.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-white">{swap.kolName}</span>
            </div>
            <span className="text-xs text-neutral-500">{formatTime(swap.blockTimestamp)}</span>
          </div>

          {swap.pairLabel && (
            <div className="text-sm text-accent font-mono mb-1">{swap.pairLabel}</div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-neutral-500">Amount</div>
              <div className="text-neutral-200 font-medium">
                {formatAmount(swap.baseTokenAmount)} {swap.baseToken || ''}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">Value</div>
              <div className="text-accent font-semibold">
                {swap.totalValueUsd ? `$${swap.totalValueUsd.toFixed(2)}` : 'N/A'}
              </div>
            </div>
          </div>

          {swap.exchangeName && (
            <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
              {swap.exchangeLogo && (
                <img src={swap.exchangeLogo} alt={swap.exchangeName} className="w-4 h-4 rounded" />
              )}
              <span>{swap.exchangeName}</span>
            </div>
          )}

          <a
            href={`https://solscan.io/tx/${swap.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            View Transaction →
          </a>
        </div>
      ))}
    </div>
  );
};

export default KOLLiveActivity;
