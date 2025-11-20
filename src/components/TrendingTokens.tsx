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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-glow"></div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Trending Tokens
            </h2>
          </div>
          <p className="text-neutral-400 text-lg">Live market data from Solana's hottest tokens</p>
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {items.slice(0, 8).map((t, idx) => {
                const name = t.name || t.symbol || 'Unknown'
                const symbol = t.symbol ? t.symbol.toUpperCase() : ''
                const dex = t.address ? enriched[t.address] : undefined
            
                // Get price from DexScreener first, fallback to Moralis
                const livePrice = (() => {
                  if (dex?.priceUsd) {
                    const p = Number(dex.priceUsd)
                    if (!isNaN(p) && isFinite(p)) return p
                  }
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
                  <div className="card p-4 relative group hover:scale-[1.02] transition-transform duration-300">
                    {/* Rank badge */}
                    {rankEmoji && (
                      <div className="absolute -top-2 -right-2 text-2xl z-10 drop-shadow-lg">
                        {rankEmoji}
                      </div>
                    )}
                    
                    {/* Token Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {logo ? (
                        <img 
                          src={logo} 
                          alt={name} 
                          className="w-12 h-12 rounded-full ring-2 ring-white/10 group-hover:ring-accent/50 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent-dark/20 flex items-center justify-center text-lg font-bold ring-2 ring-white/10">
                          {symbol ? symbol[0] : '?'}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-white group-hover:text-accent transition-colors">
                          {name}
                        </div>
                        {symbol && (
                          <div className="text-xs text-neutral-400 font-mono truncate">
                            ${symbol}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Price</span>
                        <span className="font-semibold text-white">{price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">24h</span>
                        <span className={`font-semibold ${pctUp ? 'text-green-400' : 'text-red-400'}`}>
                          {pctStr}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">MCap</span>
                        <span className="font-semibold text-white">
                          {mcap ? formatCompactCurrency(mcap) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )

                return (
                  <div key={idx}>
                    {href ? (
                      <Link to={href} className="block">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </div>
                )
              })}
            </div>

            {/* View More */}
            <div className="mt-10 text-center">
              <Link 
                to="/terminal" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 rounded-lg text-accent font-semibold transition-all"
              >
                <span>View All Tokens</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Data Source Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                <span>Live data powered by Moralis</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
