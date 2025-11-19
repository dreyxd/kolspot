import { fetchTokenMetadata as heliusFetchTokenMetadata } from './helius.js';

// Enrich trades with supply + market cap using Helius metadata and existing price on trade.
// We assume Moralis enrichment already populated tokenPrice and tokenDecimals.
export const enrichMarketCap = async (trades) => {
  try {
    const uniqueMints = [...new Set(trades.map(t => t.tokenMint).filter(Boolean))];
    if (uniqueMints.length === 0) return trades;

    // Helius batch metadata
    const meta = await heliusFetchTokenMetadata(uniqueMints);
    const metaMap = new Map();

    for (const m of meta || []) {
      // Attempt to locate supply info; structure may vary
      // Common fields seen: supply, tokenInfo.supply, circulatingSupply
      const supplyRaw = m.supply || m.circulatingSupply || m.tokenInfo?.supply || null;
      const decimals = m.decimals || m.tokenInfo?.decimals || null;
      metaMap.set(m.mint, { supplyRaw, decimals });
    }

    return trades.map(trade => {
      const metaEntry = metaMap.get(trade.tokenMint);
      if (!metaEntry) return trade;
      const { supplyRaw, decimals } = metaEntry;
      let marketCap = trade.tokenMarketCap || null;
      let tokenSupply = null;
      if (supplyRaw && trade.tokenPrice) {
        try {
          const supplyAdj = decimals ? (Number(supplyRaw) / Math.pow(10, decimals)) : Number(supplyRaw);
          tokenSupply = supplyAdj;
          marketCap = supplyAdj * trade.tokenPrice;
        } catch (_) {
          // Ignore parse errors
        }
      }
      return {
        ...trade,
        tokenSupply,
        tokenMarketCap: marketCap
      };
    });
  } catch (err) {
    console.warn('[MarketCap] Enrichment failed:', err.message);
    return trades; // graceful fallback
  }
};
