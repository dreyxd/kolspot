import { useEffect, useMemo, useState } from 'react'
import { getTrendingTokens, TrendingToken } from '../services/moralis'
import { Link } from 'react-router-dom'
import { getTokenInfo, DexPair } from '../services/dexscreener'

function formatPrice(value?: number) {
  if (value === undefined || value === null || !isFinite(value)) return '-'
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  return `$${value.toPrecision(3)}`
}

function formatPct(value?: number) {
  if (value === undefined || value === null || !isFinite(value)) return '-'
  const fixed = Math.abs(value) < 1 ? value.toPrecision(2) : value.toFixed(2)
  return `${value >= 0 ? '+' : ''}${fixed}%`
}

function formatCompactCurrency(n?: number) {
  if (n === undefined || n === null || !isFinite(n)) return '-'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

export default function TrendingTokens() {
  const [items, setItems] = useState<TrendingToken[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enriched, setEnriched] = useState<Record<string, DexPair | null>>({})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const list = await getTrendingTokens(25)
      if (!mounted) return
      setItems(list)
      if (!list.length) {
        const hasKey = Boolean(import.meta.env.VITE_MORALIS_API_KEY)
        if (!hasKey) setError('Set VITE_MORALIS_API_KEY to enable trending tokens')
      }
      // Enrich with DexScreener for Solana tokens if address present
      const addresses = list
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
    <section className="py-8 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Trending Tokens</h2>
          <div className="text-xs text-neutral-400">Powered by Moralis</div>
        </div>

        {items === null ? (
          <div className="text-neutral-400">Loading trending tokens…</div>
        ) : items.length === 0 ? (
          <div className="text-neutral-400">
            No trending data available right now. {error ? (<span className="text-amber-400">{error}</span>) : null}
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0 px-2">
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
                // Optional link if address exists and your app supports token route by mint/address
                const href = t.address ? `/token/${t.address}` : undefined

                const content = (
                  <div className="card p-4 h-full flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {logo ? (
                        <img src={logo} alt={name} className="w-10 h-10 rounded" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-sm">
                          {symbol ? symbol[0] : '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">{name}</div>
                        {symbol ? <div className="text-xs text-neutral-400">{symbol}</div> : null}
                      </div>
                      <div className="text-xs text-neutral-400">
                        <span className="text-neutral-300">{price}</span>
                        {mcap ? <span className="ml-2">• MC {formatCompactCurrency(mcap)}</span> : <span className="ml-2">• MC -</span>}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${pctUp ? 'text-emerald-400' : 'text-rose-400'}`}>{pctStr}</div>
                  </div>
                )

                return (
                  <div key={idx}>
                    {href ? (
                      <Link to={href} className="block focus:outline-none focus:ring-2 focus:ring-accent rounded-md">{content}</Link>
                    ) : (
                      content
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
