import { useState, useEffect } from 'react';
import DexScreenerChart from '../components/DexScreenerChart';
import { formatUsdPrice } from '../utils/format';
import { useParams, useNavigate } from 'react-router-dom';

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

interface TokenBuyer {
  walletAddress: string;
  amount: number;
  solAmount: number;
  timestamp: string;
  signature: string;
}

interface TokenDetail {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  tokenLogoURI?: string;
  tokenPrice?: number;
  tokenMarketCap?: number;
  tokenLiquidity?: number;
  isBonded: boolean;
  buyers: TokenBuyer[];
  totalVolume: number;
  tradeCount: number;
  latestTrade: string;
}

interface TokenAnalytics {
  totalLiquidityUsd?: string | number;
  totalFullyDilutedValuation?: string | number;
  totalBuyers?: Record<string, number | string>;
  totalSellers?: Record<string, number | string>;
  totalBuys?: Record<string, number | string>;
  totalSells?: Record<string, number | string>;
}

const TokenDetailPage = () => {
  const { mint } = useParams<{ mint: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [refreshMs, setRefreshMs] = useState<number>(3000); // default 3s

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/terminal/token/${mint}`);
        if (!response.ok) {
          throw new Error('Token not found');
        }
        const data = await response.json();
        setToken(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching token details:', error);
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/terminal/token/${mint}/analytics`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        } else {
          setAnalytics(null);
        }
      } catch (_) {
        setAnalytics(null);
      }
    };

    if (mint) {
      fetchTokenDetails();
      fetchAnalytics();
    }
    // Auto-refresh at configurable interval
    let interval: number | undefined;
    if (mint && refreshMs > 0) {
      interval = window.setInterval(() => {
        fetchTokenDetails();
        fetchAnalytics();
      }, refreshMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mint, refreshMs]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMarketCap = (mc?: number) => {
    if (mc === null || mc === undefined) return 'Unknown';
    if (mc === 0) return '$0';
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

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

  const formatUSD = (v?: string | number) => {
    if (v === undefined || v === null || v === '') return 'Unknown';
    const n = typeof v === 'string' ? Number(v) : v;
    if (!isFinite(n)) return 'Unknown';
    if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n/1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  const shortAddress = (addr: string, start = 6, end = 4) => {
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <div className="text-neutral-400">Loading token details...</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-white text-xl mb-4">Token not found</div>
          <button
            onClick={() => navigate('/terminal')}
            className="px-6 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
          >
            Back to Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/terminal')}
          className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-accent transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Terminal
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Token Info & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header */}
            <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                {token.tokenLogoURI ? (
                  <img
                    src={token.tokenLogoURI}
                    alt={token.tokenSymbol}
                    className="w-20 h-20 rounded-full bg-surface border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent">
                      {token.tokenSymbol?.slice(0, 2) || '??'}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {token.tokenName || token.tokenSymbol}
                  </h1>
                  <div className="text-xl text-accent font-mono mb-3">${token.tokenSymbol}</div>
                  
                  {/* Contract Address */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400 font-mono">
                      {shortAddress(token.tokenMint, 8, 8)}
                    </span>
                    <button
                      onClick={() => copyAddress(token.tokenMint)}
                      className="text-neutral-400 hover:text-accent transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <span className="text-green-400 text-xs">✓ Copied</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <a
                      href={`https://pump.fun/coin/${token.tokenMint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm"
                    >
                      View on Pump.fun →
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Market Cap</div>
                  <div className="text-3xl font-extrabold text-accent tracking-tight">
                    {formatUSD(analytics?.totalFullyDilutedValuation ?? token.tokenMarketCap)}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Price</div>
                  <div className="text-xl font-bold text-white">{formatUsdPrice(token.tokenPrice)}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Liquidity</div>
                  <div className="text-xl font-bold text-accent">
                    {formatUSD(analytics?.totalLiquidityUsd ?? token.tokenLiquidity)}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-bold ${token.isBonded ? 'text-purple-400' : 'text-yellow-400'}`}>
                    {token.isBonded ? '✓ Bonded' : '⏳ Bonding'}
                  </div>
                </div>
              </div>

              {/* Quick Analytics (24h) */}
              {analytics && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/10 rounded p-3">
                    <div className="text-[10px] text-neutral-500">24h Buys</div>
                    <div className="text-sm font-semibold">{(analytics.totalBuys?.['24h'] as any) ?? '-'}</div>
                  </div>
                  <div className="bg-black/10 rounded p-3">
                    <div className="text-[10px] text-neutral-500">24h Sells</div>
                    <div className="text-sm font-semibold">{(analytics.totalSells?.['24h'] as any) ?? '-'}</div>
                  </div>
                  <div className="bg-black/10 rounded p-3">
                    <div className="text-[10px] text-neutral-500">24h Buyers</div>
                    <div className="text-sm font-semibold">{(analytics.totalBuyers?.['24h'] as any) ?? '-'}</div>
                  </div>
                  <div className="bg-black/10 rounded p-3">
                    <div className="text-[10px] text-neutral-500">24h Sellers</div>
                    <div className="text-sm font-semibold">{(analytics.totalSellers?.['24h'] as any) ?? '-'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Public Chart (DexScreener embed) */}
            <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-bold">Price Chart</h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-500">Auto-refresh</label>
                  <select
                    value={refreshMs}
                    onChange={(e) => setRefreshMs(parseInt(e.target.value, 10))}
                    className="bg-black/30 text-sm text-neutral-200 rounded-md px-2 py-1 border border-white/10 focus:outline-none focus:border-accent"
                    title="Change auto-refresh interval"
                 >
                    <option value={0}>Off</option>
                    <option value={3000}>3s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>60s</option>
                  </select>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg overflow-hidden">
                <DexScreenerChart tokenMint={token.tokenMint} height={500} />
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Powered by DexScreener public chart
              </p>
            </div>
          </div>

          {/* Right Column - KOL Buyers */}
          <div className="lg:col-span-1">
            <div className="bg-surface/60 border border-white/10 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">
                KOL Buyers ({token.buyers.length})
              </h2>
              
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {token.buyers.map((buyer, idx) => (
                  <div
                    key={idx}
                    className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-neutral-300">
                        {shortAddress(buyer.walletAddress, 6, 4)}
                      </span>
                      <button
                        onClick={() => copyAddress(buyer.walletAddress)}
                        className="text-neutral-400 hover:text-accent transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-500">Amount:</span>
                      <span className="text-sm font-semibold text-accent">
                        {Number(buyer.solAmount || 0).toFixed(2)} SOL
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-500">Tokens:</span>
                      <span className="text-sm text-white">
                        {buyer.amount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-neutral-400 mb-2">{formatTime(buyer.timestamp)}</div>
                    
                    <a
                      href={`https://solscan.io/tx/${buyer.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline block"
                    >
                      View Transaction →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TokenDetailPage;
