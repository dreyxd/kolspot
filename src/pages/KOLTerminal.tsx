import { useState, useEffect, useMemo } from 'react';
import { loadKols } from '../services/kols';
import { formatCurrency, formatUsdPrice } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { getBondingStatus, BondingStatus } from '../services/moralis';
import { subscribeToTerminalUpdates, TokenUpdate } from '../services/terminalWs';
import KOLLiveActivity from '../components/KOLLiveActivity';
import VolumeAnalytics from '../components/VolumeAnalytics';

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

interface TokenBuyer {
  walletAddress: string;
  amount: number;
  solAmount: number;
  timestamp: string;
  signature: string;
}

interface TerminalToken {
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

type SortBy = 'recent' | 'marketcap';

const KOLTerminal = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Record<string, TerminalToken>>({});
  const [loading, setLoading] = useState(true);
  const [kolNameByWallet, setKolNameByWallet] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [bondingStatusByMint, setBondingStatusByMint] = useState<Record<string, BondingStatus>>({});

  // Initial data fetch (once)
  const fetchInitialData = async () => {
    try {
      const [earlyRes, bondingRes, graduatedRes] = await Promise.all([
        fetch(`${backendBaseUrl}/api/terminal/early-plays`),
        fetch(`${backendBaseUrl}/api/terminal/bonding`),
        fetch(`${backendBaseUrl}/api/terminal/graduated`)
      ]);

      const early: TerminalToken[] = await earlyRes.json();
      const bond: TerminalToken[] = await bondingRes.json();
      const grad: TerminalToken[] = await graduatedRes.json();

      const allTokens = [...early, ...bond, ...grad];
      const tokenMap: Record<string, TerminalToken> = {};
      
      allTokens.forEach(token => {
        tokenMap[token.tokenMint] = token;
      });

      setTokens(tokenMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial terminal data:', error);
      setLoading(false);
    }
  };

  // Handle real-time WebSocket updates
  const handleTerminalUpdate = (update: { type: string; data: TokenUpdate }) => {
    if (update.type === 'token_update' && update.data) {
      const { tokenMint, tokenPrice, tokenMarketCap, tokenLiquidity, isBonded, latestTrade, newBuyer } = update.data;
      
      setTokens(prev => {
        const existing = prev[tokenMint];
        if (!existing) return prev; // Token not in our list yet
        
        const updated = { ...existing };
        
        // Update fields if provided
        if (tokenPrice !== undefined) updated.tokenPrice = tokenPrice;
        if (tokenMarketCap !== undefined) updated.tokenMarketCap = tokenMarketCap;
        if (tokenLiquidity !== undefined) updated.tokenLiquidity = tokenLiquidity;
        if (isBonded !== undefined) updated.isBonded = isBonded;
        if (latestTrade) updated.latestTrade = latestTrade;
        
        // Add new buyer if provided
        if (newBuyer) {
          updated.buyers = [newBuyer, ...existing.buyers].slice(0, 10); // Keep last 10
          updated.latestTrade = newBuyer.timestamp;
        }
        
        return {
          ...prev,
          [tokenMint]: updated
        };
      });
    }
  };

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribeToTerminalUpdates(handleTerminalUpdate);
    return unsubscribe;
  }, []);

  // Load initial data and KOL names
  useEffect(() => {
    fetchInitialData();
    
    (async () => {
      try {
        const kols = await loadKols();
        const map: Record<string, string> = {};
        for (const k of kols) map[k.wallet] = k.name || k.wallet;
        setKolNameByWallet(map);
      } catch {}
    })();
  }, []);

  // Categorize and sort tokens based on state
  const { earlyPlays, bonding, graduated } = useMemo(() => {
    const allTokens = Object.values(tokens);
    const now = Date.now();
    const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
    
    let early: TerminalToken[] = [];
    let bond: TerminalToken[] = [];
    let grad: TerminalToken[] = [];

    allTokens.forEach(token => {
      const mc = token.tokenMarketCap || 0;
      const bondingStatus = bondingStatusByMint[token.tokenMint];
      const tokenAge = now - new Date(token.latestTrade).getTime();
      
      // Skip tokens older than 8 hours OR below 15K market cap
      if (tokenAge > EIGHT_HOURS_MS || mc < 15000) {
        return;
      }
      
      // Graduated: 57K+ market cap AND bonding complete
      if (mc >= 57000 && (bondingStatus?.complete || token.isBonded)) {
        grad.push(token);
      } 
      // About to Graduate: 10K-57K market cap (not yet graduated)
      else if (mc >= 10000 && mc < 57000 && !bondingStatus?.complete && !token.isBonded) {
        bond.push(token);
      } 
      // New token: < 10K market cap
      else if (mc < 10000) {
        early.push(token);
      }
    });

    // Sort function based on selected sort mode
    const sortFn = sortBy === 'marketcap'
      ? (a: TerminalToken, b: TerminalToken) => (b.tokenMarketCap || 0) - (a.tokenMarketCap || 0)
      : (a: TerminalToken, b: TerminalToken) => {
          const ta = new Date(a.latestTrade).getTime() || 0;
          const tb = new Date(b.latestTrade).getTime() || 0;
          return tb - ta;
        };

    early.sort(sortFn);
    bond.sort(sortFn);
    grad.sort(sortFn);

    return { earlyPlays: early, bonding: bond, graduated: grad };
  }, [tokens, sortBy, bondingStatusByMint]);

  // Enrich visible tokens with bonding status
  useEffect(() => {
    const mints = Object.keys(tokens).filter(m => !bondingStatusByMint[m]);
    if (mints.length === 0) return;
    
    let cancelled = false;
    const run = async () => {
      const concurrency = 6;
      for (let i = 0; i < mints.length && !cancelled; i += concurrency) {
        const chunk = mints.slice(i, i + concurrency);
        const results = await Promise.all(chunk.map(async (mint) => {
          try {
            const bs = await getBondingStatus(mint);
            return [mint, bs] as const;
          } catch {
            return [mint, null] as const;
          }
        }));
        if (cancelled) return;
        setBondingStatusByMint(prev => {
          const next = { ...prev };
          for (const [mint, bs] of results) next[mint] = bs;
          return next;
        });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [tokens]);

  const formatMarketCap = (mc?: number) => {
    if (mc === null || mc === undefined) return 'Unknown';
    if (mc === 0) return '$0';
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  const formatPrice = (p?: number) => {
    return formatUsdPrice(p);
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

  const shortAddress = (addr: string, start = 4, end = 4) => {
    return `${addr.slice(0, start)}...${addr.slice(-end)}`;
  };

  const formatMarketCapShort = (mc?: number) => {
    if (mc === null || mc === undefined) return 'Unknown';
    if (mc >= 1_000_000) return `${(mc/1_000_000).toFixed(1)}M`;
    if (mc >= 1_000) return `${(mc/1_000).toFixed(0)}K`;
    return mc.toFixed(0);
  };

  const nameOrShort = (w: string) => kolNameByWallet[w] || shortAddress(w, 6, 4);
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const deriveBondingBadge = (mint: string, fallbackIsBonded: boolean) => {
    const bs = bondingStatusByMint[mint];
    
    // If no bonding status data is available yet, return null (don't show badge)
    if (!bs) return null;
    
    const raw = bs || {};
    const status = (typeof raw === 'object' && raw && 'status' in raw) ? String((raw as any).status) : undefined;
    const progressKeys = ['progress', 'progressPercent', 'progress_percentage', 'progress_pct'];
    let progress: number | undefined;
    for (const k of progressKeys) {
      const v = (raw as any)[k];
      if (typeof v === 'number' && isFinite(v)) { progress = v; break; }
    }
    
    // Check if bonding is complete
    if ((raw as any)?.complete === true || (status && /graduat|complete|migrat/i.test(status))) {
      return { label: 'Graduated', className: 'bg-purple-500/15 text-purple-300 border-purple-400/20' };
    }
    
    // Check if currently bonding
    const isBonding = /bond/i.test(status || '') || (raw as any)?.isBonding === true || progress !== undefined;
    
    if (isBonding) {
      const pct = progress !== undefined ? Math.max(0, Math.min(100, progress)) : undefined;
      return { label: pct !== undefined ? `Bonding ${pct.toFixed(0)}%` : 'Bonding', className: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/20' };
    }
    
    // No clear status - don't show badge
    return null;
  };

  const TokenCard = ({ token }: { token: TerminalToken }) => {
    const badge = deriveBondingBadge(token.tokenMint, token.isBonded);
    const borderClass = badge?.label.includes('Bonding')
      ? 'border-yellow-400/30 hover:border-yellow-400/60'
      : badge?.label === 'Graduated'
      ? 'border-purple-400/30 hover:border-purple-400/60'
      : 'border-white/10 hover:border-accent/50';
    
    return (
      <div
        onClick={() => navigate(`/token/${token.tokenMint}`)}
        className={`p-4 rounded-lg border ${borderClass} bg-surface/60 hover:bg-white/5 transition-all cursor-pointer group`}
      >
        <div className="flex items-start gap-3 mb-3">
          {token.tokenLogoURI ? (
            <img
              src={token.tokenLogoURI}
              alt={token.tokenSymbol}
              className="w-12 h-12 rounded-full bg-surface border border-white/10 shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-accent">
                {token.tokenSymbol?.slice(0, 2) || '??'}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-white truncate group-hover:text-accent transition-colors">
                {token.tokenName || token.tokenSymbol}
              </div>
              <div className="ml-auto whitespace-nowrap flex items-center gap-2">
                {badge && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs ${badge.className}`}>
                    {badge.label}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 border border-white/10 shadow-sm">
                  <span className="text-[10px] uppercase tracking-wide text-neutral-400">MC</span>
                  <span className="text-sm font-extrabold text-accent tracking-tight">
                    {formatMarketCapShort(token.tokenMarketCap)}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-accent font-mono">${token.tokenSymbol}</div>
              <button
                onClick={(e) => { e.stopPropagation(); copyToClipboard(token.tokenMint); }}
                title="Copy mint address"
                className="text-xs text-neutral-400 hover:text-accent"
              >
                Copy
              </button>
              <span className="text-[10px] text-neutral-500 font-mono">{shortAddress(token.tokenMint, 6, 6)}</span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {formatTime(token.latestTrade)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-black/20 rounded p-2">
            <div className="text-[10px] text-neutral-500">Price</div>
            <div className="text-sm font-semibold text-white">
              {formatPrice(token.tokenPrice)}
            </div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-[10px] text-neutral-500">Liquidity</div>
            <div className="text-sm font-semibold text-accent">
              {typeof token.tokenLiquidity === 'number' ? formatCurrency(token.tokenLiquidity) : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-neutral-500 uppercase font-semibold">Recent KOL Bought</div>
          {token.buyers.slice(0, 3).map((buyer, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono">
                {nameOrShort(buyer.walletAddress)}
              </span>
              <span className="text-accent font-semibold">
                {Number(buyer.solAmount || 0).toFixed(2)} SOL
              </span>
            </div>
          ))}
          {token.buyers.length > 3 && (
            <div className="text-[10px] text-neutral-500 italic">
              +{token.buyers.length - 3} more
            </div>
          )}
          {token.buyers[0] && (
            <div className="text-[10px] text-neutral-500">{formatTime(token.buyers[0].timestamp)}</div>
          )}
        </div>
      </div>
    );
  };

  const TerminalColumn = ({ 
    title, 
    subtitle, 
    tokens, 
    color 
  }: { 
    title: string; 
    subtitle: string; 
    tokens: TerminalToken[]; 
    color: string;
  }) => (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
        <p className="text-sm text-neutral-400">{subtitle}</p>
        <div className={`mt-2 h-1 w-20 rounded-full bg-gradient-to-r ${color}`}></div>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
        {tokens.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-4xl mb-2">👀</div>
            <div>No tokens yet</div>
          </div>
        ) : (
          tokens.map(token => <TokenCard key={token.tokenMint} token={token} />)
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <div className="text-neutral-400">Loading KOL Terminal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            KOL Terminal
          </h1>
          <p className="text-neutral-400">
            Real-time tracking of tokens bought by Key Opinion Leaders
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-neutral-400">Live Updates via WebSocket</span>
            </div>
            <div className="text-neutral-500">
              About to Graduate: {bonding.length} | Graduated: {graduated.length}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-neutral-500">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-black/30 text-sm text-neutral-200 rounded-md px-2 py-1 border border-white/10 focus:outline-none focus:border-accent"
              >
                <option value="recent">Recent KOL Buy</option>
                <option value="marketcap">Highest Market Cap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Volume Analytics */}
        <div className="mb-6">
          <VolumeAnalytics />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KOL Live Activity */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1">KOL Live Activity</h2>
              <p className="text-sm text-neutral-400">
                Real-time swap activity from 10 tracked KOLs
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Cented • Walta • Gh0stee • Daumen • Coler • Jijo • iconXBT • AdamJae • Art • Limfork.eth
              </p>
              <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            </div>
            
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
              <KOLLiveActivity />
            </div>
          </div>
          
          <TerminalColumn
            title="About to Graduate"
            subtitle="On bonding curve"
            tokens={bonding}
            color="from-yellow-500 to-orange-500"
          />
          
          <TerminalColumn
            title="Graduated Tokens"
            subtitle="Already graduated"
            tokens={graduated}
            color="from-purple-500 to-pink-500"
          />
        </div>
      </div>

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

export default KOLTerminal;
