import express from 'express';
import {
  parseTransactionForBuys,
  fetchTokenMetadata,
  isPumpFunToken
} from '../services/helius.js';
import { saveTransaction } from '../db/queries.js';
import { broadcastTransaction } from '../websocket/index.js';
import * as cache from '../utils/cache.js';

const router = express.Router();

/**
 * POST /api/webhook/helius
 * Receive webhook notifications from Helius
 */
router.post('/helius', async (req, res) => {
  try {
    // Acknowledge webhook immediately
    res.status(200).json({ received: true });

    const webhookData = req.body;
    
    // Helius sends array of transactions
    const transactions = Array.isArray(webhookData) ? webhookData : [webhookData];

    console.log(`[Webhook] Received ${transactions.length} transaction(s) from Helius`);

    for (const txData of transactions) {
      try {
        // Extract transaction details
        const signature = txData.signature;
        const accountData = txData.accountData || [];
        const nativeTransfers = txData.nativeTransfers || [];
        const tokenTransfers = txData.tokenTransfers || [];

        // Parse for buy transactions
        const buyTxs = parseTransactionForBuys(null, [txData]);

        if (buyTxs.length === 0) {
          console.log(`[Webhook] No buy transactions found in ${signature}`);
          continue;
        }

        // Fetch token metadata
        const uniqueMints = [...new Set(buyTxs.map(tx => tx.tokenMint))];
        const metadata = await fetchTokenMetadata(uniqueMints);
        const metadataMap = new Map(
          metadata.map(m => [m.mint || m.account, m])
        );

        // Filter for pump.fun tokens and broadcast
        for (const tx of buyTxs) {
          const tokenMeta = metadataMap.get(tx.tokenMint);
          
          if (isPumpFunToken(tokenMeta)) {
            console.log(`[Webhook] 🚀 Pump.fun buy detected: ${tx.tokenSymbol} by ${tx.walletAddress.slice(0, 4)}...`);

            const transaction = {
              walletAddress: tx.walletAddress,
              tokenMint: tx.tokenMint,
              tokenSymbol: tx.tokenSymbol,
              amount: tx.tokenAmount,
              timestamp: tx.timestamp,
              signature: tx.transactionSignature
            };

            // Save to database
            await saveTransaction(transaction);

            // Broadcast to WebSocket clients
            await broadcastTransaction(transaction);

            // Invalidate cache
            cache.del('kols-count');
            cache.del('recent-trades');
          } else {
            console.log(`[Webhook] Skipping non-pump.fun token: ${tx.tokenSymbol}`);
          }
        }
      } catch (err) {
        console.error('[Webhook] Error processing transaction:', err);
        // Continue processing other transactions
      }
    }
  } catch (error) {
    console.error('[Webhook] Error handling webhook:', error);
    // Still return 200 to Helius to prevent retries
    if (!res.headersSent) {
      res.status(200).json({ error: 'Processing error' });
    }
  }
});

/**
 * GET /api/webhook/test
 * Test endpoint to verify webhook route is working
 */
router.get('/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
