import express from 'express';
import {
  parseTransactions,
  fetchTokenMetadata
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

        const trades = allTrades;

        console.log(`[Webhook] Found ${trades.length} trade(s) in ${signature}`);

        // Fetch metadata for tokens with UNKNOWN symbol
        const unknownTokens = trades
          .filter(t => t.tokenSymbol === 'UNKNOWN')
          .map(t => t.tokenMint);
        
        const tokenMetadataMap = {};
        if (unknownTokens.length > 0) {
          try {
            const uniqueTokens = [...new Set(unknownTokens)];
            const metadata = await fetchTokenMetadata(uniqueTokens);
            metadata.forEach(meta => {
              if (meta.account) {
                tokenMetadataMap[meta.account] = meta.onChainMetadata?.metadata?.data?.symbol || 'UNKNOWN';
              }
            });
          } catch (error) {
            console.error('[Webhook] Error fetching token metadata:', error.message);
          }
        }

        // Process all trades (BUY and SELL)
        for (const tx of trades) {
          try {
            // Update token symbol from metadata if it was UNKNOWN
            if (tx.tokenSymbol === 'UNKNOWN' && tokenMetadataMap[tx.tokenMint]) {
              tx.tokenSymbol = tokenMetadataMap[tx.tokenMint];
            }

            const emoji = tx.side === 'BUY' ? '💰' : '💸';
            console.log(`[Webhook] ${emoji} ${tx.side}: ${tx.tokenSymbol} by ${tx.walletAddress.slice(0, 4)}... (${tx.solAmount.toFixed(2)} SOL)`);

            const transaction = {
              walletAddress: tx.walletAddress,
              tokenMint: tx.tokenMint,
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
