import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { live } from '../services/realtime'
import { LeaderboardEntry } from '../types'
import { formatCurrency, formatNumber } from '../utils/format'

type SortKey = 'rank' | 'pnl' | 'totalTrades'

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [filter, setFilter] = useState<'top' | 'active' | 'all'>('top')

  useEffect(() => {
    const off = live.on('leaderboard', (data) => setEntries(data))
    return () => { off() }
  }, [])

  const sorted = useMemo(() => {
    const arr = [...entries]
    if (sortKey === 'rank') arr.sort((a, b) => a.rank - b.rank)
    if (sortKey === 'pnl') arr.sort((a, b) => b.pnl - a.pnl)
    if (sortKey === 'totalTrades') arr.sort((a, b) => b.totalTrades - a.totalTrades)
    return arr
  }, [entries, sortKey])

  const filtered = useMemo(() => {
    if (filter === 'top') return sorted.slice(0, 10)
    if (filter === 'active') return sorted.filter(e => e.totalTrades >= 50)
    return sorted
  }, [sorted, filter])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-white/10 overflow-hidden">
            <button className={`px-3 py-1.5 text-sm ${filter==='top'?'bg-white/10':''}`} onClick={() => setFilter('top')}>Top Performers</button>
            <button className={`px-3 py-1.5 text-sm ${filter==='active'?'bg-white/10':''}`} onClick={() => setFilter('active')}>Most Active</button>
            <button className={`px-3 py-1.5 text-sm ${filter==='all'?'bg-white/10':''}`} onClick={() => setFilter('all')}>All</button>
          </div>
          <select className="bg-surface border border-white/10 rounded-md text-sm px-2 py-1.5" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="rank">Sort by Rank</option>
            <option value="pnl">Sort by PNL</option>
            <option value="totalTrades">Sort by Total Trades</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr className="text-left text-sm text-neutral-400">
              <th className="py-3 pr-3 font-medium">Rank</th>
              <th className="py-3 pr-3 font-medium">KOL</th>
              <th className="py-3 pr-3 font-medium">Total Trades</th>
              <th className="py-3 pr-3 font-medium">Current PNL</th>
              <th className="py-3 pr-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(e => (
              <tr key={e.kol.id} className="table-row-hover">
                <td className="py-3 pr-3 w-16">#{e.rank}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10" />
                    <div>
                      <div className="font-medium">{e.kol.name}</div>
                      <div className="text-xs text-neutral-400">{e.kol.wallet.slice(0,4)}...{e.kol.wallet.slice(-4)}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3">{formatNumber(e.totalTrades)}</td>
                <td className={`py-3 pr-3 ${e.pnl>=0?'text-emerald-400':'text-rose-400'}`}>{formatCurrency(e.pnl)}</td>
                <td className="py-3 pr-3 text-right">
                  <Link to={`/kol/${e.kol.id}`} className="btn btn-outline px-3 py-1 text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
