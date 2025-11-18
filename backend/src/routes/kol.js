import express from 'express';
import {
  fetchTransactions,
  parseTransactionForBuys,
  fetchTokenMetadata,
  isPumpFunToken
} from '../services/helius.js';
import { saveTransaction } from '../db/queries.js';
import * as cache from '../utils/cache.js';

const router = express.Router();

/**
 * POST /api/kol/transactions
 * Fetch and store KOL transactions
 */
router.post('/transactions', async (req, res) => {
  try {
    const { walletAddress, tokenFilter } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' });
    }

    // Fetch transactions from Helius
    const transactions = await fetchTransactions(walletAddress);

    // Parse for buy transactions
    const buyTxs = parseTransactionForBuys(walletAddress, transactions);

    // Filter by token if provided
    const filtered = tokenFilter && tokenFilter.length > 0
      ? buyTxs.filter(tx => tokenFilter.includes(tx.tokenSymbol))
      : buyTxs;

    // Fetch metadata for tokens
    const uniqueMints = [...new Set(filtered.map(tx => tx.tokenMint))];
    const metadata = await fetchTokenMetadata(uniqueMints);
    const metadataMap = new Map(
      metadata.map(m => [m.mint || m.account, m])
    );

    // Filter for pump.fun tokens only
    const pumpFunTxs = filtered.filter(tx => 
      isPumpFunToken(metadataMap.get(tx.tokenMint))
    );

    // Save to database
    const saved = [];
    for (const tx of pumpFunTxs) {
      try {
        const result = await saveTransaction({
          walletAddress: tx.walletAddress,
          tokenMint: tx.tokenMint,
          tokenSymbol: tx.tokenSymbol,
          amount: tx.tokenAmount,
          timestamp: tx.timestamp,
          signature: tx.transactionSignature
        });
        if (result) saved.push(result);
      } catch (err) {
        console.error('Error saving transaction:', err);
      }
    }

    // Invalidate cache
    cache.del('kols-count');

    res.json({
      success: true,
      processed: pumpFunTxs.length,
      saved: saved.length,
      transactions: saved
    });

  } catch (error) {
    console.error('Error processing transactions:', error);
    res.status(500).json({ error: 'Failed to process transactions' });
  }
});

export default router;
