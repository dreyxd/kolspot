import { useMemo, useState } from 'react'

const pumpUrl = import.meta.env.VITE_KOLS_PUMP_URL as string | undefined || 'https://pump.fun/coin/3wrHU4a15WLceBopoaiDxePwUxUernJCTtar2UWKpump'
const mint = import.meta.env.VITE_KOLS_MINT as string | undefined || '3wrHU4a15WLceBopoaiDxePwUxUernJCTtar2UWKpump'
const twitter = import.meta.env.VITE_KOLS_TWITTER as string | undefined

export default function KOLS() {
  const [copied, setCopied] = useState(false)
  const ca = useMemo(() => (mint && mint.trim().length > 0 ? mint.trim() : ''), [mint])

  const shortAddress = (addr: string, start = 6, end = 6) => `${addr.slice(0, start)}...${addr.slice(-end)}`

  const copyCA = () => {
    if (!ca) return
    navigator.clipboard.writeText(ca)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">$KOLS Token</h1>
        <p className="text-neutral-400 mt-2">The native token powering KOLSpot.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface/50 border border-white/10 rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Launch Details</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-neutral-400">Status</span>
              <span className="text-green-400 font-semibold">Live on Pump.fun</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-neutral-400">Network</span>
              <span className="text-white font-semibold">Solana</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-neutral-400">Launch Platform</span>
              <span className="text-white font-semibold">Pump.fun</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-neutral-400">Token Address</span>
              <span className="flex items-center gap-2 font-mono">
                {ca ? (
                  <>
                    <span className="text-neutral-300">{shortAddress(ca)}</span>
                    <button onClick={copyCA} className="text-xs text-neutral-400 hover:text-accent" title="Copy contract address">
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </>
                ) : (
                  <span className="text-neutral-500">TBA</span>
                )}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-neutral-400">Taxes</span>
              <span className="text-green-400 font-semibold">0</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {pumpUrl ? (
              <a
                className="px-4 py-2 rounded-md bg-accent text-black font-semibold hover:opacity-90 transition"
                href={pumpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Pump.fun
              </a>
            ) : (
              <button className="px-4 py-2 rounded-md bg-accent/50 text-white font-semibold cursor-not-allowed">
                Pump.fun link coming soon
              </button>
            )}
            {ca && (
              <a
                className="px-4 py-2 rounded-md bg-white/10 text-neutral-200 hover:bg-white/20 transition"
                href="https://dexscreener.com/solana/5ulbnsyxvfsjbuy3rypg2jv2lpmqjkhy5ck32yhp44vy"
                target="_blank"
                rel="noopener noreferrer"
              >
                DexScreener
              </a>
            )}
            {twitter && (
              <a
                className="px-4 py-2 rounded-md bg-white/10 text-neutral-200 hover:bg-white/20 transition"
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow Updates
              </a>
            )}
          </div>
        </div>

        <div className="bg-surface/50 border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Utilities</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-300">
            <li>Access to pro features</li>
            <li>Priority indexing for KOL wallets</li>
            <li>Community governance over roadmap</li>
            <li>Early access to new tools</li>
          </ul>
        </div>
      </section>

      <section className="bg-surface/30 border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Tokenomics (Preview)</h2>
        <p className="text-sm text-neutral-300 mb-3">Final tokenomics will be announced before launch.</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/20 rounded p-4">
            <div className="text-neutral-500 mb-1">Total Supply</div>
            <div className="font-semibold">TBA</div>
          </div>
          <div className="bg-black/20 rounded p-4">
            <div className="text-neutral-500 mb-1">Liquidity</div>
            <div className="font-semibold">TBA</div>
          </div>
          <div className="bg-black/20 rounded p-4">
            <div className="text-neutral-500 mb-1">Team/Dev</div>
            <div className="font-semibold">TBA</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Timeline</h2>
        <ul className="text-sm text-neutral-300 space-y-2">
          <li>Announcement: Soon</li>
          <li>Contract Address: TBA</li>
          <li>Launch on Pump.fun: TBA</li>
          <li>DEX listing: post-graduation</li>
        </ul>
      </section>
    </main>
  )
}
