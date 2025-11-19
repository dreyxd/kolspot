export type TradeSide = 'BUY' | 'SELL'

export interface Trade {
  id: string
  kolId: string
  coin: string // symbol or short name
  coinMint?: string // contract address / mint
  coinName?: string // full token name
  price: number
  volume: number
  side: TradeSide
  time: number // epoch ms
  // Birdeye metadata
  logoURI?: string
  tokenPrice?: number
  liquidity?: number
  volume24h?: number
  priceChange24h?: number
  marketCap?: number
}

export interface Kol {
  id: string
  name: string
  avatarUrl?: string
  wallet: string
  twitter?: string
}

export interface LeaderboardEntry {
  kol: Kol
  rank: number
  totalTrades: number
  pnl: number
}

export interface PnlPoint {
  t: number // epoch ms
  v: number // pnl value
}
