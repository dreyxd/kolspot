export type TrendingToken = {
  address?: string
  name?: string
  symbol?: string
  logo?: string
  price?: number
  priceUsd?: number
  priceChange24h?: number
  pricePercentChange24h?: number
  chain?: string
  chainId?: string | number
  marketCap?: number
  [key: string]: any
}

const BASE_URL = 'https://deep-index.moralis.io/api/v2.2'
const SOLANA_GATEWAY = 'https://solana-gateway.moralis.io'

export async function getTrendingTokens(limit = 25): Promise<TrendingToken[]> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) {
    // No key configured; return empty to avoid failing the UI
    return []
  }
  const url = `${BASE_URL}/tokens/trending?limit=${encodeURIComponent(limit)}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis trending error', res.status, await safeText(res))
      return []
    }
    const data = await res.json()
    // The response shape may be either an array or an object containing a result list.
    if (Array.isArray(data)) return data as TrendingToken[]
    if (data && Array.isArray(data.result)) return data.result as TrendingToken[]
    return []
  } catch (e) {
    console.warn('Moralis trending fetch failed', e)
    return []
  }
}

async function safeText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

// --- Bonding Status (Solana) ---
export type BondingStatus = {
  status?: string
  isBonding?: boolean
  progress?: number
  progressPercent?: number
  progress_percentage?: number
  progress_pct?: number
  [key: string]: any
} | null

export async function getBondingStatus(mint: string): Promise<BondingStatus> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  const url = `${SOLANA_GATEWAY}/token/mainnet/${mint}/bonding-status`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis bonding-status error', mint, res.status)
      return null
    }
    const data = await res.json()
    return data as BondingStatus
  } catch (e) {
    console.warn('Moralis bonding-status failed', mint, e)
    return null
  }
}

// --- Token Holders ---
export interface TokenHolder {
  balance: string
  balanceFormatted: string
  isContract: boolean
  ownerAddress: string
  usdValue?: string
  percentageRelativeToTotalSupply?: string
}

export interface TopHoldersResponse {
  result: TokenHolder[]
  cursor?: string
  page?: number
  pageSize?: number
  totalSupply?: string
}

export async function getTopHolders(mint: string, limit = 10): Promise<TopHoldersResponse | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  const url = `${SOLANA_GATEWAY}/token/mainnet/${mint}/top-holders?limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis top-holders error', mint, res.status)
      return null
    }
    const data = await res.json()
    return data as TopHoldersResponse
  } catch (e) {
    console.warn('Moralis top-holders failed', mint, e)
    return null
  }
}

export interface HolderStats {
  totalHolders: number
}

export async function getHolderStats(mint: string): Promise<HolderStats | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  const url = `${SOLANA_GATEWAY}/token/mainnet/holders/${mint}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis holder-stats error', mint, res.status)
      return null
    }
    const data = await res.json()
    return data as HolderStats
  } catch (e) {
    console.warn('Moralis holder-stats failed', mint, e)
    return null
  }
}

// --- Swap Activity ---
export interface SwapActivity {
  transactionHash: string
  transactionType: 'buy' | 'sell' | 'addLiquidity' | 'removeLiquidity'
  transactionIndex: number
  subCategory?: string
  blockTimestamp: string
  blockNumber: number
  walletAddress: string
  pairAddress?: string
  pairLabel?: string
  exchangeAddress?: string
  exchangeName?: string
  exchangeLogo?: string
  baseToken?: string
  quoteToken?: string
  baseTokenAmount?: string
  quoteTokenAmount?: string
  baseTokenPriceUsd?: number
  quoteTokenPriceUsd?: number
  baseQuotePrice?: string
  totalValueUsd?: number
}

export interface SwapResponse {
  page: number
  pageSize: number
  cursor?: string
  exchangeName?: string
  exchangeLogo?: string
  exchangeAddress?: string
  pairLabel?: string
  pairAddress?: string
  result: SwapActivity[]
}

export async function getSwapsByWallet(
  walletAddress: string,
  limit = 25,
  transactionTypes = 'buy,sell'
): Promise<SwapResponse | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  
  const url = `${SOLANA_GATEWAY}/account/mainnet/${walletAddress}/swaps?limit=${limit}&order=DESC&transactionTypes=${transactionTypes}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis swaps error', walletAddress, res.status)
      return null
    }
    const data = await res.json()
    return data as SwapResponse
  } catch (e) {
    console.warn('Moralis swaps failed', walletAddress, e)
    return null
  }
}

