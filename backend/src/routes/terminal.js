import express from 'express';
import { getRecentTransactions, getRecentBuysByMint, getRecentBuysByMints } from '../db/queries.js';
import { enrichTokenMetadata as enrichWithMoralis, fetchExchangeTokens, fetchTokenAnalytics } from '../services/moralis.js';
import { enrichMarketCap } from '../services/marketcap.js';
import { getPumpTokenInfo } from '../services/pumpfun.js';
import { getTokenInfo as getDexScreenerInfo } from '../services/dexscreener.js';
import * as cache from '../utils/cache.js';
import { normalizeTradesMints } from '../utils/mint.js';

const router = express.Router();

// Bonding curve graduation threshold
const BONDING_THRESHOLD = 69000; // $69K market cap

/**
 * Enrich trades with full metadata using 3-tier system
 * Moralis temporarily disabled due to API issues
 */
async function enrichTrades(transactions) {
  const normalized = normalizeTradesMints(transactions);
  const moralisEnriched = await enrichWithMoralis(normalized);
  return await enrichMarketCap(moralisEnriched);
}

/**
 * Group trades by token and calculate aggregates
 */
function groupByToken(trades) {
  const tokenMap = new Map();
  
  for (const trade of trades) {
    const mint = trade.tokenMint;
    
    if (!tokenMap.has(mint)) {
      tokenMap.set(mint, {
        tokenMint: mint,
        tokenSymbol: trade.tokenSymbol,
        tokenName: trade.tokenName,
        tokenLogoURI: trade.tokenLogoURI,
        tokenPrice: trade.tokenPrice,
        tokenMarketCap: trade.tokenMarketCap,
        tokenLiquidity: trade.tokenLiquidity,
        isBonded: (trade.tokenMarketCap || 0) >= BONDING_THRESHOLD,
        buyers: [],
        totalVolume: 0,
        tradeCount: 0,
        latestTrade: trade.timestamp
      });
    }
    
    const token = tokenMap.get(mint);
    
    // Add buyer info
    token.buyers.push({
      walletAddress: trade.walletAddress,
      amount: trade.amount,
      solAmount: trade.solAmount,
      timestamp: trade.timestamp,
      signature: trade.signature
    });
    
    token.totalVolume += trade.solAmount || 0;
    token.tradeCount += 1;
    
    // Update token-level fields when new info becomes available
    if (trade.tokenPrice && !token.tokenPrice) {
      token.tokenPrice = trade.tokenPrice;
    }
    if (typeof trade.tokenMarketCap === 'number') {
      // Prefer latest non-null market cap
      if (token.tokenMarketCap == null || token.tokenMarketCap === 0) {
        token.tokenMarketCap = trade.tokenMarketCap;
      }
    }
    // Recompute bonded status based on current market cap
    token.isBonded = (token.tokenMarketCap || 0) >= BONDING_THRESHOLD;

    // Update to latest trade time
    if (new Date(trade.timestamp) > new Date(token.latestTrade)) {
      token.latestTrade = trade.timestamp;
    }
  }
  
  return Array.from(tokenMap.values());
}

/**
 * GET /api/terminal/early-plays
 * Tokens with market cap < $10K bought by KOLs
 */
router.get('/early-plays', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const cacheKey = `terminal-early-plays`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Use Moralis gateway: new tokens
    const listings = await fetchExchangeTokens('new', Math.min(limit, 100));
    const mints = listings.map(l => l.tokenMint).filter(Boolean);
    const buyersRows = await getRecentBuysByMints(mints, 10);
    const buyersMap = new Map();
    for (const row of buyersRows) {
      if (!buyersMap.has(row.tokenMint)) buyersMap.set(row.tokenMint, []);
      buyersMap.get(row.tokenMint).push(row);
    }

    const out = listings.map(t => ({
        tokenMint: t.tokenMint,
        tokenSymbol: t.tokenSymbol,
        tokenName: t.tokenName,
        tokenLogoURI: t.tokenLogoURI,
        tokenPrice: t.tokenPrice,
        tokenMarketCap: t.tokenMarketCap,
        tokenLiquidity: t.tokenLiquidity,
        isBonded: false,
        buyers: (buyersMap.get(t.tokenMint) || []).map(b => ({
          walletAddress: b.walletAddress,
          amount: b.amount,
          solAmount: b.solAmount,
          timestamp: b.timestamp,
          signature: b.signature
        })),
        totalVolume: (buyersMap.get(t.tokenMint) || []).reduce((s, b) => s + (b.solAmount || 0), 0),
        tradeCount: (buyersMap.get(t.tokenMint) || []).length,
        latestTrade: (buyersMap.get(t.tokenMint) || [])[0]?.timestamp || t.createdAt || new Date().toISOString()
      }));

    // Only include tokens that have at least one KOL buyer
    const withKols = out.filter(t => t.tradeCount > 0);
    cache.set(cacheKey, withKols, 30);
    res.json(withKols);
  } catch (error) {
    console.error('Error fetching early plays:', error);
    res.status(500).json({ error: 'Failed to fetch early plays' });
  }
});

