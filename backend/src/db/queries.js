import { query } from '../db/connection.js';

export const saveTransaction = async (transaction) => {
  const {
    walletAddress,
    tokenMint,
    tokenSymbol,
    amount,
    solAmount,
    side = 'BUY',
    timestamp,
    signature
  } = transaction;

  try {
    const result = await query(
      `INSERT INTO kol_transactions 
       (wallet_address, token_mint, token_symbol, amount, sol_amount, side, timestamp, signature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (signature) DO NOTHING
       RETURNING *`,
      [walletAddress, tokenMint, tokenSymbol, amount, solAmount, side, timestamp, signature]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const getKolsCountByToken = async (hoursWindow = 24) => {
  try {
    const result = await query(
      `SELECT 
         token_mint as "tokenMint",
         token_symbol as "tokenSymbol",
         COUNT(DISTINCT wallet_address) as "distinctKolsCount",
         MAX(timestamp) as "mostRecentBuyTimestamp",
         SUM(amount) as "totalVolume"
       FROM kol_transactions
       WHERE timestamp >= NOW() - INTERVAL '${hoursWindow} hours'
       GROUP BY token_mint, token_symbol
       ORDER BY "distinctKolsCount" DESC, "mostRecentBuyTimestamp" DESC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching KOLs count:', error);
    throw error;
  }
};

export const getRecentTransactions = async (limit = 100) => {
  try {
    const result = await query(
      `SELECT 
         wallet_address as "walletAddress",
         token_mint as "tokenMint",
         token_symbol as "tokenSymbol",
         amount,
         sol_amount as "solAmount",
         side,
         timestamp,
         signature
       FROM kol_transactions
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};
