import { LeaderboardEntry, Kol, PnlPoint, Trade } from '../types'
import { loadKols } from './kols'
import { startHeliusPolling } from './helius'
import { tradeStore } from './tradeStore'

type Listener<T> = (data: T) => void

class Emitter<T> {
  private listeners = new Set<Listener<T>>()
  on(fn: Listener<T>) { this.listeners.add(fn); return () => this.off(fn) }
  off(fn: Listener<T>) { this.listeners.delete(fn) }
  emit(data: T) { 
    this.listeners.forEach(l => l(data))
    // Also store trades in persistent store
    if ((data as any).side) {
      tradeStore.addTrade(data as Trade)
    }
  }
}

export type LiveEvents = {
  trade: Trade
  leaderboard: LeaderboardEntry[]
  pnl: { kolId: string; series: PnlPoint[] }
}

export class LiveService {
  private ws?: WebSocket
  private sse?: EventSource
  private emitters = {
    trade: new Emitter<Trade>(),
    leaderboard: new Emitter<LeaderboardEntry[]>(),
    pnl: new Emitter<{ kolId: string; series: PnlPoint[] }>(),
  }
  private interval?: number

  constructor() {
    const wsUrl = import.meta.env.VITE_WS_URL as string | undefined
    const sseUrl = import.meta.env.VITE_SSE_URL as string | undefined
    const heliusKey = import.meta.env.VITE_HELIUS_API_KEY as string | undefined
    const useHelius = import.meta.env.VITE_USE_HELIUS === 'true'
    
    if (wsUrl) this.connectWS(wsUrl)
    else if (sseUrl) this.connectSSE(sseUrl)
    else if (useHelius && heliusKey) this.startHelius()
    else this.startMock()
  }

  on<K extends keyof LiveEvents>(ev: K, fn: Listener<LiveEvents[K]>) {
    // @ts-ignore
    return this.emitters[ev].on(fn)
  }

  private connectWS(url: string) {
    this.ws = new WebSocket(url)
    this.ws.onmessage = (msg) => {
      try {
        const { type, data } = JSON.parse(msg.data)
        this.route(type, data)
      } catch { /* noop */ }
    }
  }

  private connectSSE(url: string) {
    this.sse = new EventSource(url)
    this.sse.onmessage = (ev) => {
      try {
        const { type, data } = JSON.parse(ev.data)
        this.route(type, data)
      } catch { /* noop */ }
    }
  }

  private route(type: string, data: any) {
    if (type === 'trade') this.emitters.trade.emit(data as Trade)
    if (type === 'leaderboard') this.emitters.leaderboard.emit(data as LeaderboardEntry[])
    if (type === 'pnl') this.emitters.pnl.emit(data as { kolId: string; series: PnlPoint[] })
  }

