import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatNumber } from '../utils/format'

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

type SortKey = 'rank' | 'totalSol' | 'totalTrades'
type Timeframe = 'daily' | 'weekly' | 'monthly'

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  walletShort: string
  uniqueTokens: number
  totalTrades: number
  totalSolInvested: number
  firstTradeAt: string
  lastTradeAt: string
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [timeframe, setTimeframe] = useState<Timeframe>('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${backendBaseUrl}/api/leaderboard?timeframe=${timeframe}&limit=50`)
        const data = await response.json()
        setEntries(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [timeframe])

  const sorted = useMemo(() => {
    const arr = [...entries]
    if (sortKey === 'rank') arr.sort((a, b) => a.rank - b.rank)
    if (sortKey === 'totalSol') arr.sort((a, b) => b.totalSolInvested - a.totalSolInvested)
    if (sortKey === 'totalTrades') arr.sort((a, b) => b.totalTrades - a.totalTrades)
    return arr
  }, [entries, sortKey])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">KOL Leaderboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-white/10 overflow-hidden">
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe==='daily'?'bg-white/10':''}`} 
              onClick={() => setTimeframe('daily')}
            >
              Daily
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe==='weekly'?'bg-white/10':''}`} 
              onClick={() => setTimeframe('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${timeframe==='monthly'?'bg-white/10':''}`} 
              onClick={() => setTimeframe('monthly')}
            >
              Monthly
            </button>
          </div>
          <select 
            className="bg-surface border border-white/10 rounded-md text-sm px-2 py-1.5" 
            value={sortKey} 
            onChange={e => setSortKey(e.target.value as SortKey)}
          >
            <option value="rank">Sort by Rank</option>
            <option value="totalSol">Sort by SOL Invested</option>
            <option value="totalTrades">Sort by Total Trades</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-center text-neutral-400">Loading leaderboard...</div>
      ) : sorted.length === 0 ? (
        <div className="mt-6 text-center text-neutral-400">No leaderboard data yet. Waiting for KOL trades...</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-sm text-neutral-400">
                <th className="py-3 pr-3 font-medium">Rank</th>
                <th className="py-3 pr-3 font-medium">Wallet</th>
                <th className="py-3 pr-3 font-medium">Unique Tokens</th>
                <th className="py-3 pr-3 font-medium">Total Trades</th>
                <th className="py-3 pr-3 font-medium">SOL Invested</th>
                <th className="py-3 pr-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map(e => (
              <tr key={e.walletAddress} className="table-row-hover">
                <td className="py-3 pr-3 w-16">
                  <div className="flex items-center gap-2">
                    {e.rank === 1 && <span className="text-xl">🥇</span>}
                    {e.rank === 2 && <span className="text-xl">🥈</span>}
                    {e.rank === 3 && <span className="text-xl">🥉</span>}
                    <span>#{e.rank}</span>
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div>
                      <div className="font-medium font-mono">{e.walletShort}</div>
                      <a 
                        href={`https://solscan.io/account/${e.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-400 hover:text-primary-400"
                      >
                        View on Solscan ↗
                      </a>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-neutral-300">{e.uniqueTokens}</td>
                <td className="py-3 pr-3 font-medium">{e.totalTrades}</td>
                <td className="py-3 pr-3">
                  <div className="font-medium text-green-400">
                    {e.totalSolInvested.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-neutral-400">
                    ~${formatNumber(e.totalSolInvested * 137.56)}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <Link 
                    to={`/kol/${e.walletAddress}`}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    View Profile →
                  </Link>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