/**
 * GET /api/terminal/bonding
 * Tokens with market cap >= $10K but not bonded (< $69K)
 */
router.get('/bonding', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const cacheKey = `terminal-bonding`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const listings = await fetchExchangeTokens('bonding', Math.min(limit, 100));
    const mints = listings.map(l => l.tokenMint).filter(Boolean);
    const buyersRows = await getRecentBuysByMints(mints, 10);
    const buyersMap = new Map();
    for (const row of buyersRows) {
      if (!buyersMap.has(row.tokenMint)) buyersMap.set(row.tokenMint, []);
      buyersMap.get(row.tokenMint).push(row);
    }
    const out = listings.map(t => ({
        tokenMint: t.tokenMint,
        tokenSymbol: t.tokenSymbol,
        tokenName: t.tokenName,
        tokenLogoURI: t.tokenLogoURI,
        tokenPrice: t.tokenPrice,
        tokenMarketCap: t.tokenMarketCap,
        tokenLiquidity: t.tokenLiquidity,
        isBonded: false,
        buyers: (buyersMap.get(t.tokenMint) || []).map(b => ({
          walletAddress: b.walletAddress,
          amount: b.amount,
          solAmount: b.solAmount,
          timestamp: b.timestamp,
          signature: b.signature
        })),
        totalVolume: (buyersMap.get(t.tokenMint) || []).reduce((s, b) => s + (b.solAmount || 0), 0),
        tradeCount: (buyersMap.get(t.tokenMint) || []).length,
        latestTrade: (buyersMap.get(t.tokenMint) || [])[0]?.timestamp || new Date().toISOString()
      }));

    const withKols = out.filter(t => t.tradeCount > 0);
    cache.set(cacheKey, withKols, 30);
    res.json(withKols);
  } catch (error) {
    console.error('Error fetching bonding tokens:', error);
    res.status(500).json({ error: 'Failed to fetch bonding tokens' });
  }
});

/**
 * GET /api/terminal/graduated
 * Bonded/migrated tokens (market cap >= $69K or explicitly bonded)
 */
router.get('/graduated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const cacheKey = `terminal-graduated`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const listings = await fetchExchangeTokens('graduated', Math.min(limit, 100));
    const mints = listings.map(l => l.tokenMint).filter(Boolean);
    const buyersRows = await getRecentBuysByMints(mints, 10);
    const buyersMap = new Map();
    for (const row of buyersRows) {
      if (!buyersMap.has(row.tokenMint)) buyersMap.set(row.tokenMint, []);
      buyersMap.get(row.tokenMint).push(row);
    }
    const out = listings.map(t => ({
        tokenMint: t.tokenMint,
        tokenSymbol: t.tokenSymbol,
        tokenName: t.tokenName,
        tokenLogoURI: t.tokenLogoURI,
        tokenPrice: t.tokenPrice,
        tokenMarketCap: t.tokenMarketCap,
        tokenLiquidity: t.tokenLiquidity,
        isBonded: true,
        buyers: (buyersMap.get(t.tokenMint) || []).map(b => ({
          walletAddress: b.walletAddress,
          amount: b.amount,
          solAmount: b.solAmount,
          timestamp: b.timestamp,
          signature: b.signature
        })),
        totalVolume: (buyersMap.get(t.tokenMint) || []).reduce((s, b) => s + (b.solAmount || 0), 0),
        tradeCount: (buyersMap.get(t.tokenMint) || []).length,
        latestTrade: (buyersMap.get(t.tokenMint) || [])[0]?.timestamp || t.graduatedAt || new Date().toISOString()
      }));

    const withKols = out.filter(t => t.tradeCount > 0);
    cache.set(cacheKey, withKols, 30);
    res.json(withKols);
  } catch (error) {
    console.error('Error fetching graduated tokens:', error);
    res.status(500).json({ error: 'Failed to fetch graduated tokens' });
  }
});

