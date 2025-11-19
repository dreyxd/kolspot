import { useState, useEffect } from 'react';
import { getVolumeStatsByChain, type VolumeStats } from '../services/moralis';

export default function VolumeAnalytics() {
  const [volumeStats, setVolumeStats] = useState<VolumeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVolumeStats = async () => {
      try {
        setLoading(true);
        const stats = await getVolumeStatsByChain('solana');
        setVolumeStats(stats);
        setError(false);
      } catch (err) {
        console.error('Error fetching volume stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVolumeStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchVolumeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (vol?: number) => {
    if (vol === undefined || vol === null) return 'N/A';
    if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(2)}B`;
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📊</div>
          <h2 className="text-xl font-bold">Network Volume Analytics</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !volumeStats) {
    return (
      <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📊</div>
          <h2 className="text-xl font-bold">Network Volume Analytics</h2>
        </div>
        <div className="text-center py-8 text-neutral-500">
          <p>Unable to load volume analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">📊</div>
        <div>
          <h2 className="text-xl font-bold">Network Volume Analytics</h2>
          <p className="text-xs text-neutral-500">Solana network-wide trading metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
          <div className="text-xs text-neutral-500 mb-1">Total Volume (24h)</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatVolume(volumeStats.totalVolume)}
          </div>
        </div>

        {/* Active Wallets */}
        <div className="bg-black/20 rounded-lg p-4 border border-blue-500/20">
          <div className="text-xs text-neutral-500 mb-1">Active Wallets</div>
          <div className="text-2xl font-bold text-blue-400">
            {volumeStats.activeWallets?.toLocaleString() || 'N/A'}
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-black/20 rounded-lg p-4 border border-green-500/20">
          <div className="text-xs text-neutral-500 mb-1">Transactions</div>
          <div className="text-2xl font-bold text-green-400">
            {volumeStats.totalTransactions?.toLocaleString() || 'N/A'}
          </div>
        </div>

        {/* Buy/Sell Ratio */}
        {volumeStats.buyVolume !== undefined && volumeStats.sellVolume !== undefined && (
          <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
            <div className="text-xs text-neutral-500 mb-1">Buy/Sell Ratio</div>
            <div className="text-2xl font-bold text-yellow-400">
              {volumeStats.sellVolume > 0 
                ? (volumeStats.buyVolume / volumeStats.sellVolume).toFixed(2)
                : 'N/A'}
            </div>
          </div>
        )}
      </div>

      {/* Buy vs Sell Volume Breakdown */}
      {volumeStats.buyVolume !== undefined && volumeStats.sellVolume !== undefined && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Buy Volume (24h)</div>
            <div className="text-lg font-bold text-green-400">
              {formatVolume(volumeStats.buyVolume)}
            </div>
            <div className="mt-2 w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ 
                  width: `${(volumeStats.buyVolume / (volumeStats.buyVolume + volumeStats.sellVolume)) * 100}%` 
                }}
              />
            </div>
          </div>

          <div className="bg-red-500/10 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Sell Volume (24h)</div>
            <div className="text-lg font-bold text-red-400">
              {formatVolume(volumeStats.sellVolume)}
            </div>
            <div className="mt-2 w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ 
                  width: `${(volumeStats.sellVolume / (volumeStats.buyVolume + volumeStats.sellVolume)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-neutral-500 text-center">
        Updates every 30 seconds • Powered by Moralis API
      </div>
    </div>
  );
}
