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
  // Validate mint address
  if (!mintAddress || typeof mintAddress !== 'string' || mintAddress.length < 32) {
    console.warn(`[Moralis] Invalid mint address: ${mintAddress}`);
    return null;
  }

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

    // Use correct Moralis Solana API method
    const response = await Moralis.SolApi.token.getTokenMetadata({
      network: "mainnet",
      addresses: [mintAddress]
    });

    if (response && response.length > 0) {
      const tokenData = response[0];
      const metadata = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        logo: tokenData.logo || tokenData.thumbnail,
        decimals: tokenData.decimals,
        mint: tokenData.mint
      };

      // Cache successful response
      cache.set(cacheKey, { data: metadata, timestamp: Date.now() });
      return metadata;
    }

    return null;
  } catch (error) {
    console.warn(`[Moralis] Error fetching metadata for ${mintAddress}:`, error.message);
    if (error.code) console.warn(`[Moralis] Error code:`, error.code);
    if (error.response) console.warn(`[Moralis] Response:`, error.response);
    return null;
  }
};

// Fetch token price in USD
export const fetchTokenPrice = async (mintAddress) => {
  // Validate mint address
  if (!mintAddress || typeof mintAddress !== 'string' || mintAddress.length < 32) {
    console.warn(`[Moralis] Invalid mint address for price: ${mintAddress}`);
    return null;
  }

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

    // Use Moralis Solana token price endpoint
    const response = await Moralis.SolApi.token.getTokenPrice({
      network: "mainnet",
      address: mintAddress
    });

    if (response && response.usdPrice) {
      const priceData = {
        price: parseFloat(response.usdPrice),
        nativePrice: response.nativePrice,
        exchangeName: response.exchangeName,
        exchangeAddress: response.exchangeAddress
      };
      
      // Cache successful response
      cache.set(cacheKey, { data: priceData.price, timestamp: Date.now() });
      return priceData.price;
    }

    return null;
  } catch (error) {
    console.warn(`[Moralis] Error fetching price for ${mintAddress}:`, error.message);
    if (error.code) console.warn(`[Moralis] Error code:`, error.code);
    return null;
  }
};

// Combined function to fetch both metadata and price (+ attempt market cap)
export const fetchTokenInfo = async (mintAddress) => {
  // Validate mint address early
  if (!mintAddress || typeof mintAddress !== 'string' || mintAddress.length < 32) {
    console.warn(`[Moralis] Skipping invalid mint in fetchTokenInfo: ${mintAddress}`);
    return null;
  }

  try {
    const [metadata, price] = await Promise.all([
      fetchTokenMetadata(mintAddress),
      fetchTokenPrice(mintAddress)
    ]);

    if (!metadata) {
      return null;
    }

    // Attempt market cap derivation if metadata contains supply fields (future-proof)
    const totalSupply = metadata.totalSupply || metadata.supply || null; // Moralis may expose in future
    let marketCap = null;
    if (price && totalSupply) {
      try {
        // If decimals provided, assume supply is raw units
        const adjustedSupply = metadata.decimals ? (Number(totalSupply) / Math.pow(10, metadata.decimals)) : Number(totalSupply);
        marketCap = adjustedSupply * price;
      } catch (_) {
        marketCap = null;
      }
    }

    return {
      symbol: metadata.symbol,
      name: metadata.name,
      logo: metadata.logo,
      decimals: metadata.decimals,
      price: price,
      marketCap
    };
  } catch (error) {
    console.warn(`[Moralis] Error fetching token info for ${mintAddress}:`, error.message);
    if (error.details) console.warn(`[Moralis] Details:`, error.details);
    return null;
  }
};

// Enrich trades with Moralis data
export const enrichTokenMetadata = async (trades) => {
  // Debug: log what we're receiving
  console.log(`[Moralis] Received ${trades.length} trades to enrich`);
  
  // Filter out undefined/null mints
  const allMints = trades.map(t => t.tokenMint);
  const invalidMints = allMints.filter(m => !m || typeof m !== 'string' || m.length < 32);
  
  if (invalidMints.length > 0) {
    console.warn(`[Moralis] Found ${invalidMints.length} invalid mints, skipping them`);
  }
  
  const uniqueMints = [...new Set(allMints.filter(m => m && typeof m === 'string' && m.length >= 32))];
  
  console.log(`[Moralis] Enriching metadata for ${uniqueMints.length} valid tokens...`);
  
  if (uniqueMints.length === 0) {
    console.warn('[Moralis] No valid token mints to enrich');
    return trades;
  }
  
  // Initialize Moralis once before batch processing
  await initializeMoralis();
  
  if (!isInitialized) {
    console.warn('[Moralis] Skipping enrichment - not initialized');
    return trades;
  }
  
  const results = new Map();
  let successCount = 0;
  let errorCount = 0;
  
  // Process tokens with small delay to respect rate limits
  for (const mint of uniqueMints) {
    if (!mint) {
      console.warn('[Moralis] Skipping undefined mint');
      errorCount++;
      continue;
    }
    
    try {
      const info = await fetchTokenInfo(mint);
      if (info && info.symbol && info.symbol !== 'UNKNOWN') {
        results.set(mint, info);
        successCount++;
        console.log(`[Moralis] ✓ Found: ${info.symbol} (${info.name})`);
      } else {
        errorCount++;
      }
    } catch (error) {
      console.warn(`[Moralis] Error processing ${mint}:`, error.message);
      errorCount++;
    }
    // Small delay to avoid rate limiting (2M CU/month = ~66k/day)
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log(`[Moralis] Success: ${successCount}, Errors: ${errorCount}`);
  
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
        tokenDecimals: info.decimals || trade.tokenDecimals,
        tokenMarketCap: info.marketCap || trade.tokenMarketCap
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
