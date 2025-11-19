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
