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
  
  // Must be Solana chain
  if (!chain.includes('solana') && chain !== 'sol' && token.chainId !== 'solana') {
    return false
  }
  
  // Additional meme coin characteristics (optional filters)
  const name = token.name?.toLowerCase() || ''
  const symbol = token.symbol?.toLowerCase() || ''
  
  // If it has an address on Solana, likely valid
  if (token.address && token.address.length > 30) {
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
            🔥 Trending Meme Coins
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0">
                {items.map((t, idx) => {
                  const name = t.name || t.symbol || 'Unknown'
                  const symbol = t.symbol ? t.symbol.toUpperCase() : ''
                  const dex = t.address ? enriched[t.address] : undefined
                  const livePrice = (() => {
                    const p = dex?.priceUsd ? Number(dex.priceUsd) : (t.priceUsd ?? t.price)
                    return typeof p === 'number' ? p : (p ? Number(p) : undefined)
                  })()
                  const price = formatPrice(livePrice)
                  const mcap = dex?.fdv ?? (t.marketCap as number | undefined)
                  const pct = t.pricePercentChange24h ?? t.priceChange24h
                  const pctStr = formatPct(pct)
                  const pctUp = (pct ?? 0) >= 0
                  const logo = t.logo
                  const href = t.address ? `/terminal/token/${t.address}` : undefined
                  
                  // Rank badge for top 3
                  const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null

                  const content = (
                    <div className={`relative group h-full rounded-xl border transition-all duration-300 overflow-hidden ${
                      pctUp 
                        ? 'bg-gradient-to-br from-green-500/5 via-surface/60 to-surface/60 border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10' 
                        : 'bg-gradient-to-br from-red-500/5 via-surface/60 to-surface/60 border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10'
                    }`}>
                      {/* Rank badge for top 3 */}
                      {rankEmoji && (
                        <div className="absolute top-2 right-2 text-2xl z-10 animate-bounce">
                          {rankEmoji}
                        </div>
                      )}
                      
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        pctUp ? 'bg-gradient-to-br from-green-400/5 to-transparent' : 'bg-gradient-to-br from-red-400/5 to-transparent'
                      }`}></div>
                      
                      <div className="relative p-5">
                        {/* Token Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 relative">
                            {logo ? (
                              <div className="relative">
                                <img 
                                  src={logo} 
                                  alt={name} 
                                  className="w-14 h-14 rounded-full ring-2 ring-white/10 group-hover:ring-accent/50 transition-all duration-300"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] font-bold">
                                  #{idx + 1}
                                </div>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-xl font-bold ring-2 ring-white/10">
                                {symbol ? symbol[0] : '?'}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg truncate group-hover:text-accent transition-colors">
                              {name}
                            </div>
                            {symbol && (
                              <div className="text-xs text-neutral-400 font-mono bg-black/30 rounded px-2 py-0.5 inline-block mt-1">
                                ${symbol}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Stats */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="text-sm text-neutral-500">Price</div>
                            <div className="text-white font-bold">{price}</div>
                          </div>
                          
                          <div className="flex items-baseline justify-between">
                            <div className="text-sm text-neutral-500">Market Cap</div>
                            <div className="text-neutral-300 font-semibold text-sm">
                              {mcap ? formatCompactCurrency(mcap) : '-'}
                            </div>
                          </div>

                          {/* 24h Change - Prominent */}
                          <div className={`mt-3 p-3 rounded-lg ${
                            pctUp ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                          }`}>
                            <div className="text-xs text-neutral-400 mb-1">24h Change</div>
                            <div className={`text-2xl font-bold ${pctUp ? 'text-green-400' : 'text-red-400'}`}>
                              {pctUp ? '📈' : '📉'} {pctStr}
                            </div>
                          </div>
                        </div>

                        {/* View Details Button */}
                        {href && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="text-accent text-sm font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                              <span>View Details</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        )}
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
