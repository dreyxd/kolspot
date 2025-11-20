import { Link } from 'react-router-dom'
import TrendingTokens from '../components/TrendingTokens'
import SolChallengeSection from '../components/SolChallengeSection'
import SolChallengeExplainer from '../components/SolChallengeExplainer'
import PoweredBy from '../components/PoweredBy'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
              <span className="text-sm font-medium text-white">Professional Solana KOL Tracking</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Track Top Solana KOLs
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Real-time insights into pump.fun trades from leading Key Opinion Leaders. 
              Monitor PNL, analyze strategies, and stay ahead of the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/terminal" className="neon-btn">
                <span className="span"></span>
                <span className="txt">Launch Terminal</span>
              </Link>
              <a href="https://app.kolspot.live" target="_blank" rel="noopener noreferrer" className="neon-btn">
                <span className="span"></span>
                <span className="txt">Launch App</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tokens Feed */}
      <div>
        <TrendingTokens />
      </div>

      {/* 1 SOL Challenge - Explainer & Competition */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SolChallengeExplainer />
          <SolChallengeSection />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold text-accent-text mb-2">117+</div>
              <div className="text-sm font-medium text-neutral-400">Tracked KOLs</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold text-accent-text mb-2">Live</div>
              <div className="text-sm font-medium text-neutral-400">Real-Time Data</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold text-accent-text mb-2">24/7</div>
              <div className="text-sm font-medium text-neutral-400">Monitoring</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold text-accent-text mb-2">100%</div>
              <div className="text-sm font-medium text-neutral-400">On-Chain Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Enterprise-grade tools to track and analyze KOL trading activity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Live Leaderboard</h3>
              <p className="text-neutral-400 leading-relaxed">
                Real-time rankings by PNL, volume, and win rate. 
                Updated instantly as trades execute on-chain.
              </p>
            </div>

            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Performance Analytics</h3>
              <p className="text-neutral-400 leading-relaxed">
                Detailed PNL charts, trade history, and metrics. 
                Track patterns and strategies over time.
              </p>
            </div>

            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">KOL Activity Feed</h3>
              <p className="text-neutral-400 leading-relaxed">
                Monitor every pump.fun token buy across tracked wallets. 
                Discover trending opportunities early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">Simple Process</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Start tracking top KOLs in three steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Launch Terminal</h3>
              <p className="text-neutral-400 leading-relaxed">
                View tokens KOLs are buying, organized by stage and activity
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Monitor Activity</h3>
              <p className="text-neutral-400 leading-relaxed">
                Track live buys on Pump.fun/Raydium with trader details
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Analyze Data</h3>
              <p className="text-neutral-400 leading-relaxed">
                Deep dive into price, liquidity, FDV, charts, and buyer info
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative card-glass p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-dark/5 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-transparent">
                Ready to Track KOLs?
              </h2>
              <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join professional traders using KOLSpot to stay ahead of Solana trends
              </p>
              <Link to="/terminal" className="btn btn-primary px-12 py-4 text-lg inline-block">
                Launch Terminal Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Section */}
      <PoweredBy />
    </main>
  )
}
