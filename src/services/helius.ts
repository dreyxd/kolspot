// Basic Helius client: polls enriched transactions for given wallets
// and emits BUY-like events for incoming SPL token transfers.

import type { Trade } from '../types'
import { getTokenInfo } from './dexscreener'

const API_BASE = (import.meta.env.VITE_HELIUS_API_BASE as string) || 'https://api.helius.xyz'
const API_KEY = import.meta.env.VITE_HELIUS_API_KEY as string | undefined
const POLL_MS = Number(import.meta.env.VITE_HELIUS_POLL_MS || 7000)
const TX_LIMIT = Number(import.meta.env.VITE_HELIUS_TX_LIMIT || 30)

type EnrichedTx = {
  signature: string
  timestamp: number
  tokenTransfers?: Array<{
    mint: string // token mint
    fromUserAccount?: string
    toUserAccount?: string
    tokenAmount: number
    symbol?: string
    tokenName?: string
  }>
  nativeTransfers?: Array<{
    fromUserAccount?: string
    toUserAccount?: string
    amount: number // lamports (1 SOL = 1e9 lamports)
  }>
}

// Minimum SOL amount filter (in lamports: 1 SOL = 1_000_000_000 lamports)
const MIN_SOL_AMOUNT = 1_000_000_000 // 1 SOL

const metaCache = new Map<string, { symbol?: string; name?: string; uri?: string; legacyMetadata?: any }>()

// Transaction cache: stores { signature → timestamp } to avoid refetching old txs
const TX_CACHE_KEY = 'helius_tx_cache'
const MAX_CACHE_SIZE = 5000 // Limit cache to prevent localStorage overflow

interface TxCache {
  [signature: string]: number // timestamp in seconds
}

