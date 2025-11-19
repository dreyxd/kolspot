import express from 'express';

const router = express.Router();

/**
 * Legacy endpoints removed.
 * Use /api/terminal/* endpoints instead:
 * - /api/terminal/early-plays
 * - /api/terminal/bonding
 * - /api/terminal/graduated
 * - /api/terminal/token/:mint
 */

// Redirect old endpoints to terminal
router.get('/kols-count', (req, res) => {
  res.status(410).json({ 
    error: 'Endpoint deprecated. Use /api/terminal/early-plays, /api/terminal/bonding, or /api/terminal/graduated instead.' 
  });
});

router.get('/recent-trades', (req, res) => {
  res.status(410).json({ 
    error: 'Endpoint deprecated. Use /api/terminal/* endpoints instead.' 
  });
});

export default router;
 */
router.get('/recent-trades', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const transactions = await getRecentTransactions(limit);
    
    // Four-tier enrichment: Pump.fun -> Jupiter -> DexScreener -> Moralis
    let enriched = await enrichWithPumpFun(transactions);
    
    // Try Jupiter for any still-UNKNOWN tokens
    const stillUnknown1 = enriched.filter(t => t.tokenSymbol === 'UNKNOWN');
    if (stillUnknown1.length > 0) {
      const jupiterEnriched = await enrichWithJupiter(stillUnknown1);
      enriched = enriched.map(t => {
        if (t.tokenSymbol === 'UNKNOWN') {
          const jupiterData = jupiterEnriched.find(d => d.tokenMint === t.tokenMint);
          return jupiterData || t;
        }
        return t;
      });
    }
    
    // Try DexScreener
    const stillUnknown2 = enriched.filter(t => t.tokenSymbol === 'UNKNOWN');
    if (stillUnknown2.length > 0) {
      const dexEnriched = await enrichWithDexScreener(stillUnknown2);
      enriched = enriched.map(t => {
        if (t.tokenSymbol === 'UNKNOWN') {
          const dexData = dexEnriched.find(d => d.tokenMint === t.tokenMint);
          return dexData || t;
        }
        return t;
      });
    }
    
    // Final fallback to Moralis
    const stillUnknown3 = enriched.filter(t => t.tokenSymbol === 'UNKNOWN');
    if (stillUnknown3.length > 0) {
      const moralisEnriched = await enrichWithMoralis(stillUnknown3);
      enriched = enriched.map(t => {
        if (t.tokenSymbol === 'UNKNOWN') {
          const moralisData = moralisEnriched.find(d => d.tokenMint === t.tokenMint);
          return moralisData || t;
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
