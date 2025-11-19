// Pump.fun API service for token metadata
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

export const getPumpTokenInfo = async (mintAddress) => {
  // Check cache first
  const cached = cache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Pump.fun API endpoint
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`);
    
    if (!response.ok) {
      console.warn(`[Pump.fun] API error ${response.status} for ${mintAddress}`);
      return null;
    }

    const data = await response.json();
    
    if (!data) {
      return null;
    }

    const tokenData = {
      symbol: data.symbol,
      name: data.name,
      description: data.description,
      image: data.image_uri,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
      marketCap: data.usd_market_cap,
      price: data.usd_market_cap && data.total_supply ? data.usd_market_cap / data.total_supply : null,
      liquidity: data.virtual_sol_reserves ? data.virtual_sol_reserves * 2 : null, // Rough estimate
      creator: data.creator,
      createdAt: data.created_timestamp
    };

    cache.set(mintAddress, { data: tokenData, timestamp: Date.now() });
    return tokenData;
  } catch (error) {
    console.warn(`[Pump.fun] Failed to fetch token ${mintAddress}:`, error.message);
    return null;
  }
};

export const enrichTokenMetadata = async (trades) => {
  const uniqueMints = [...new Set(trades.map(t => t.tokenMint))];
  
  console.log(`[Pump.fun] Enriching metadata for ${uniqueMints.length} tokens...`);
  
  const results = new Map();
  for (const mint of uniqueMints) {
    const info = await getPumpTokenInfo(mint);
    if (info) {
      results.set(mint, info);
    }
    // Small delay to be respectful to API
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Update trades with enriched metadata
  const enriched = trades.map(trade => {
    const info = results.get(trade.tokenMint);
    if (info) {
      return {
        ...trade,
        tokenSymbol: info.symbol || trade.tokenSymbol,
        tokenName: info.name || trade.tokenName,
        tokenLogoURI: info.image || trade.tokenLogoURI,
        tokenMarketCap: info.marketCap || trade.tokenMarketCap,
        tokenPrice: info.price || trade.tokenPrice,
        tokenLiquidity: info.liquidity || trade.tokenLiquidity
      };
    }
    return trade;
  });
  
  const enrichedCount = enriched.filter(t => t.tokenSymbol && t.tokenSymbol !== 'UNKNOWN').length;
  console.log(`[Pump.fun] Enriched ${enrichedCount}/${trades.length} trades`);
  
  return enriched;
};