function loadTxCache(): TxCache {
  try {
    const stored = localStorage.getItem(TX_CACHE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveTxCache(cache: TxCache): void {
  try {
    // Prune old entries if cache is too large
    const entries = Object.entries(cache)
    if (entries.length > MAX_CACHE_SIZE) {
      // Keep only the most recent MAX_CACHE_SIZE entries
      entries.sort((a, b) => b[1] - a[1])
      const pruned = Object.fromEntries(entries.slice(0, MAX_CACHE_SIZE))
      localStorage.setItem(TX_CACHE_KEY, JSON.stringify(pruned))
    } else {
      localStorage.setItem(TX_CACHE_KEY, JSON.stringify(cache))
    }
  } catch (e) {
    console.warn('[Helius Cache] Failed to save:', e)
  }
}

async function fetchEnriched(address: string, limit = TX_LIMIT): Promise<EnrichedTx[]> {
  if (!API_KEY) return []
  const url = `${API_BASE}/v0/addresses/${address}/transactions?api-key=${API_KEY}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Helius error ${res.status}`)
  return res.json()
}

async function fetchTokenMetadata(mints: string[]): Promise<void> {
  const toFetch = mints.filter((m) => !metaCache.has(m))
  if (!toFetch.length || !API_KEY) return
  const url = `${API_BASE}/v0/tokens/metadata?api-key=${API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mintAccounts: toFetch }),
  })
  if (!res.ok) return
  const data = await res.json()
  for (const item of data as any[]) {
    const mint = item?.mint || item?.account
    if (!mint) continue
    // Store metadata including URI to identify Pump.fun tokens
    metaCache.set(mint, { 
      symbol: item?.symbol, 
      name: item?.name,
      uri: item?.uri,
      legacyMetadata: item?.legacyMetadata 
    })
  }
}

// Check if a token is a Pump.fun token
function isPumpFunToken(mint: string): boolean {
  const meta = metaCache.get(mint)
  if (!meta) {
    // If we don't have metadata yet, allow it through for now
    // It will be filtered on next pass if metadata confirms it's not pump.fun
    return true
  }
  
  // Pump.fun tokens have metadata URIs containing these patterns
  const uri = meta.uri || meta.legacyMetadata?.uri || ''
  
  // Check for pump.fun IPFS gateway or direct pump.fun references
  if (uri.includes('pump.fun') || 
      uri.includes('cf-ipfs.com') ||
      uri.includes('ipfs.io/ipfs/') && meta.symbol) {
    return true
  }
  
  // Also check if it's a known pump.fun program interaction
  // Pump.fun uses specific program IDs - we can add this check
  const legacyUri = meta.legacyMetadata?.uri || ''
  if (legacyUri.includes('pump.fun') || legacyUri.includes('cf-ipfs.com')) {
    return true
  }
  
  // If metadata exists but no pump.fun indicators, reject
  return false
}

function parseIncomingSplBuys(address: string, txs: EnrichedTx[]): Trade[] {
  const SOL_MINT = 'So11111111111111111111111111111111111111112'
  const buys: Trade[] = []
  for (const tx of txs) {
    // Check if transaction has outgoing SOL transfer (payment) above 1 SOL
    const nativeTransfers = tx.nativeTransfers || []
    const outgoingSol = nativeTransfers
      .filter(nt => nt.fromUserAccount === address)
      .reduce((sum, nt) => sum + (nt.amount || 0), 0)
    
    // Skip transactions with SOL spent below threshold
    if (outgoingSol < MIN_SOL_AMOUNT) {
      continue
    }
    
    const transfers = tx.tokenTransfers || []
    for (const tf of transfers) {
      if (!tf.toUserAccount || tf.toUserAccount !== address) continue
      const mint = tf.mint
      // Skip native SOL wrapping/unwrapping
      if (mint === SOL_MINT) continue
      
      // Only process Pump.fun meme coins
      if (!isPumpFunToken(mint)) {
        console.debug(`[Helius] Skipping non-Pump.fun token: ${mint}`)
        continue
      }
      
      const meta = metaCache.get(mint) || {}
      let symbol = tf.symbol || meta.symbol
      let name = tf.tokenName || meta.name
      const solSpent = (outgoingSol / 1e9).toFixed(2)
      
      // Fetch real token info from DexScreener in background (don't block)
      getTokenInfo(mint).then(dexInfo => {
        if (dexInfo) {
          console.info(`[DexScreener] Verified pump.fun token: ${dexInfo.baseToken.name} (${dexInfo.baseToken.symbol})`)
        }
      }).catch(() => {})
      
      // Log Pump.fun token detection with SOL amount
      console.info(`[Helius] Pump.fun buy detected: ${name || symbol || mint.slice(0, 8)} by ${address.slice(0, 8)} (${solSpent} SOL)`)
      
      buys.push({
        id: `${tx.signature}:${mint}:${address}`,
        kolId: address,
        coin: symbol || mint.slice(0, 6),
        coinMint: mint,
        coinName: name,
        price: outgoingSol / 1e9, // Convert lamports to SOL
        volume: tf.tokenAmount,
        side: 'BUY',
        time: tx.timestamp * 1000,
      })
    }
  }
  return buys
}

export type HeliusWatcher = { stop: () => void }

export async function startHeliusPolling(addresses: string[], onTrades: (t: Trade[]) => void, intervalMs = POLL_MS): Promise<HeliusWatcher> {
  if (!API_KEY) throw new Error('VITE_HELIUS_API_KEY not set')
  let stopped = false
  const seen = new Set<string>()
  
  // Load cached transaction signatures from localStorage
  const txCache = loadTxCache()
  let cacheUpdated = false
  
  // Ultra-conservative rate limiting for Helius free tier
  const BASE_DELAY = 3000 // 3 seconds between each wallet request
  let currentDelay = BASE_DELAY
  const MAX_DELAY = 10000 // Max 10 seconds
  const BACKOFF_MULTIPLIER = 1.5 // Increase delay by 1.5x on 429 errors
  
  console.info(`[Helius] Starting polling for ${addresses.length} KOLs (${BASE_DELAY}ms delay between requests)`)

  async function tick() {
    try {
      const allTxs: EnrichedTx[] = []
      let newTxCount = 0
      let cachedTxCount = 0
      let successCount = 0
      let errorCount = 0
      
      // Process addresses one by one with delay to avoid rate limiting
      for (let i = 0; i < addresses.length; i++) {
        if (stopped) break
        
        const addr = addresses[i]
        try {
          const txs = await fetchEnriched(addr, 30)
          successCount++
          
          // Success: gradually decrease delay back to baseline
          if (currentDelay > BASE_DELAY) {
            currentDelay = Math.max(BASE_DELAY, currentDelay * 0.9)
          }
          
          // Filter out already-cached transactions
          const newTxs = txs.filter(tx => {
            if (txCache[tx.signature]) {
              cachedTxCount++
              return false
            }
            return true
          })
          newTxCount += newTxs.length
          allTxs.push(...newTxs)
          
          // Update cache with new transactions
          newTxs.forEach(tx => {
            txCache[tx.signature] = tx.timestamp
            cacheUpdated = true
          })
          
        } catch (err: any) {
          errorCount++
          const is429 = err.message?.includes('429')
          
          if (is429) {
            // Rate limit hit: increase delay exponentially
            currentDelay = Math.min(MAX_DELAY, currentDelay * BACKOFF_MULTIPLIER)
            console.warn(`[Helius] Rate limit (429) for ${addr.slice(0, 8)}. Increasing delay to ${Math.round(currentDelay)}ms`)
          } else {
            console.warn(`[Helius] Failed to fetch for ${addr.slice(0, 8)}:`, err.message)
          }
        }
        
        // Delay before next request (skip on last iteration)
        if (i < addresses.length - 1 && !stopped) {
          await new Promise(resolve => setTimeout(resolve, currentDelay))
        }
      }
      
      // Save cache periodically if updated
      if (cacheUpdated) {
        saveTxCache(txCache)
        cacheUpdated = false
      }
      
      // Log summary with success/error counts
      console.info(`[Helius] Scan complete: ${successCount}/${addresses.length} wallets, ${errorCount} errors. Cached: ${cachedTxCount}, New: ${newTxCount} txs. Current delay: ${Math.round(currentDelay)}ms`)
      
      const mints = new Set<string>()
      allTxs.forEach((tx) => (tx.tokenTransfers || []).forEach((tf) => tf.mint && mints.add(tf.mint)))
      await fetchTokenMetadata(Array.from(mints))

      const trades: Trade[] = []
      for (const addr of addresses) {
        const addrTx = allTxs.filter((t) => (t.tokenTransfers || []).some((tf) => tf.toUserAccount === addr))
        const parsed = parseIncomingSplBuys(addr, addrTx)
        for (const tr of parsed) {
          if (seen.has(tr.id)) continue
          seen.add(tr.id)
          trades.push(tr)
        }
      }
      if (trades.length) {
        console.info('[Helius] Parsed trades:', trades.length)
        onTrades(trades)
      }
    } catch (e) {
      console.warn('Helius polling error', e)
    } finally {
      if (!stopped) setTimeout(tick, intervalMs)
    }
  }

  tick()

  return { stop() { stopped = true } }
}

// ============================================
// Enhanced Transactions API
// ============================================

export interface EnhancedTransaction {
  signature: string;
  timestamp: number;
  type: string; // e.g., "SWAP", "TRANSFER", "NFT_SALE"
  description: string; // Human-readable description
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
  source?: string; // e.g., "RAYDIUM", "JUPITER"
  fee?: number;
  feePayer?: string;
}

/**
 * Get enhanced transaction data with human-readable parsing
 * @param signature Transaction signature
 * @returns Enhanced transaction data with pre-parsed information
 */
export async function getEnhancedTransaction(signature: string): Promise<EnhancedTransaction | null> {
  if (!API_KEY) {
    console.warn('[Helius] Enhanced Transactions: API key not configured');
    return null;
  }

  try {
    const url = `${API_BASE}/v0/transactions?api-key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions: [signature]
      })
    });

    if (!response.ok) {
      throw new Error(`Enhanced transaction fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('[Helius] Enhanced transaction error:', error);
    return null;
  }
}

/**
 * Get enhanced transactions for multiple signatures
 * @param signatures Array of transaction signatures
 * @returns Array of enhanced transaction data
 */
export async function getEnhancedTransactions(signatures: string[]): Promise<EnhancedTransaction[]> {
  if (!API_KEY) {
    console.warn('[Helius] Enhanced Transactions: API key not configured');
    return [];
  }

  try {
    const url = `${API_BASE}/v0/transactions?api-key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions: signatures
      })
    });

    if (!response.ok) {
      throw new Error(`Enhanced transactions fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('[Helius] Enhanced transactions error:', error);
    return [];
  }
}

/**
 * Get parsed transaction history for a wallet address
 * @param address Wallet address
 * @param limit Number of transactions to fetch (max 100)
 * @param before Optional signature to paginate from
 * @returns Array of enhanced transactions
 */
export async function getWalletTransactions(
  address: string,
  limit: number = 50,
  before?: string
): Promise<EnhancedTransaction[]> {
  if (!API_KEY) {
    console.warn('[Helius] Enhanced Transactions: API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      'api-key': API_KEY,
      limit: Math.min(limit, 100).toString()
    });
    
    if (before) {
      params.append('before', before);
    }

    const url = `${API_BASE}/v0/addresses/${address}/transactions?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Wallet transactions fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('[Helius] Wallet transactions error:', error);
    return [];
  }
}

// ============================================
// Priority Fee API
// ============================================

export interface PriorityFeeEstimate {
  min: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
  unsafeMax: number;
}

/**
 * Get priority fee recommendations for optimal transaction landing
 * @param accountKeys Optional array of account addresses to analyze
 * @returns Priority fee estimates in micro-lamports per compute unit
 */
export async function getPriorityFeeEstimate(accountKeys?: string[]): Promise<PriorityFeeEstimate | null> {
  if (!API_KEY) {
    console.warn('[Helius] Priority Fee API: API key not configured');
    return null;
  }

  try {
    const url = `${API_BASE}/v0/priority-fee?api-key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountKeys: accountKeys || [],
        options: {
          includeAllPriorityFeeLevels: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Priority fee fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.priorityFeeEstimate || null;
  } catch (error) {
    console.error('[Helius] Priority fee error:', error);
    return null;
  }
}
