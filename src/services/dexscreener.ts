// DexScreener API integration to fetch real token data
// Helps validate pump.fun tokens and get accurate trading info

interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd?: string
  volume?: {
    h24: number
  }
  priceChange?: {
    h24: number
  }
  liquidity?: {
    usd: number
  }
  pairCreatedAt?: number
}

interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex'
const cache = new Map<string, { data: DexPair | null; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function getTokenInfo(mintAddress: string): Promise<DexPair | null> {
  // Check cache first
  const cached = cache.get(mintAddress)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const response = await fetch(`${DEXSCREENER_API}/tokens/${mintAddress}`)
    if (!response.ok) {
      cache.set(mintAddress, { data: null, timestamp: Date.now() })
      return null
    }

    const data: DexScreenerResponse = await response.json()
    
    // Filter for Solana pump.fun pairs
    // Pump.fun uses Raydium after bonding curve completion
    const pumpPair = data.pairs?.find(pair => 
      pair.chainId === 'solana' && 
      (pair.dexId === 'raydium' || pair.url.includes('pump.fun'))
    )

    cache.set(mintAddress, { data: pumpPair || null, timestamp: Date.now() })
    return pumpPair || null
  } catch (error) {
    console.warn(`[DexScreener] Failed to fetch token ${mintAddress}:`, error)
    cache.set(mintAddress, { data: null, timestamp: Date.now() })
    return null
  }
}

export async function verifyPumpFunToken(mintAddress: string): Promise<boolean> {
  const tokenInfo = await getTokenInfo(mintAddress)
  
  if (!tokenInfo) return false
  
  // Check if it's a pump.fun token by URL or if it's a new Raydium pair (common for pump.fun graduates)
  const isPump = tokenInfo.url.includes('pump.fun') || 
                 (tokenInfo.dexId === 'raydium' && tokenInfo.pairCreatedAt !== undefined && 
                  Date.now() - tokenInfo.pairCreatedAt < 7 * 24 * 60 * 60 * 1000) // Created within last 7 days
  
  return !!isPump
}

export function clearCache() {
  cache.clear()
}
