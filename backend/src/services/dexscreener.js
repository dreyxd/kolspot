const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

export const getTokenInfo = async (mintAddress) => {
  // Check cache first
  const cached = cache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${DEXSCREENER_API}/tokens/${mintAddress}`);
    if (!response.ok) {
      cache.set(mintAddress, { data: null, timestamp: Date.now() });
      return null;
    }

    const data = await response.json();
    
    // Filter for Solana pairs (Pump.fun uses Raydium)
    const solPair = data.pairs?.find(pair => 
      pair.chainId === 'solana' && 
      (pair.dexId === 'raydium' || pair.url?.includes('pump.fun'))
    );

    const result = solPair ? {
      symbol: solPair.baseToken.symbol,
      name: solPair.baseToken.name,
      priceUsd: solPair.priceUsd,
      volume24h: solPair.volume?.h24,
      priceChange24h: solPair.priceChange?.h24,
      liquidity: solPair.liquidity?.usd,
      dexId: solPair.dexId,
      pairAddress: solPair.pairAddress
    } : null;

    cache.set(mintAddress, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.warn(`[DexScreener] Failed to fetch token ${mintAddress}:`, error.message);
    cache.set(mintAddress, { data: null, timestamp: Date.now() });
    return null;
  }
};

export const enrichTokenMetadata = async (trades) => {
  const uniqueMints = [...new Set(trades.map(t => t.tokenMint))];
  
  console.log(`[DexScreener] Enriching metadata for ${uniqueMints.length} tokens...`);
  
  // Fetch in batches with delay to avoid rate limits
  const results = new Map();
  for (const mint of uniqueMints) {
    const info = await getTokenInfo(mint);
    if (info) {
      results.set(mint, info);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Update trades with enriched metadata
  const enriched = trades.map(trade => {
    const info = results.get(trade.tokenMint);
    if (info && trade.tokenSymbol === 'UNKNOWN') {
      return {
        ...trade,
        tokenSymbol: info.symbol,
        tokenName: info.name
      };
    }
    return trade;
  });
  
  const enrichedCount = enriched.filter(t => t.tokenSymbol !== 'UNKNOWN').length;
  console.log(`[DexScreener] Enriched ${enrichedCount}/${trades.length} trades`);
  
  return enriched;
};
