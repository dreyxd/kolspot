import express from 'express';
import { getKolsCountByToken, getRecentTransactions } from '../db/queries.js';
import { enrichTokenMetadata as enrichWithDexScreener } from '../services/dexscreener.js';
import { enrichTokenMetadata as enrichWithBirdeye } from '../services/birdeye.js';
import * as cache from '../utils/cache.js';

const router = express.Router();

/**
 * GET /api/coins/kols-count
 * Get tokens grouped by distinct KOL buyers count
 */
router.get('/kols-count', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;

    // Check cache first
    const cacheKey = `kols-count-${hours}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    const results = await getKolsCountByToken(hours);

    // Transform to required format
    const formatted = results.map(row => ({
      tokenMint: row.tokenMint,
      tokenSymbol: row.tokenSymbol,
      distinctKolsCount: parseInt(row.distinctKolsCount),
      mostRecentBuyTimestamp: row.mostRecentBuyTimestamp,
      totalVolume: parseFloat(row.totalVolume || 0)
    }));

    // Cache for 60 seconds
    cache.set(cacheKey, formatted, 60);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching KOLs count:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

/**
 * GET /api/coins/recent-trades
 * Get recent buy transactions
 */
router.get('/recent-trades', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const transactions = await getRecentTransactions(limit);
    
    // Enrich with Birdeye (includes logos and rich metadata)
    let enriched = await enrichWithBirdeye(transactions);
    
    // Fallback to DexScreener for any missing data
    const stillUnknown = enriched.filter(t => t.tokenSymbol === 'UNKNOWN');
    if (stillUnknown.length > 0) {
      const dexEnriched = await enrichWithDexScreener(stillUnknown);
      enriched = enriched.map(t => {
        if (t.tokenSymbol === 'UNKNOWN') {
          const dexData = dexEnriched.find(d => d.tokenMint === t.tokenMint);
          return dexData || t;
        }
        return t;
      });
    }

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    res.status(500).json({ error: 'Failed to fetch recent trades' });
  }
});

export default router;
