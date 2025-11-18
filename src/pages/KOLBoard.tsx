import React, { useEffect, useMemo, useState } from 'react'
import { live } from '../services/realtime'
import { LeaderboardEntry, Trade } from '../types'
import { formatCurrency, formatDate, shortAddress } from '../utils/format'
import { loadKols } from '../services/kols'

// Categorization: Left (1-2 unique KOL buyers), Middle (3-4), Right (5+)

interface BuyTrade extends Trade {}

type CoinEntry = {
  id: string
  name: string
  symbol?: string
  mint?: string
  buyers: Set<string>
  tradeCount: number
  lastTime: number
  buyerTimes: Map<string, number> // Track when each KOL bought
}

// Separate component for coin card to properly handle useState
const CoinCard: React.FC<{ entry: CoinEntry; kols: any[] }> = ({ entry, kols }) => {
  const [copied, setCopied] = useState(false)
  
  const copyAddress = () => {
    if (entry.mint) {
      navigator.clipboard.writeText(entry.mint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Sort buyers by buy time (earliest first) and take top 3
  const buyersArray = Array.from(entry.buyers)
    .map(kolId => ({
      kolId,
      buyTime: entry.buyerTimes.get(kolId) || 0
    }))
    .sort((a, b) => a.buyTime - b.buyTime)
    .slice(0, 3)
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="rounded-lg border border-white/5 bg-surface/60 hover:bg-white/5 transition-colors p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {entry.mint ? (
                <a className="font-medium truncate hover:underline" href={`https://pump.fun/coin/${entry.mint}`} target="_blank" rel="noreferrer">{entry.name}</a>
              ) : (
                <span className="font-medium truncate">{entry.name}</span>
              )}
              {entry.symbol && <span className="text-xs text-neutral-400">({entry.symbol})</span>}
            </div>
            {entry.mint && (
              <div 
                className="text-xs text-neutral-400 truncate cursor-pointer hover:text-accent transition-colors flex items-center gap-1"
                onClick={copyAddress}
                title="Click to copy address"
              >
                {shortAddress(entry.mint, 6, 6)}
                {copied && <span className="text-green-400 text-[10px]">✓ Copied</span>}
              </div>
            )}
            {buyersArray.length > 0 && (
              <div className="text-[10px] mt-2 space-y-1">
                {buyersArray.map(({ kolId, buyTime }) => {
                  const kol = kols.find(k => k.id === kolId)
                  return (
                    <div key={kolId} className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium">
                        {kol?.name || shortAddress(kolId, 4, 0)}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-400">{formatDate(buyTime)}</span>
                    </div>
                  )
                })}
                {entry.buyers.size > 3 && (
                  <div className="px-1.5 py-0.5 text-neutral-400 italic">
                    +{entry.buyers.size - 3} more KOL{entry.buyers.size - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-right ml-3 shrink-0">
            <div className="text-[11px] px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
              {entry.buyers.size} KOL{entry.buyers.size>1?'s':''}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">{entry.tradeCount} buys</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Last: {formatDate(entry.lastTime)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KOLBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [buyTrades, setBuyTrades] = useState<BuyTrade[]>([])
  const [kols, setKols] = useState<any[]>([])

  useEffect(() => {
    loadKols().then(setKols).catch(console.error)
    const offL = live.on('leaderboard', (lb) => setLeaderboard(lb))
    const offT = live.on('trade', (t) => {
      if (t.side === 'BUY') {
        setBuyTrades((prev) => [t, ...prev].slice(0, 3000))
      }
    })
    return () => { offL(); offT() }
  }, [])

  // Build per-coin data structure with unique buyers and capped trades
  const coins = useMemo<CoinEntry[]>(() => {
    const map = new Map<string, CoinEntry>()
    for (const t of buyTrades) {
      const id = t.coinMint || t.coin
      const entry = map.get(id) || {
        id,
        name: t.coinName || t.coin,
        symbol: t.coin !== t.coinName ? t.coin : undefined,
        mint: t.coinMint,
        buyers: new Set<string>(),
        tradeCount: 0,
        lastTime: 0,
        buyerTimes: new Map<string, number>(),
      }
      entry.buyers.add(t.kolId)
      entry.tradeCount += 1
      entry.lastTime = Math.max(entry.lastTime, t.time)
      
      // Track first buy time for each KOL
      if (!entry.buyerTimes.has(t.kolId)) {
        entry.buyerTimes.set(t.kolId, t.time)
      } else {
        // Keep earliest buy time
        entry.buyerTimes.set(t.kolId, Math.min(entry.buyerTimes.get(t.kolId)!, t.time))
      }
      
      map.set(id, entry)
    }
    // Sort by most recent activity
    return Array.from(map.values()).sort((a,b)=>b.lastTime - a.lastTime)
  }, [buyTrades])

  const leftCoins = coins.filter(c => c.buyers.size >= 1 && c.buyers.size <= 2)
  const middleCoins = coins.filter(c => c.buyers.size >= 3 && c.buyers.size <= 4)
  const rightCoins = coins.filter(c => c.buyers.size >= 5)

  const allBuyTrades = buyTrades

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">KOLBoard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (1–2 KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {leftCoins.length ? leftCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (3–4 KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {middleCoins.length ? middleCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (5+ KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {rightCoins.length ? rightCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => document.getElementById('all-trades')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn btn-primary"
        >
          View All KOL Trades
        </button>
      </div>

      <section id="all-trades" className="mt-12">
        <h2 className="text-lg font-semibold mb-4">All Recent BUY Trades</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="py-2 px-3">KOL</th>
                  <th className="py-2 px-3">Coin</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Buy Price</th>
                  <th className="py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allBuyTrades.slice(0, 200).map(t => {
                  const kol = leaderboard.find(l => l.kol.id === t.kolId)
                  return (
                    <tr key={t.id} className="table-row-hover">
                      <td className="py-2 px-3 whitespace-nowrap">{kol?.kol.name || t.kolId}</td>
                      <td className="py-2 px-3">{t.coin}</td>
                      <td className="py-2 px-3">{t.volume}</td>
                      <td className="py-2 px-3">{formatCurrency(t.price)}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{formatDate(t.time)}</td>
                    </tr>
                  )
                })}
                {allBuyTrades.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-neutral-500">No BUY trades yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
