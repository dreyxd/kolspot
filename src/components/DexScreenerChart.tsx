import { useEffect, useState } from 'react'
import { getTokenInfo } from '../services/dexscreener'

interface Props {
  tokenMint: string
  height?: number | string
}

export default function DexScreenerChart({ tokenMint, height = 500 }: Props) {
  const [pairAddress, setPairAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPairAddress(null)
    ;(async () => {
      try {
        const info = await getTokenInfo(tokenMint)
        if (!cancelled) {
          setPairAddress(info?.pairAddress || null)
        }
      } catch (_) {
        if (!cancelled) setPairAddress(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [tokenMint])

  const h = typeof height === 'number' ? `${height}px` : height

  if (loading) {
    return (
      <div style={{ height: h }} className="w-full flex items-center justify-center bg-black/20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
      </div>
    )
  }

  if (!pairAddress) {
    return (
      <div style={{ height: h }} className="w-full flex items-center justify-center bg-black/20">
        <div className="text-sm text-neutral-400">Chart unavailable for this token</div>
      </div>
    )
  }

  const src = `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&chart=1&trades=0&info=0`

  return (
    <iframe
      src={src}
      title="DexScreener Chart"
      style={{ width: '100%', height: h, border: '0' }}
      allowTransparency
      loading="lazy"
    />
  )
}