  // Mock data generator for local development
  private async startMock() {
    const userKols = await loadKols()
    const kols: Kol[] = userKols.length ? userKols : Array.from({ length: 12 }).map((_, i) => ({
      id: `kol_${i + 1}`,
      name: `KOL ${i + 1}`,
      wallet: `SoLaNaWalLet${(1000 + i).toString(16)}${(2000 + i).toString(16)}`,
      avatarUrl: undefined,
    }))

    // Sample pump.fun tokens (all mints ending with 'pump')
    const tokens = [
      { mint: '7HkZy8Aq7uN7zQadpMf8k9mvxXYXpump', symbol: 'DOGS', name: 'Dogs of Sol' },
      { mint: '9JfGk3tAn2wUqkQkZ8P9g7pQmYXpump', symbol: 'PEPE', name: 'Pepe Sol' },
      { mint: '3kPwZ9oLm1rR9vKz2Uu88YxKkMnpump', symbol: 'WIF', name: 'Wif On Sol' },
      { mint: '5xRt9qLp0aAa2bCc3dDd4eEe5Ffpump', symbol: 'BONK', name: 'Bonk Inu' },
      { mint: 'FfEeDdCcBbAa0099887766554433pump', symbol: 'FROG', name: 'Froggo' },
      { mint: 'AaBbCcDdEeFf1122334455667788pump', symbol: 'MYRO', name: 'Myro' },
      { mint: 'BbCcDdEeFfGg8899001122334455pump', symbol: 'POPCAT', name: 'Popcat' },
      { mint: 'CcDdEeFfGgHh9900112233445566pump', symbol: 'MEW', name: 'Cat In A Dogs World' },
      { mint: 'DdEeFfGgHhIi0011223344556677pump', symbol: 'PONKE', name: 'Ponke' },
      { mint: 'EeFfGgHhIiJj1122334455667788pump', symbol: 'RETARDIO', name: 'Retardio' },
      { mint: 'FfGgHhIiJjKk2233445566778899pump', symbol: 'PNUT', name: 'Peanut the Squirrel' },
    ]
    let pnlMap = new Map<string, number>()
    let tradesCount = new Map<string, number>()
    const seriesMap = new Map<string, PnlPoint[]>()
    const now = Date.now()
    
    // Generate more realistic initial data
    kols.forEach((k, idx) => {
      // Top performers have higher PNL, others are mixed
      const basePnl = idx < 3 ? 5000 + Math.random() * 15000 : 
                      idx < 8 ? -2000 + Math.random() * 8000 :
                      -5000 + Math.random() * 6000
      pnlMap.set(k.id, Math.round(basePnl))
      
      // More active traders have more trades
      const baseTrades = idx < 5 ? 150 + Math.floor(Math.random() * 250) :
                         idx < 12 ? 50 + Math.floor(Math.random() * 150) :
                         10 + Math.floor(Math.random() * 100)
      tradesCount.set(k.id, baseTrades)
      
      // Generate historical PNL series with some volatility
      const initialPnl = basePnl * 0.5 // Start at 50% of current PNL
      const series: PnlPoint[] = []
      for (let i = 0; i < 60; i++) {
        const progress = i / 60
        const currentPnl = initialPnl + (basePnl - initialPnl) * progress
        const noise = (Math.random() - 0.5) * Math.abs(basePnl) * 0.15 // 15% volatility
        series.push({ 
          t: now - (59 - i) * 3600_000, // Hourly data points
          v: Math.round(currentPnl + noise) 
        })
      }
      seriesMap.set(k.id, series)
    })

    const emitLeaderboard = () => {
      const entries: LeaderboardEntry[] = kols.map(k => ({
        kol: k,
        pnl: pnlMap.get(k.id)!,
        totalTrades: tradesCount.get(k.id)!,
        rank: 0,
      }))
      entries.sort((a, b) => b.pnl - a.pnl)
      entries.forEach((e, i) => (e.rank = i + 1))
      this.emitters.leaderboard.emit(entries)
    }

    const emitRandomTrade = () => {
      const k = kols[Math.floor(Math.random() * kols.length)]
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
      const price = Math.round(10 + Math.random() * 200)
      const volume = Math.round(1 + Math.random() * 25)
      const pnlDelta = Math.round((Math.random() - 0.5) * 50)
      pnlMap.set(k.id, (pnlMap.get(k.id) || 0) + pnlDelta)
      tradesCount.set(k.id, (tradesCount.get(k.id) || 0) + 1)
      const pts = seriesMap.get(k.id)!
      pts.push({ t: Date.now(), v: pnlMap.get(k.id)! })
      if (pts.length > 120) pts.shift()
      const tok = tokens[Math.floor(Math.random() * tokens.length)]
      this.emitters.trade.emit({
        id: crypto.randomUUID(),
        kolId: k.id,
        coin: tok.symbol,
        coinMint: tok.mint,
        coinName: tok.name,
        price,
        volume,
        side,
        time: Date.now(),
      })
      this.emitters.pnl.emit({ kolId: k.id, series: [...pts] })
      emitLeaderboard()
    }

    emitLeaderboard()
    this.interval = setInterval(emitRandomTrade, 2000) as unknown as number
  }

  private async startHelius() {
    const kols = await loadKols()
    if (!kols.length) {
      console.warn('Helius mode enabled but no KOLs found in /data/kols.json; falling back to mock.')
      return this.startMock()
    }
    const pnlMap = new Map<string, number>()
    const tradesCount = new Map<string, number>()
    const seriesMap = new Map<string, PnlPoint[]>()
    const now = Date.now()
    kols.forEach(k => {
      pnlMap.set(k.id, 0)
      tradesCount.set(k.id, 0)
      seriesMap.set(k.id, [{ t: now, v: 0 }])
    })

    const emitLeaderboard = () => {
      const entries: LeaderboardEntry[] = kols.map(k => ({
        kol: k,
        pnl: pnlMap.get(k.id)!,
        totalTrades: tradesCount.get(k.id)!,
        rank: 0,
      }))
      // For now, rank by totalTrades since pnl is unknown from client side
      entries.sort((a, b) => b.totalTrades - a.totalTrades)
      entries.forEach((e, i) => (e.rank = i + 1))
      this.emitters.leaderboard.emit(entries)
    }

    await emitLeaderboard()

    await startHeliusPolling(
      kols.map(k => k.wallet),
      (trades) => {
        for (const t of trades) {
          // Map kolId from wallet to id
          const who = kols.find(k => k.wallet === t.kolId)
          const kolId = who?.id || t.kolId
          tradesCount.set(kolId, (tradesCount.get(kolId) || 0) + 1)
          const pts = seriesMap.get(kolId) || [{ t: Date.now(), v: pnlMap.get(kolId) || 0 }]
          const last = pts[pts.length - 1]?.v || 0
          pts.push({ t: Date.now(), v: last }) // keep pnl flat until backend PnL provided
          if (pts.length > 240) pts.shift()
          seriesMap.set(kolId, pts)
          this.emitters.trade.emit({ ...t, kolId })
          this.emitters.pnl.emit({ kolId, series: [...pts] })
        }
        emitLeaderboard()
      },
      8000
    )
  }
}

export const live = new LiveService()
