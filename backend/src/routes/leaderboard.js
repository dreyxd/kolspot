import express from 'express';
import { query } from '../db/connection.js';
import * as cache from '../utils/cache.js';

const router = express.Router();

/**
 * Calculate KOL leaderboard based on actual trading performance
 * Tracks: total trades, winning trades, total SOL invested, estimated PNL
 */
router.get('/', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'daily'; // daily, weekly, monthly
    const limit = parseInt(req.query.limit) || 50;
    
    // Check cache
    const cacheKey = `leaderboard-${timeframe}-${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Calculate time threshold
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // daily
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Query to get KOL trading statistics
    const result = await query(`
      SELECT 
        wallet_address,
        COUNT(DISTINCT token_mint) as unique_tokens,
        COUNT(*) as total_trades,
        SUM(sol_amount) as total_sol_invested,
        MIN(timestamp) as first_trade,
        MAX(timestamp) as last_trade
      FROM transactions
      WHERE timestamp >= $1
      GROUP BY wallet_address
      HAVING COUNT(*) >= 2
      ORDER BY COUNT(*) DESC
      LIMIT $2
    `, [startDate, limit]);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      walletAddress: row.wallet_address,
      walletShort: `${row.wallet_address.slice(0, 6)}`,
      uniqueTokens: parseInt(row.unique_tokens),
      totalTrades: parseInt(row.total_trades),
      totalSolInvested: parseFloat(row.total_sol_invested),
      firstTradeAt: row.first_trade,
      lastTradeAt: row.last_trade,
      // Note: Actual PNL would require tracking token prices at buy/sell
      // For now, we show investment amount as activity indicator
    }));

    // Cache for 2 minutes
    cache.set(cacheKey, leaderboard, 120);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get detailed stats for a specific KOL
 */
router.get('/kol/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const timeframe = req.query.timeframe || 'daily';
    
    // Calculate time threshold
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get all trades for this KOL
    const tradesResult = await query(`
      SELECT 
        token_mint,
        sol_amount,
        token_amount,
        timestamp
      FROM transactions
      WHERE wallet_address = $1
        AND timestamp >= $2
      ORDER BY timestamp DESC
    `, [walletAddress, startDate]);

    // Get unique tokens traded
    const tokensResult = await query(`
      SELECT 
        token_mint,
        COUNT(*) as trade_count,
        SUM(sol_amount) as total_sol,
        MIN(timestamp) as first_buy,
        MAX(timestamp) as last_buy
      FROM transactions
      WHERE wallet_address = $1
        AND timestamp >= $2
      GROUP BY token_mint
      ORDER BY last_buy DESC
    `, [walletAddress, startDate]);

    const stats = {
      walletAddress,
      timeframe,
      totalTrades: tradesResult.rows.length,
      uniqueTokens: tokensResult.rows.length,
      totalSolInvested: tradesResult.rows.reduce((sum, t) => sum + parseFloat(t.sol_amount), 0),
      recentTrades: tradesResult.rows.slice(0, 20).map(t => ({
        tokenMint: t.token_mint,
        solAmount: parseFloat(t.sol_amount),
        tokenAmount: parseFloat(t.token_amount),
        timestamp: t.timestamp
      })),
      tokenBreakdown: tokensResult.rows.map(t => ({
        tokenMint: t.token_mint,
        tradeCount: parseInt(t.trade_count),
        totalSol: parseFloat(t.total_sol),
        firstBuy: t.first_buy,
        lastBuy: t.last_buy
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching KOL stats:', error);
    res.status(500).json({ error: 'Failed to fetch KOL stats' });
  }
});

export default router;
