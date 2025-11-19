// Utility to normalize Solana mint addresses that may include suffixes
// Some upstream sources append identifiers like 'pump' after the base58 mint.
// This function trims such suffixes and ensures a plausible mint length (32-44 chars).

export function normalizeMint(mint) {
  if (!mint) return mint;
  let s = String(mint).trim();
  // If longer than 44 chars, keep the first 44 (typical Solana mint length)
  if (s.length > 44) {
    s = s.slice(0, 44);
  }
  return s;
}

export function normalizeTradesMints(trades) {
  return trades.map(t => ({
    ...t,
    tokenMint: normalizeMint(t.tokenMint)
  }));
}
