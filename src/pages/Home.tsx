import { Link } from 'react-router-dom'
import TrendingTokens from '../components/TrendingTokens'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Track Top Solana KOLs <br />
              <span className="text-accent">In Real-Time</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10">
              Monitor pump.fun trades from leading Key Opinion Leaders on Solana. 
              See live PNL, trade history, and performance rankings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/terminal" className="btn btn-primary px-8 py-3 text-base">
                Open KOL Terminal
              </Link>
              <Link to="/how-it-works" className="btn btn-outline px-8 py-3 text-base">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tokens Feed */}
      <TrendingTokens />

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">117+</div>
              <div className="text-sm text-neutral-400">Tracked KOLs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">Live</div>
              <div className="text-sm text-neutral-400">Real-Time Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-sm text-neutral-400">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-neutral-400">On-Chain Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Professional tools to track and analyze KOL trading activity on Solana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Leaderboard</h3>
              <p className="text-neutral-400">
                Real-time rankings showing top performers by PNL, trade volume, and win rate. 
                Updated instantly as trades execute on-chain.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
              <p className="text-neutral-400">
                Detailed PNL charts, trade history, and performance metrics for each KOL. 
                Track patterns and strategies over time.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">KOL Activity Feed</h3>
              <p className="text-neutral-400">
                See every pump.fun token buy across all tracked wallets. 
                Filter by KOL or token to discover trending opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Three simple steps to start tracking top KOLs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent text-black font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Open KOL Terminal</h3>
              <p className="text-sm text-neutral-400">
                See tokens KOLs are buying right now, grouped by stage (New / About to Graduate / Graduated)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent text-black font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Watch KOL Buys</h3>
              <p className="text-sm text-neutral-400">
                Monitor live KOL buys on Pump.fun/Raydium, with buyer names and amounts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent text-black font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyze Tokens</h3>
              <p className="text-sm text-neutral-400">
                Open a token to see price, liquidity, FDV, charts, and recent KOL buyers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card p-12 text-center bg-surface/50">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Tracking KOLs Today
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
              Join traders who use KOLSpot to stay ahead of pump.fun trends on Solana
            </p>
            <Link to="/terminal" className="btn btn-primary px-8 py-3 text-base inline-block">
              Open KOL Terminal
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
