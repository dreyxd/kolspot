// Jupiter API service for token metadata and price data
// Jupiter is a free Solana aggregator with excellent token data
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute for price data

const JUPITER_PRICE_API = 'https://price.jup.ag/v4';
const JUPITER_TOKEN_LIST = 'https://token.jup.ag/all';

let tokenListCache = null;
let tokenListTimestamp = 0;

// Load Jupiter's token list (contains logos, symbols, names)
export const loadTokenList = async () => {
  // Cache for 1 hour
  if (tokenListCache && Date.now() - tokenListTimestamp < 3600000) {
    return tokenListCache;
  }

  try {
    const response = await fetch(JUPITER_TOKEN_LIST);
    if (!response.ok) {
      console.warn(`[Jupiter] Failed to load token list: ${response.status}`);
      return null;
    }

    const tokens = await response.json();
    tokenListCache = new Map(tokens.map(t => [t.address, t]));
    tokenListTimestamp = Date.now();
    console.log(`[Jupiter] Loaded ${tokenListCache.size} tokens`);
    return tokenListCache;
  } catch (error) {
    console.warn(`[Jupiter] Error loading token list:`, error.message);
    return null;
  }
};

// Get token metadata from Jupiter
export const getJupiterTokenInfo = async (mintAddress) => {
  const cached = cache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Load token list if not loaded
    const tokenList = await loadTokenList();
    const tokenInfo = tokenList?.get(mintAddress);

    // Get price data
    const priceResponse = await fetch(`${JUPITER_PRICE_API}/price?ids=${mintAddress}`);
    const priceData = await priceResponse.json();
    const price = priceData.data?.[mintAddress];

    if (!tokenInfo && !price) {
      return null;
    }

    const result = {
      symbol: tokenInfo?.symbol,
      name: tokenInfo?.name,
      decimals: tokenInfo?.decimals,
      logoURI: tokenInfo?.logoURI,
      price: price?.price,
      // Jupiter doesn't provide these, but structure is ready
      liquidity: null,
      volume24h: null,
      priceChange24h: null,
      marketCap: null
    };

    cache.set(mintAddress, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.warn(`[Jupiter] Failed to fetch token ${mintAddress}:`, error.message);
    return null;
  }
};

// Batch price fetching (Jupiter supports up to 100 tokens at once)
export const getBatchPrices = async (mintAddresses) => {
  try {
    const ids = mintAddresses.join(',');
    const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${ids}`);
    
    if (!response.ok) {
      return new Map();
    }

    const data = await response.json();
    return new Map(Object.entries(data.data || {}));
  } catch (error) {
    console.warn(`[Jupiter] Batch price fetch failed:`, error.message);
    return new Map();
  }
};

export const enrichTokenMetadata = async (trades) => {
  const uniqueMints = [...new Set(trades.map(t => t.tokenMint))];
  
  console.log(`[Jupiter] Enriching metadata for ${uniqueMints.length} tokens...`);
  
  // Load token list once
  const tokenList = await loadTokenList();
  
  // Batch fetch prices (Jupiter allows 100 at a time)
  const batchSize = 100;
  const allPrices = new Map();
  
  for (let i = 0; i < uniqueMints.length; i += batchSize) {
    const batch = uniqueMints.slice(i, i + batchSize);
    const prices = await getBatchPrices(batch);
    prices.forEach((value, key) => allPrices.set(key, value));
  }
  
  // Combine token info and prices
  const results = new Map();
  for (const mint of uniqueMints) {
    const tokenInfo = tokenList?.get(mint);
    const priceInfo = allPrices.get(mint);
    
    if (tokenInfo || priceInfo) {
      results.set(mint, {
        symbol: tokenInfo?.symbol,
        name: tokenInfo?.name,
        logoURI: tokenInfo?.logoURI,
        decimals: tokenInfo?.decimals,
        price: priceInfo?.price
      });
    }
  }
  
  // Update trades with enriched metadata
  const enriched = trades.map(trade => {
    const info = results.get(trade.tokenMint);
    if (info) {
      return {
        ...trade,
        tokenSymbol: info.symbol || trade.tokenSymbol,
        tokenName: info.name || trade.tokenName,
        tokenLogoURI: info.logoURI || trade.tokenLogoURI,
        tokenPrice: info.price || trade.tokenPrice
      };
    }
    return trade;
  });
  
  const enrichedCount = enriched.filter(t => t.tokenSymbol && t.tokenSymbol !== 'UNKNOWN').length;
  console.log(`[Jupiter] Enriched ${enrichedCount}/${trades.length} trades`);
  
  return enriched;
};
