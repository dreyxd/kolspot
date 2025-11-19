import express from 'express';
import { getRecentTransactions } from '../db/queries.js';
import { enrichTokenMetadata as enrichWithMoralis } from '../services/moralis.js';
import { enrichMarketCap } from '../services/marketcap.js';
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
    
    // Check cache
    const cacheKey = `terminal-early-plays`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Get recent transactions
    const transactions = await getRecentTransactions(limit);
    
    // Enrich with metadata
    const enriched = await enrichTrades(transactions);
    
    // Group by token
    const tokens = groupByToken(enriched);
    
    // Filter: Market cap < $10K
    const earlyPlays = tokens.filter(t => {
      const marketCap = t.tokenMarketCap || 0;
      return marketCap >= 0 && marketCap < 10000;
    });
    
    // Sort by latest trade
    earlyPlays.sort((a, b) => new Date(b.latestTrade) - new Date(a.latestTrade));
    
    // Cache for 30 seconds
    cache.set(cacheKey, earlyPlays, 30);
    
    res.json(earlyPlays);
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
    if (cached) {
      return res.json(cached);
    }
    
    const transactions = await getRecentTransactions(limit);
    const enriched = await enrichTrades(transactions);
    const tokens = groupByToken(enriched);
    
    // Filter: $10K <= Market cap < $69K (bonding curve)
    const bonding = tokens.filter(t => {
      const marketCap = t.tokenMarketCap || 0;
      return marketCap >= 10000 && marketCap < BONDING_THRESHOLD && !t.isBonded;
    });
    
    bonding.sort((a, b) => new Date(b.latestTrade) - new Date(a.latestTrade));
    
    cache.set(cacheKey, bonding, 30);
    
    res.json(bonding);
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
    if (cached) {
      return res.json(cached);
    }
    
    const transactions = await getRecentTransactions(limit);
    const enriched = await enrichTrades(transactions);
    const tokens = groupByToken(enriched);
    
    // Filter: Market cap >= $69K or bonded status
    const graduated = tokens.filter(t => {
      const marketCap = t.tokenMarketCap || 0;
      return marketCap >= BONDING_THRESHOLD || t.isBonded;
    });
    
    graduated.sort((a, b) => new Date(b.latestTrade) - new Date(a.latestTrade));
    
    cache.set(cacheKey, graduated, 30);
    
    res.json(graduated);
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
    
    // Get all transactions for this token
    const transactions = await getRecentTransactions(500);
    const tokenTxs = transactions.map(t => ({ ...t, tokenMint: normalizeTradesMints([t])[0].tokenMint }))
      .filter(tx => tx.tokenMint === mint);
    
    if (tokenTxs.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    // Enrich
    const enriched = await enrichTrades(tokenTxs);
    const tokens = groupByToken(enriched);
    const tokenData = tokens[0];
    
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
