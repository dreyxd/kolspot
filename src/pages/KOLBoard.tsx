import React, { useEffect, useMemo, useState } from 'react'
import { live } from '../services/realtime'
import { tradeStore } from '../services/tradeStore'
import { LeaderboardEntry, Trade } from '../types'
import { formatCurrency, formatDate, shortAddress } from '../utils/format'
import { loadKols } from '../services/kols'
import { getRecentTrades } from '../services/backendApi'
import { subscribeToTrades } from '../services/backendWs'
import { enrichTokenSymbol } from '../services/dexscreener'

// Categorization: Left (1-2 unique KOL buyers), Middle (3-4), Right (5+)

interface BuyTrade extends Trade {}

type CoinEntry = {
  id: string
  name: string
  symbol?: string
  mint?: string
  logoURI?: string
  price?: number
  liquidity?: number
  volume24h?: number
  priceChange24h?: number
  marketCap?: number
  buyers: Set<string>
  tradeCount: number
  lastTime: number
  buyerTimes: Map<string, number> // Track when each KOL bought
}

// Separate component for coin card to properly handle useState
const CoinCard: React.FC<{ entry: CoinEntry; kols: any[]; enriching?: boolean }> = ({ entry, kols, enriching }) => {
  const [copied, setCopied] = useState(false)
  
  const copyAddress = () => {
    if (entry.mint) {
      navigator.clipboard.writeText(entry.mint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Check if this token is UNKNOWN
  const isUnknown = entry.name === 'UNKNOWN' || entry.symbol === 'UNKNOWN' || entry.name?.startsWith('0x')
  
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Token Header with Logo */}
            <div className="flex items-center gap-3 mb-2">
              {/* Token Logo */}
              {entry.logoURI ? (
                <img 
                  src={entry.logoURI} 
                  alt={entry.symbol || entry.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 bg-surface border border-white/10"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      const gradient = parent.querySelector('.token-gradient-placeholder');
                      if (gradient) {
                        gradient.classList.remove('hidden');
                      }
                    }
                    target.style.display = 'none';
                  }}
                />
              ) : null}
              <div className={`token-gradient-placeholder w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center shrink-0 ${entry.logoURI ? 'hidden' : ''}`}>
                <span className="text-sm font-bold text-accent">
                  {entry.symbol?.slice(0, 2) || entry.name?.slice(0, 2) || '??'}
                </span>
              </div>
              
              {/* Token Name and Symbol */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.mint ? (
                    <a 
                      className="font-semibold text-base truncate hover:underline hover:text-accent transition-colors" 
                      href={`https://pump.fun/coin/${entry.mint}`} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      {entry.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-base truncate">{entry.name}</span>
                  )}
                  {entry.symbol && entry.symbol !== entry.name && (
                    <span className="text-sm text-accent font-mono font-semibold">${entry.symbol}</span>
                  )}
                  {isUnknown && enriching && (
                    <span className="text-[10px] text-yellow-400 animate-pulse">Fetching...</span>
                  )}
                </div>
                
                {/* Contract Address - Copyable */}
                {entry.mint && (
                  <div 
                    className="text-xs text-neutral-400 font-mono cursor-pointer hover:text-accent transition-colors flex items-center gap-2 mt-1"
                    onClick={copyAddress}
                    title="Click to copy contract address"
                  >
                    <span className="truncate">{shortAddress(entry.mint, 8, 8)}</span>
                    {copied ? (
                      <span className="text-green-400 text-[10px] shrink-0">✓ Copied</span>
                    ) : (
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                )}
                
                {/* Token Stats */}
                {(entry.price || entry.liquidity || entry.volume24h || entry.marketCap) && (
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400 flex-wrap">
                    {entry.price && (
                      <div>
                        <span className="text-neutral-500">Price:</span> <span className="text-white font-semibold">${entry.price < 0.01 ? entry.price.toExponential(2) : entry.price.toFixed(4)}</span>
                      </div>
                    )}
                    {entry.marketCap && (
                      <div>
                        <span className="text-neutral-500">MCap:</span> <span className="text-white font-semibold">${entry.marketCap >= 1000000 ? (entry.marketCap / 1000000).toFixed(2) + 'M' : (entry.marketCap / 1000).toFixed(1) + 'K'}</span>
                      </div>
                    )}
                    {entry.liquidity && (
                      <div>
                        <span className="text-neutral-500">Liq:</span> <span className="text-white font-semibold">${(entry.liquidity / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                    {entry.priceChange24h !== undefined && (
                      <div className={entry.priceChange24h >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        24h: {entry.priceChange24h >= 0 ? '+' : ''}{entry.priceChange24h.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* KOL Buyers List */}
            {buyersArray.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[10px] text-neutral-500 mb-2 font-semibold uppercase tracking-wide">Bought by KOLs:</div>
                <div className="space-y-1.5">
                  {buyersArray.map(({ kolId, buyTime }) => {
                    const kol = kols.find(k => k.id === kolId)
                    return (
                      <div key={kolId} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                          <span className="font-medium text-white">
                            {kol?.name || shortAddress(kolId, 6, 4)}
                          </span>
                        </div>
                        <span className="text-neutral-400 text-[10px]">{formatDate(buyTime)}</span>
                      </div>
                    )
                  })}
                  {entry.buyers.size > 3 && (
                    <div className="text-[10px] text-neutral-400 italic pl-3.5">
                      +{entry.buyers.size - 3} more KOL{entry.buyers.size - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Stats Badge */}
          <div className="text-right shrink-0">
            <div className="text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent font-bold border border-accent/30">
              {entry.buyers.size} KOL{entry.buyers.size>1?'s':''}
            </div>
            <div className="text-[10px] text-neutral-500 mt-2">{entry.tradeCount} buy{entry.tradeCount > 1 ? 's' : ''}</div>
            <div className="text-[10px] text-neutral-600 mt-1">
              {formatDate(entry.lastTime)}
            </div>
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
  const [loading, setLoading] = useState(true)
  const [enriching, setEnriching] = useState(false)

  // Enrich UNKNOWN tokens with DexScreener data
  useEffect(() => {
    const enrichUnknownTokens = async () => {
      const unknownTrades = buyTrades.filter(t => 
        t.coin === 'UNKNOWN' || !t.coin || t.coin.startsWith('0x')
      )
      
      if (unknownTrades.length === 0) return
      
      setEnriching(true)
      console.log(`🔍 Enriching ${unknownTrades.length} UNKNOWN tokens...`)
      
      // Get unique mints to avoid duplicate API calls
      const uniqueMints = [...new Set(unknownTrades.map(t => t.coinMint).filter(Boolean))]
      
      for (const mint of uniqueMints) {
        try {
          const { symbol, name } = await enrichTokenSymbol(mint!, 'UNKNOWN')
          
          // Update all trades with this mint
          tradeStore.updateTokenMetadata(mint!, symbol, name)
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 150))
        } catch (err) {
          console.warn(`Failed to enrich ${mint}:`, err)
        }
      }
      
      setEnriching(false)
      console.log('✅ Token enrichment complete')
    }
    
    // Run enrichment after initial load and when new UNKNOWN tokens appear
    const timer = setTimeout(enrichUnknownTokens, 1000)
    return () => clearTimeout(timer)
  }, [buyTrades.filter(t => t.coin === 'UNKNOWN').length])

  useEffect(() => {
    const init = async () => {
      // Load KOLs
      const kolsList = await loadKols()
      setKols(kolsList)
      
      // Check if using backend mode
      const useBackend = import.meta.env.VITE_USE_BACKEND === 'true'
      
      if (useBackend) {
        console.log('🔄 Loading recent trades from backend...')
        
        // Load recent trades from backend API
        const recentTrades = await getRecentTrades(200)
        
        // Convert backend trades to frontend format and add to store
        if (recentTrades.length > 0) {
          console.log(`✅ Loaded ${recentTrades.length} trades from backend`)
          
          recentTrades.forEach((tx: any) => {
            const kol = kolsList.find(k => k.wallet === tx.walletAddress)
            if (kol) {
              const trade: Trade = {
                id: tx.signature,
                kolId: kol.id,
                coin: tx.tokenSymbol,
                coinMint: tx.tokenMint,
                coinName: tx.tokenSymbol,
                price: tx.solAmount || 0,
                volume: tx.amount || 0,
                side: tx.side || 'BUY',
                time: new Date(tx.timestamp).getTime(),
                // Birdeye metadata
                logoURI: tx.tokenLogoURI,
                tokenPrice: tx.tokenPrice,
                liquidity: tx.tokenLiquidity,
                volume24h: tx.tokenVolume24h,
                priceChange24h: tx.tokenPriceChange24h,
                marketCap: tx.tokenMarketCap,
              }
              tradeStore.addTrade(trade)
            }
          })
        }
        
        // Subscribe to WebSocket for new trades
        const unsubscribeWs = subscribeToTrades((tradeData: any) => {
          console.log('📥 New trade from WebSocket:', tradeData)
          
          const kol = kolsList.find(k => k.wallet === tradeData.walletAddress)
          if (kol) {
            const trade: Trade = {
              id: tradeData.signature,
              kolId: kol.id,
              coin: tradeData.tokenSymbol,
              coinMint: tradeData.tokenMint,
              coinName: tradeData.tokenSymbol,
              price: tradeData.solAmount || 0,
              volume: tradeData.amount || 0,
              side: tradeData.side || 'BUY',
              time: new Date(tradeData.timestamp).getTime(),
              // Birdeye metadata
              logoURI: tradeData.tokenLogoURI,
              tokenPrice: tradeData.tokenPrice,
              liquidity: tradeData.tokenLiquidity,
              volume24h: tradeData.tokenVolume24h,
              priceChange24h: tradeData.tokenPriceChange24h,
              marketCap: tradeData.tokenMarketCap,
            }
            tradeStore.addTrade(trade)
          }
        })
        
        setLoading(false)
        return unsubscribeWs
      } else {
        // Use live service for non-backend mode
        const offL = live.on('leaderboard', (lb) => setLeaderboard(lb))
        setLoading(false)
        return offL
      }
    }
    
    const cleanupPromise = init()
    
    // Subscribe to trade store updates
    const unsubscribe = tradeStore.subscribe((trades) => {
      const buyOnly = trades.filter(t => t.side === 'BUY')
      setBuyTrades(buyOnly)
    })
    
    return () => { 
      unsubscribe()
      cleanupPromise.then(cleanup => cleanup && cleanup())
    }
  }, [])

  // Build per-coin data structure with unique buyers and capped trades
  const coins = useMemo<CoinEntry[]>(() => {
    const map = new Map<string, CoinEntry>()
    for (const t of buyTrades) {
      const id = t.coinMint || t.coin
      
      // Better name/symbol extraction
      const tokenName = t.coinName && t.coinName !== 'UNKNOWN' && !t.coinName.startsWith('0x') 
        ? t.coinName 
        : (t.coin && t.coin !== 'UNKNOWN' && !t.coin.startsWith('0x') ? t.coin : t.coinMint?.slice(0, 8) || 'Unknown')
      
      const tokenSymbol = t.coin && t.coin !== 'UNKNOWN' && !t.coin.startsWith('0x') && t.coin !== tokenName
        ? t.coin
        : undefined
      
      const entry = map.get(id) || {
        id,
        name: tokenName,
        symbol: tokenSymbol,
        mint: t.coinMint,
        buyers: new Set<string>(),
        tradeCount: 0,
        lastTime: 0,
        buyerTimes: new Map<string, number>(),
        // Birdeye metadata
        logoURI: t.logoURI,
        price: t.tokenPrice,
        liquidity: t.liquidity,
        volume24h: t.volume24h,
        priceChange24h: t.priceChange24h,
        marketCap: t.marketCap,
      }
      entry.buyers.add(t.kolId)
      entry.tradeCount += 1
      entry.lastTime = Math.max(entry.lastTime, t.time)
      
      // Update metadata if present (use most recent)
      if (t.logoURI && !entry.logoURI) entry.logoURI = t.logoURI
      if (t.tokenPrice !== undefined) entry.price = t.tokenPrice
      if (t.liquidity !== undefined) entry.liquidity = t.liquidity
      if (t.volume24h !== undefined) entry.volume24h = t.volume24h
      if (t.priceChange24h !== undefined) entry.priceChange24h = t.priceChange24h
      if (t.marketCap !== undefined) entry.marketCap = t.marketCap
      
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

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">KOLBoard</h1>
        <div className="text-center py-12 text-neutral-400">
          <div className="animate-pulse">Loading trades...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">KOLBoard</h1>
        <div className="text-sm text-neutral-400">
          {allBuyTrades.length > 0 ? `${allBuyTrades.length} trades tracked` : 'Waiting for trades...'}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (1–2 KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {leftCoins.length ? leftCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} enriching={enriching} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (3–4 KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {middleCoins.length ? middleCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} enriching={enriching} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <h2 className="text-sm font-semibold tracking-wide text-accent mb-4">Coins (5+ KOL Buyers)</h2>
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
            {rightCoins.length ? rightCoins.map(entry => <CoinCard key={entry.id} entry={entry} kols={kols} enriching={enriching} />) : <p className="text-xs text-neutral-500">No coins in this range.</p>}
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
