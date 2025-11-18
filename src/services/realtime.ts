import { LeaderboardEntry, Kol, PnlPoint, Trade } from '../types'
import { loadKols } from './kols'
import { startHeliusPolling } from './helius'

type Listener<T> = (data: T) => void

class Emitter<T> {
  private listeners = new Set<Listener<T>>()
  on(fn: Listener<T>) { this.listeners.add(fn); return () => this.off(fn) }
  off(fn: Listener<T>) { this.listeners.delete(fn) }
  emit(data: T) { this.listeners.forEach(l => l(data)) }
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
    if (wsUrl) this.connectWS(wsUrl)
    else if (sseUrl) this.connectSSE(sseUrl)
    else if (heliusKey) this.startHelius()
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

    // Sample memecoins (mocked pump.fun tokens)
    const tokens = [
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana' },
      { mint: '7HkZy8Aq7uN7zQadpMf8k9mvxXYXpumpfun00000001', symbol: 'DOGS', name: 'Dogs of Sol' },
      { mint: '9JfGk3tAn2wUqkQkZ8P9g7pQmYXpumpfun000000002', symbol: 'PEPE', name: 'Pepe Sol' },
      { mint: '3kPwZ9oLm1rR9vKz2Uu88YxKkMnpumpfun000000003', symbol: 'WIF', name: 'Wif On Sol' },
      { mint: '5xRt9qLp0aAa2bCc3dDd4eEe5Ffpumpfun000000004', symbol: 'BONKX', name: 'BonkX' },
      { mint: 'FfEeDdCcBbAa0099887766554433pumpfun00000005', symbol: 'FROG', name: 'Froggo' },
      { mint: 'AaBbCcDdEeFf1122334455667788pumpfun00000006', symbol: 'CAT', name: 'SolCat' },
    ]
    let pnlMap = new Map<string, number>()
    let tradesCount = new Map<string, number>()
    const seriesMap = new Map<string, PnlPoint[]>()
    const now = Date.now()
    kols.forEach(k => {
      pnlMap.set(k.id, Math.round((Math.random() - 0.5) * 2000) / 1)
      tradesCount.set(k.id, Math.floor(Math.random() * 200))
      seriesMap.set(k.id, Array.from({ length: 30 }).map((__, idx) => ({ t: now - (29 - idx) * 3600_000, v: pnlMap.get(k.id)! + (Math.random() - 0.5) * 200 })))
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