// --- Token Snipers (Security Feature) ---
export interface TokenSniper {
  walletAddress: string
  firstBuyTimestamp: string
  totalBuys: number
  totalSells: number
  totalBuyAmount: string
  totalSellAmount: string
  profitLoss?: number
  isActive: boolean
}

export interface SnipersResponse {
  page: number
  pageSize: number
  result: TokenSniper[]
}

export async function getSnipersByPair(pairAddress: string, limit = 25): Promise<SnipersResponse | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  
  const url = `${SOLANA_GATEWAY}/token/mainnet/pairs/${pairAddress}/snipers?limit=${limit}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis snipers error', pairAddress, res.status)
      return null
    }
    const data = await res.json()
    return data as SnipersResponse
  } catch (e) {
    console.warn('Moralis snipers failed', pairAddress, e)
    return null
  }
}

// --- Pair Statistics ---
export interface PairStats {
  pairAddress: string
  volume24h: number
  volumeChange24h: number
  liquidity: number
  liquidityChange24h: number
  price: number
  priceChange24h: number
  txns24h: number
  buys24h: number
  sells24h: number
  makers24h: number
  priceHigh24h: number
  priceLow24h: number
}

export async function getPairStats(pairAddress: string): Promise<PairStats | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  
  const url = `${SOLANA_GATEWAY}/token/mainnet/pairs/${pairAddress}/stats`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis pair stats error', pairAddress, res.status)
      return null
    }
    const data = await res.json()
    return data as PairStats
  } catch (e) {
    console.warn('Moralis pair stats failed', pairAddress, e)
    return null
  }
}

// --- Token Search ---
export interface TokenSearchResult {
  address: string
  name: string
  symbol: string
  logo?: string
  price?: number
  marketCap?: number
  chain: string
}

export async function searchTokens(query: string, limit = 10): Promise<TokenSearchResult[]> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return []
  
  const url = `${BASE_URL}/tokens/search?query=${encodeURIComponent(query)}&limit=${limit}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis search error', res.status)
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : (data.result || [])
  } catch (e) {
    console.warn('Moralis search failed', e)
    return []
  }
}

// --- Historical Holder Stats ---
export interface HistoricalHolderData {
  timestamp: string
  totalHolders: number
  change: number
}

export async function getHistoricalHolders(mint: string): Promise<HistoricalHolderData[] | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  
  const url = `${SOLANA_GATEWAY}/token/mainnet/holders/${mint}/historical`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis historical holders error', mint, res.status)
      return null
    }
    const data = await res.json()
    return Array.isArray(data.result) ? data.result : null
  } catch (e) {
    console.warn('Moralis historical holders failed', mint, e)
    return null
  }
}

// --- Volume Analytics ---
export interface VolumeStats {
  totalVolume: number
  volumeChange24h: number
  activeWallets: number
  totalTransactions: number
  buyVolume: number
  sellVolume: number
}

export async function getVolumeStatsByChain(chain = 'solana'): Promise<VolumeStats | null> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY as string | undefined
  if (!apiKey) return null
  
  const url = `${BASE_URL}/volume/chains?chain=${chain}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    if (!res.ok) {
      console.warn('Moralis volume stats error', res.status)
      return null
    }
    const data = await res.json()
    return data
  } catch (e) {
    console.warn('Moralis volume stats failed', e)
    return null
  }
}
