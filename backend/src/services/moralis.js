import Moralis from 'moralis';
import dotenv from 'dotenv';

dotenv.config();

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const cache = new Map();
const CACHE_TTL = 900000; // 15 minutes

let isInitialized = false;

// Initialize Moralis once
const initializeMoralis = async () => {
  if (!isInitialized && MORALIS_API_KEY) {
    try {
      await Moralis.start({ apiKey: MORALIS_API_KEY });
      isInitialized = true;
      console.log('✓ Moralis initialized successfully');
    } catch (error) {
      console.error('[Moralis] Initialization error:', error.message);
    }
  }
};

// Fetch token metadata (name, symbol, logo, decimals)
export const fetchTokenMetadata = async (mintAddress) => {
  // Check cache first
  const cacheKey = `metadata-${mintAddress}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    await initializeMoralis();
    
    if (!isInitialized) {
      console.warn('[Moralis] Not initialized, skipping metadata fetch');
      return null;
    }

    const response = await Moralis.SolApi.token.getTokenMetadata({
      network: "mainnet",
      address: mintAddress
    });

    if (response) {
      const metadata = {
        name: response.name,
        symbol: response.symbol,
        logo: response.logo || response.thumbnail,
        decimals: response.decimals
      };

      // Cache successful response
      cache.set(cacheKey, { data: metadata, timestamp: Date.now() });
      return metadata;
    }

    return null;
  } catch (error) {
    console.warn(`[Moralis] Error fetching metadata for ${mintAddress}:`, error.message);
    return null;
  }
};

// Fetch token price in USD
export const fetchTokenPrice = async (mintAddress) => {
  // Check cache first
  const cacheKey = `price-${mintAddress}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    await initializeMoralis();
    
    if (!isInitialized) {
      console.warn('[Moralis] Not initialized, skipping price fetch');
      return null;
    }

    const response = await Moralis.SolApi.token.getTokenPrice({
      network: "mainnet",
      address: mintAddress
    });

    if (response && response.usdPrice !== undefined) {
      const price = response.usdPrice;
      
      // Cache successful response
      cache.set(cacheKey, { data: price, timestamp: Date.now() });
      return price;
    }

    return null;
  } catch (error) {
    console.warn(`[Moralis] Error fetching price for ${mintAddress}:`, error.message);
    return null;
  }
};

// Combined function to fetch both metadata and price
export const fetchTokenInfo = async (mintAddress) => {
  try {
    const [metadata, price] = await Promise.all([
      fetchTokenMetadata(mintAddress),
      fetchTokenPrice(mintAddress)
    ]);

    if (!metadata) {
      return null;
    }

    return {
      symbol: metadata.symbol,
      name: metadata.name,
      logo: metadata.logo,
      decimals: metadata.decimals,
      price: price
    };
  } catch (error) {
    console.warn(`[Moralis] Error fetching token info for ${mintAddress}:`, error.message);
    return null;
  }
};

// Enrich trades with Moralis data
export const enrichTokenMetadata = async (trades) => {
  const uniqueMints = [...new Set(trades.map(t => t.tokenMint))];
  
  console.log(`[Moralis] Enriching metadata for ${uniqueMints.length} tokens...`);
  
  // Initialize Moralis once before batch processing
  await initializeMoralis();
  
  if (!isInitialized) {
    console.warn('[Moralis] Skipping enrichment - not initialized');
    return trades;
  }
  
  const results = new Map();
  
  // Process tokens with small delay to respect rate limits
  for (const mint of uniqueMints) {
    const info = await fetchTokenInfo(mint);
    if (info) {
      results.set(mint, info);
    }
    // Small delay to avoid rate limiting (2M CU/month = ~66k/day)
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
        tokenLogoURI: info.logo || trade.tokenLogoURI,
        tokenPrice: info.price || trade.tokenPrice,
        tokenDecimals: info.decimals || trade.tokenDecimals
      };
    }
    return trade;
  });
  
  const enrichedCount = enriched.filter(t => t.tokenSymbol && t.tokenSymbol !== 'UNKNOWN').length;
  console.log(`[Moralis] Enriched ${enrichedCount}/${trades.length} trades`);
  
  return enriched;
};

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes
