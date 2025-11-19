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
    return null; // Return null instead of throwing
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
    return []; // Return empty array instead of throwing
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
    return []; // Return empty array instead of throwing
  }
};

// Recent BUY-side transactions for a specific token mint
export const getRecentBuysByMint = async (tokenMint, limit = 10) => {
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
       WHERE token_mint = $1 AND side = 'BUY'
       ORDER BY timestamp DESC
       LIMIT $2`,
      [tokenMint, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent buys by mint:', error);
    return []; // Return empty array instead of throwing
  }
};

// Recent BUY transactions for multiple mints, limited per mint
export const getRecentBuysByMints = async (mints = [], limitPerMint = 10) => {
  if (!Array.isArray(mints) || mints.length === 0) return [];
  try {
    const result = await query(
      `WITH ranked AS (
         SELECT 
           wallet_address as "walletAddress",
           token_mint as "tokenMint",
           token_symbol as "tokenSymbol",
           amount,
           sol_amount as "solAmount",
           side,
           timestamp,
           signature,
           ROW_NUMBER() OVER (PARTITION BY token_mint ORDER BY timestamp DESC) AS rn
         FROM kol_transactions
         WHERE token_mint = ANY($1) AND side = 'BUY'
       )
       SELECT * FROM ranked WHERE rn <= $2
       ORDER BY "tokenMint", timestamp DESC`,
      [mints, limitPerMint]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching recent buys by mints:', error);
    return []; // Return empty array instead of throwing
  }
};
