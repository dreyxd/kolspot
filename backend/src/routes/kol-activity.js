import express from 'express';
import * as cache from '../utils/cache.js';

const router = express.Router();

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const SOLANA_GATEWAY = 'https://solana-gateway.moralis.io';

// In-memory storage for KOL wallets (loaded from database or config)
const KOL_WALLETS = [
  { name: 'Cented', wallet: 'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o' },
  { name: 'Walta', wallet: '39q2g5tTQn9n7KnuapzwS2smSx3NGYqBoea11tBjsGEt' },
  { name: 'Gh0stee', wallet: '2kv8X2a9bxnBM8NKLc6BBTX2z13GFNRL4oRotMUJRva9' },
  { name: 'Daumen', wallet: '8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5' },
  { name: 'Coler', wallet: '99xnE2zEFi8YhmKDaikc1EvH6ELTQJppnqUwMzmpLXrs' },
  { name: 'Jijo', wallet: '4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk' },
  { name: 'iconXBT', wallet: '2FbbtmK9MN3Zxkz3AnqoAGnRQNy2SVRaAazq2sFSbftM' },
  { name: 'AdamJae', wallet: '4xUEz1saHSQv1yvo4MhFL3bYM7AVgp7Jq5HhLQwdUeBy' },
  { name: 'Art', wallet: 'BzGtQULS4JC87wKTw2gTvMVxZfVGe1FgZPvJh5N6pump' },
  { name: 'Limfork.eth', wallet: 'HXvV64To8DzBNZaskGPtveziv3r83kN3imXbCcpDpump' }
];

async function fetchSwapsByWallet(walletAddress, limit = 5) {
  if (!MORALIS_API_KEY) return null;
  
  const url = `${SOLANA_GATEWAY}/account/mainnet/${walletAddress}/swaps?limit=${limit}&order=DESC&transactionTypes=buy,sell`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    });
    
    if (!res.ok) {
      console.warn(`[KOL Activity] Moralis error ${res.status} for wallet ${walletAddress}`);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn(`[KOL Activity] Failed to fetch swaps for ${walletAddress}:`, e.message);
    return null;
  }
}

/**
 * GET /api/kol-activity/swaps
 * Get recent swap activity from tracked KOLs
 */
router.get('/swaps', async (req, res) => {
  try {
    const cacheKey = 'kol-activity-swaps';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const allSwaps = [];

    // Fetch swaps for first 10 KOLs
    for (const kol of KOL_WALLETS.slice(0, 10)) {
      try {
        const swapData = await fetchSwapsByWallet(kol.wallet, 5);
        if (swapData?.result) {
          const enriched = swapData.result.map(swap => ({
            ...swap,
            kolName: kol.name,
            kolWallet: kol.wallet
          }));
          allSwaps.push(...enriched);
        }
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[KOL Activity] Error fetching swaps for ${kol.name}:`, error);
      }
    }

    // Sort by timestamp (most recent first)
    allSwaps.sort((a, b) => 
      new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime()
    );

    const result = allSwaps.slice(0, 50);
    
    // Cache for 20 seconds
    cache.set(cacheKey, result, 20);
    
    res.json(result);
  } catch (error) {
    console.error('[KOL Activity] Error fetching KOL swaps:', error);
    res.status(500).json({ error: 'Failed to fetch KOL activity' });
  }
});

export default router;
