import { useState, useEffect } from 'react';
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

const TokenDetailPage = () => {
  const { mint } = useParams<{ mint: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

    if (mint) {
      fetchTokenDetails();
    }
  }, [mint]);

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
    return new Date(timestamp).toLocaleString();
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
                  <div className="text-xl font-bold text-white">
                    {formatMarketCap(token.tokenMarketCap)}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Price</div>
                  <div className="text-xl font-bold text-white">
                    {token.tokenPrice ? `$${token.tokenPrice.toExponential(2)}` : 'N/A'}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Total Volume</div>
                  <div className="text-xl font-bold text-accent">
                    {token.totalVolume.toFixed(2)} SOL
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-bold ${token.isBonded ? 'text-purple-400' : 'text-yellow-400'}`}>
                    {token.isBonded ? '✓ Bonded' : '⏳ Bonding'}
                  </div>
                </div>
              </div>
            </div>

            {/* Moralis Price Chart */}
            <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Price Chart</h2>
              <div className="bg-black/20 rounded-lg overflow-hidden">
                <iframe
                  src={`https://moralis.com/price-chart/?network=solana&address=${token.tokenMint}&theme=dark`}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  className="w-full"
                  title="Token Price Chart"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Powered by Moralis Price Chart Widget
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
                    
                    <div className="text-xs text-neutral-400 mb-2">
                      {formatTime(buyer.timestamp)}
                    </div>
                    
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
