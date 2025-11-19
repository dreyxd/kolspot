import express from 'express';
import {
  parseTransactions,
  fetchTokenMetadata
} from '../services/helius.js';
import { enrichTokenMetadata as enrichWithMoralis } from '../services/moralis.js';
import { saveTransaction } from '../db/queries.js';
import { broadcastTransaction } from '../websocket/index.js';
import * as cache from '../utils/cache.js';
import { normalizeMint } from '../utils/mint.js';

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
        const signature = txData.signature;
        
        // Extract wallet addresses involved in the transaction
        const accountKeys = txData.accountData?.map(a => a.account) || [];
        const nativeTransfers = txData.nativeTransfers || [];
        const walletAddresses = new Set([
          ...nativeTransfers.map(nt => nt.fromUserAccount),
          ...nativeTransfers.map(nt => nt.toUserAccount)
        ].filter(Boolean));

        // Parse trades for each wallet address
        let allTrades = [];
        for (const wallet of walletAddresses) {
          const trades = parseTransactions(wallet, [txData]);
          allTrades.push(...trades);
        }

        if (allTrades.length === 0) {
          console.log(`[Webhook] No trades found in ${signature}`);
          continue;
        }

        // Normalize token mints to avoid invalid addresses like '<mint>pump'
        const trades = allTrades.map(t => ({
          ...t,
          tokenMint: normalizeMint(t.tokenMint)
        }));

        console.log(`[Webhook] Found ${trades.length} trade(s) in ${signature}`);

        // Single enrichment pass using Moralis only
        let enrichedTrades = await enrichWithMoralis(trades);

        // Process all trades (BUY and SELL)
        for (const tx of enrichedTrades) {
          try {

            const emoji = tx.side === 'BUY' ? '💰' : '💸';
            console.log(`[Webhook] ${emoji} ${tx.side}: ${tx.tokenSymbol} by ${tx.walletAddress.slice(0, 4)}... (${tx.solAmount.toFixed(2)} SOL)`);

            const transaction = {
              walletAddress: tx.walletAddress,
              tokenMint: normalizeMint(tx.tokenMint),
              tokenSymbol: tx.tokenSymbol,
              amount: tx.tokenAmount,
              solAmount: tx.solAmount,
              side: tx.side,
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
          } catch (err) {
            console.error(`[Webhook] Error processing ${tx.side} trade:`, err);
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
