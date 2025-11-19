const BIRDEYE_API_KEY = '9ff65e0b479d4f56ba662de5a441a4ee';
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

export const getTokenMetadata = async (mintAddress) => {
  // Check cache first
  const cached = cache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/token_overview?address=${mintAddress}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
          'x-chain': 'solana'
        }
      }
    );

    if (!response.ok) {
      // Don't cache 401 (auth) or 429 (rate limit) errors - let them retry or fall through to DexScreener
      if (response.status === 401) {
        console.warn(`[Birdeye] Authentication failed (401) - API key may be invalid`);
        return null;
      }
      if (response.status === 429) {
        console.warn(`[Birdeye] Rate limit exceeded (429) for ${mintAddress}`);
        return null;
      }
      console.warn(`[Birdeye] API error ${response.status} for ${mintAddress}`);
      return null;
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.warn(`[Birdeye] No data returned for ${mintAddress}`);
      return null;
    }

    const tokenData = {
      address: result.data.address,
      symbol: result.data.symbol,
      name: result.data.name,
      decimals: result.data.decimals,
      logoURI: result.data.logoURI,
      price: result.data.price,
      liquidity: result.data.liquidity,
      volume24h: result.data.v24hUSD,
      priceChange24h: result.data.v24hChangePercent,
      mc: result.data.mc, // Market cap
      holder: result.data.holder,
      extensions: result.data.extensions
    };

    cache.set(mintAddress, { data: tokenData, timestamp: Date.now() });
    return tokenData;
  } catch (error) {
    console.error(`[Birdeye] Failed to fetch token ${mintAddress}:`, error.message);
    return null;
  }
};

export const enrichTokenMetadata = async (trades) => {
  const uniqueMints = [...new Set(trades.map(t => t.tokenMint))];
  
  console.log(`[Birdeye] Enriching metadata for ${uniqueMints.length} tokens...`);
  
  // Fetch with delay to respect rate limits
  const results = new Map();
  let successCount = 0;
  let rateLimitHit = false;
  
  for (const mint of uniqueMints) {
    // Skip further Birdeye calls if we hit rate limit
    if (rateLimitHit) {
      console.log(`[Birdeye] Skipping remaining tokens due to rate limit`);
      break;
    }
    
    const info = await getTokenMetadata(mint);
    if (info) {
      results.set(mint, info);
      successCount++;
    }
    // Reduced delay to 100ms for better performance
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Update trades with enriched metadata
  const enriched = trades.map(trade => {
    const info = results.get(trade.tokenMint);
    if (info) {
      return {
        ...trade,
        tokenSymbol: info.symbol || trade.tokenSymbol,
        tokenName: info.name || trade.tokenName,
        tokenLogoURI: info.logoURI,
        tokenPrice: info.price,
        tokenLiquidity: info.liquidity,
        tokenVolume24h: info.volume24h,
        tokenPriceChange24h: info.priceChange24h,
        tokenMarketCap: info.mc
      };
    }
    return trade;
  });
  
  const enrichedCount = enriched.filter(t => t.tokenLogoURI).length;
  console.log(`[Birdeye] Enriched ${enrichedCount}/${trades.length} trades with metadata`);
  
  return enriched;
};
