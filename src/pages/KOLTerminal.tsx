import { useState, useEffect } from 'react';
import { loadKols } from '../services/kols';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

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

const KOLTerminal = () => {
  const navigate = useNavigate();
  const [earlyPlays, setEarlyPlays] = useState<TerminalToken[]>([]);
  const [bonding, setBonding] = useState<TerminalToken[]>([]);
  const [graduated, setGraduated] = useState<TerminalToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [kolNameByWallet, setKolNameByWallet] = useState<Record<string, string>>({});

  const fetchTerminalData = async () => {
    try {
      const [earlyRes, bondingRes, graduatedRes] = await Promise.all([
        fetch(`${backendBaseUrl}/api/terminal/early-plays`),
        fetch(`${backendBaseUrl}/api/terminal/bonding`),
        fetch(`${backendBaseUrl}/api/terminal/graduated`)
      ]);

      const early = await earlyRes.json();
      const bond = await bondingRes.json();
      const grad = await graduatedRes.json();

      setEarlyPlays(early);
      setBonding(bond);
      setGraduated(grad);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching terminal data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminalData();
    // Load KOL names mapping
    (async () => {
      try {
        const kols = await loadKols();
        const map: Record<string, string> = {};
        for (const k of kols) map[k.wallet] = k.name || k.wallet;
        setKolNameByWallet(map);
      } catch {}
    })();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchTerminalData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (mc?: number) => {
    if (mc === null || mc === undefined) return 'Unknown';
    if (mc === 0) return '$0';
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  const formatPrice = (p?: number) => {
    if (p === null || p === undefined) return 'Unknown';
    if (p >= 1) return `$${p.toFixed(4)}`;
    if (p > 0) return `$${p.toExponential(2)}`;
    return 'Unknown';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
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

  const TokenCard = ({ token }: { token: TerminalToken }) => (
    <div
      onClick={() => navigate(`/token/${token.tokenMint}`)}
      className="p-4 rounded-lg border border-white/10 bg-surface/60 hover:bg-white/5 hover:border-accent/50 transition-all cursor-pointer group"
    >
      {/* Token Header */}
      <div className="flex items-start gap-3 mb-3">
        {token.tokenLogoURI ? (
          <img
            src={token.tokenLogoURI}
            alt={token.tokenSymbol}
            className="w-12 h-12 rounded-full bg-surface border border-white/10 shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
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
            <div className="ml-auto text-xs text-neutral-400 font-semibold whitespace-nowrap">
              MC {formatMarketCapShort(token.tokenMarketCap)}
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

      {/* Stats */}
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

      {/* KOL Buyers Preview */}
      <div className="space-y-1">
        <div className="text-[10px] text-neutral-500 uppercase font-semibold">Recent Buyers:</div>
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
      </div>
    </div>
  );

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <div className="text-neutral-400">Loading KOL Terminal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            KOL Terminal
          </h1>
          <p className="text-neutral-400">
            Real-time tracking of tokens bought by Key Opinion Leaders
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-neutral-400">Live Updates</span>
            </div>
            <div className="text-neutral-500">
              New: {earlyPlays.length} | About to Graduate: {bonding.length} | Graduated: {graduated.length}
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TerminalColumn
            title="New Tokens"
            subtitle="Recently listed on Pump.fun"
            tokens={earlyPlays}
            color="from-green-500 to-emerald-500"
          />
          
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

export default KOLTerminal;
