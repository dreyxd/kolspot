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
              <span className="text-sm font-medium text-white">Track, Compete & Earn on Solana</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Your Gateway to Elite Trading
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Track top KOL wallets, compete in tournaments for SOL rewards, and showcase your skills to become a tracked KOL yourself. All powered by creator fee rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
              <div className="text-sm font-medium text-neutral-400">Tournaments</div>
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent" style={{paddingBottom: '0.1em', lineHeight: '1.3'}}>Complete Trading Ecosystem</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Everything you need to track, learn, compete, and earn in the Solana ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">KOL Wallet Tracking</h3>
              <p className="text-neutral-400 leading-relaxed">
                Follow 117+ elite traders in real-time. Monitor their pump.fun trades, PNL, and winning strategies.
              </p>
            </div>

            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Trading Tournaments</h3>
              <p className="text-neutral-400 leading-relaxed">
                Compete in SOL-funded challenges. Top performers win rewards from creator fees and earn recognition.
              </p>
            </div>

            <div className="card p-8 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-7 h-7 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Become a Tracked KOL</h3>
              <p className="text-neutral-400 leading-relaxed">
                Prove your trading skills in tournaments and get featured on KOLSpot. Build your reputation as an elite trader.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent" style={{paddingBottom: '0.1em', lineHeight: '1.3'}}>Three Ways to Engage</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Track, compete, or become the next tracked KOL
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Track Elite Traders</h3>
              <p className="text-neutral-400 leading-relaxed">
                Monitor real-time trades from 117+ top KOLs. Analyze their strategies and discover trending tokens early.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Join Tournaments</h3>
              <p className="text-neutral-400 leading-relaxed">
                Compete for SOL prizes funded by creator fees. Prove your trading skills and climb the leaderboard.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Get Tracked</h3>
              <p className="text-neutral-400 leading-relaxed">
                Win tournaments and showcase consistent performance to become an officially tracked KOL on the platform.
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
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-transparent" style={{paddingBottom: '0.1em', lineHeight: '1.3'}}>
                Ready to Elevate Your Trading?
              </h2>
              <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                Track elite traders in real-time or compete in tournaments to showcase your skills
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/terminal" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
                  <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
                  <span className="txt relative z-10 text-white">KOL Terminal</span>
                </a>
                <a href="https://app.kolspot.live" target="_blank" rel="noopener noreferrer" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
                  <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
                  <span className="txt relative z-10 text-white">Launch App</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Section */}
      <PoweredBy />
    </main>
  )
}
