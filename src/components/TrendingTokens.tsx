import { useEffect, useMemo, useState } from 'react'
import { getTrendingTokens, TrendingToken } from '../services/moralis'
import { Link } from 'react-router-dom'
import { getTokenInfo, DexPair } from '../services/dexscreener'

function formatPrice(value?: number) {
  if (value === undefined || value === null || !isFinite(value)) return '-'
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
  if (value >= 0.01) return `$${value.toFixed(6)}`
  return `$${value.toPrecision(4)}`
}

function formatPct(value?: number) {
  if (value === undefined || value === null || !isFinite(value)) return '-'
  const fixed = Math.abs(value) < 1 ? value.toPrecision(2) : value.toFixed(2)
  return `${value >= 0 ? '+' : ''}${fixed}%`
}

function formatCompactCurrency(n?: number) {
  if (n === undefined || n === null || !isFinite(n)) return '-'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

// Check if token is likely a Solana meme coin
function isSolanaMeme(token: TrendingToken): boolean {
  const chain = token.chain?.toLowerCase() || token.chainId?.toString().toLowerCase() || ''
  const symbol = token.symbol?.toUpperCase() || ''
  const name = token.name?.toUpperCase() || ''
  
  // Filter out specific tokens
  const blockedTokens = ['TRUMP', 'ZCASH', 'ZEC', 'OFFICIAL TRUMP']
  if (blockedTokens.some(blocked => symbol.includes(blocked) || name.includes(blocked))) {
    return false
  }
  
  // Accept if explicitly marked as Solana
  if (chain.includes('solana') || chain === 'sol' || token.chainId === 'solana') {
    return true
  }
  
  // Accept if no chain info provided (Moralis API sometimes omits this for trending tokens)
  // and has a valid Solana address format (32-44 chars base58)
  if (!chain && token.address && token.address.length >= 32 && token.address.length <= 44) {
    return true
  }
  
  // Accept if chain info missing but symbol looks like a typical Solana meme token
  if (!chain && token.symbol && token.symbol.length <= 10) {
    return true
  }
  
  return false
}

export default function TrendingTokens() {
  const [items, setItems] = useState<TrendingToken[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enriched, setEnriched] = useState<Record<string, DexPair | null>>({})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const list = await getTrendingTokens(50) // Fetch more to filter
      if (!mounted) return
      
      // Filter for Solana meme coins only
      const solanaTokens = list.filter(isSolanaMeme)
      
      setItems(solanaTokens.slice(0, 20)) // Take top 20 after filtering
      
      if (!solanaTokens.length) {
        const hasKey = Boolean(import.meta.env.VITE_MORALIS_API_KEY)
        if (!hasKey) setError('Set VITE_MORALIS_API_KEY to enable trending tokens')
      }
      
      // Enrich with DexScreener for Solana tokens if address present
      const addresses = solanaTokens
        .slice(0, 20)
        .map(t => t.address)
        .filter((a): a is string => Boolean(a))

      // Limit concurrency to avoid rate limits
      const concurrency = 6
      const results: Record<string, DexPair | null> = {}
      for (let i = 0; i < addresses.length; i += concurrency) {
        const chunk = addresses.slice(i, i + concurrency)
        const chunkResults = await Promise.all(chunk.map(async (addr) => {
          try {
            const info = await getTokenInfo(addr)
            return [addr, info] as const
          } catch {
            return [addr, null] as const
          }
        }))
        if (!mounted) return
        for (const [addr, info] of chunkResults) {
          results[addr] = info
        }
        setEnriched(prev => ({ ...prev, ...results }))
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const hasAnyEnrichment = useMemo(() => Object.keys(enriched).length > 0, [enriched])

  return (
    <section className="py-12 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-accent">Live on Solana</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-accent to-purple-400 bg-clip-text text-transparent">
            Trending Tokens
          </h2>
          <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
            Real-time trending tokens on Solana network • Updated every minute
          </p>
        </div>

        {items === null ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
            <div className="text-neutral-400">Loading trending tokens...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-neutral-400 mb-2">No Solana meme coins trending right now</div>
            {error && <div className="text-amber-400 text-sm">{error}</div>}
          </div>
        ) : (
          <div className="relative">
            {/* Gradient overlay for scroll indication */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 hidden lg:block"></div>
            
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((t, idx) => {
                  const name = t.name || t.symbol || 'Unknown'
                  const symbol = t.symbol ? t.symbol.toUpperCase() : ''
                  const dex = t.address ? enriched[t.address] : undefined
                  
                  // Get price from DexScreener first, fallback to Moralis
                  const livePrice = (() => {
                    if (dex?.priceUsd) {
                      const p = Number(dex.priceUsd)
                      if (!isNaN(p) && isFinite(p)) return p
                    }
                    // Try various price fields from Moralis
                    const moralPrice = t.priceUsd ?? t.price ?? t.price_usd ?? t.priceNative
                    if (moralPrice !== undefined && moralPrice !== null) {
                      const p = typeof moralPrice === 'number' ? moralPrice : Number(moralPrice)
                      if (!isNaN(p) && isFinite(p)) return p
                    }
                    return undefined
                  })()
                  
                  const price = formatPrice(livePrice)
                  const mcap = dex?.fdv ?? (t.marketCap as number | undefined)
                  const pct = dex?.priceChange?.h24 ?? t.pricePercentChange24h ?? t.priceChange24h ?? t.price_24h_percent_change
                  const pctStr = formatPct(pct)
                  const pctUp = (pct ?? 0) >= 0
                  const logo = t.logo
                  const href = t.address ? `/terminal/token/${t.address}` : undefined
                  
                  // Rank badge for top 3
                  const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null

                  const content = (
                    <div className="relative group h-full rounded-lg border border-white/10 bg-surface/60 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 overflow-hidden">
                      {/* Rank badge for top 3 */}
                      {rankEmoji && (
                        <div className="absolute top-1 right-1 text-sm z-10">
                          {rankEmoji}
                        </div>
                      )}
                      
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/5 to-transparent"></div>
                      
                      <div className="relative p-2.5">
                        {/* Token Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 relative">
                            {logo ? (
                              <img 
                                src={logo} 
                                alt={name} 
                                className="w-8 h-8 rounded-full ring-1 ring-white/10 group-hover:ring-accent/50 transition-all duration-300"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-sm font-bold ring-1 ring-white/10">
                                {symbol ? symbol[0] : '?'}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs truncate group-hover:text-accent transition-colors">
                              {name}
                            </div>
                            {symbol && (
                              <div className="text-[9px] text-neutral-400 font-mono truncate">
                                ${symbol}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Market Cap Only */}
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-neutral-500">Market Cap</div>
                          <div className="text-neutral-300 font-semibold text-[10px]">
                            {mcap ? formatCompactCurrency(mcap) : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )

                  return (
                    <div key={idx} className="transform hover:scale-[1.02] transition-transform duration-300">
                      {href ? (
                        <Link to={href} className="block focus:outline-none focus:ring-2 focus:ring-accent rounded-xl">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom badge */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>Powered by Moralis • Data updates every 60 seconds</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