/**
 * GET /api/terminal/token/:mint
 * Get detailed information about a specific token
 */
router.get('/token/:mint', async (req, res) => {
  try {
    const { mint: mintParam } = req.params;
    const mint = normalizeTradesMints([{ tokenMint: mintParam }])[0].tokenMint;
    
    const cacheKey = `terminal-token-${mint}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Get KOL transactions for this token (from database)
    const buyerTxs = await getRecentBuysByMint(mint, 100);
    
    // Even if no transactions, fetch token metadata from Moralis
    let tokenData;
    
    if (buyerTxs.length > 0) {
      // We have transactions - enrich them
      const enriched = await enrichTrades(buyerTxs);
      const tokens = groupByToken(enriched);
      tokenData = tokens[0];
    } else {
      // No transactions - fetch metadata with fallback chain: Moralis -> Pump.fun -> DexScreener
      let enrichedToken = null;
      
      // Try Moralis first
      const metadata = await enrichWithMoralis([{ tokenMint: mint }]);
      const withMarketCap = await enrichMarketCap(metadata);
      
      if (withMarketCap.length > 0 && withMarketCap[0].tokenSymbol && withMarketCap[0].tokenSymbol !== 'UNKNOWN') {
        enrichedToken = withMarketCap[0];
      } else {
        // Moralis failed, try Pump.fun
        console.log(`[Terminal] Moralis failed for ${mint}, trying Pump.fun...`);
        const pumpInfo = await getPumpTokenInfo(mint);
        
        if (pumpInfo) {
          enrichedToken = {
            tokenMint: mint,
            tokenSymbol: pumpInfo.symbol,
            tokenName: pumpInfo.name,
            tokenLogoURI: pumpInfo.image,
            tokenPrice: pumpInfo.price,
            tokenMarketCap: pumpInfo.marketCap,
            tokenLiquidity: pumpInfo.liquidity
          };
        } else {
          // Pump.fun failed, try DexScreener
          console.log(`[Terminal] Pump.fun failed for ${mint}, trying DexScreener...`);
          const dexInfo = await getDexScreenerInfo(mint);
          
          if (dexInfo) {
            enrichedToken = {
              tokenMint: mint,
              tokenSymbol: dexInfo.symbol,
              tokenName: dexInfo.name,
              tokenLogoURI: null,
              tokenPrice: dexInfo.priceUsd ? parseFloat(dexInfo.priceUsd) : null,
              tokenMarketCap: null,
              tokenLiquidity: dexInfo.liquidity
            };
          }
        }
      }
      
      if (!enrichedToken) {
        return res.status(404).json({ error: 'Token not found in any data source' });
      }
      
      tokenData = {
        tokenMint: mint,
        tokenSymbol: enrichedToken.tokenSymbol || 'UNKNOWN',
        tokenName: enrichedToken.tokenName || 'Unknown Token',
        tokenLogoURI: enrichedToken.tokenLogoURI,
        tokenPrice: enrichedToken.tokenPrice,
        tokenMarketCap: enrichedToken.tokenMarketCap,
        tokenLiquidity: enrichedToken.tokenLiquidity,
        isBonded: (enrichedToken.tokenMarketCap || 0) >= BONDING_THRESHOLD,
        buyers: [],
        totalVolume: 0,
        tradeCount: 0,
        latestTrade: new Date().toISOString()
      };
    }
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    // Sort buyers by timestamp (most recent first)
    tokenData.buyers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    cache.set(cacheKey, tokenData, 60);
    
    res.json(tokenData);
  } catch (error) {
    console.error('Error fetching token details:', error);
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
});

export default router;

// Optional: token analytics passthrough
router.get('/token/:mint/analytics', async (req, res) => {
  try {
    const { mint } = req.params;
    const data = await fetchTokenAnalytics(mint, 'solana');
    if (!data) return res.status(404).json({ error: 'Analytics unavailable' });
    res.json(data);
  } catch (e) {
    console.error('Error fetching token analytics:', e);
    res.status(500).json({ error: 'Failed to fetch token analytics' });
  }
});
