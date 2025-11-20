export default function SolChallengeExplainer() {
  return (
    <div className="card-glass p-8 mb-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
          Trading Tournaments
        </h2>
        <p className="text-neutral-400 text-base max-w-2xl mx-auto">
          Compete in live trading tournaments, win SOL rewards, and earn lifetime KOL status
        </p>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* How It Works */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 rounded-lg p-2.5">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">How It Works</h3>
          </div>
          <ul className="text-neutral-400 space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Get <strong className="text-white">1 SOL</strong> funding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Trade on supported DEXs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Auto-tracked on-chain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Ranked by PnL & ROI</span>
            </li>
          </ul>
        </div>

        {/* Prize Pool */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 rounded-lg p-2.5">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Prize Pool</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-semibold">🥇 1st</span>
              <span className="text-white font-bold">5 SOL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">🥈 2nd</span>
              <span className="text-white font-bold">3 SOL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-400 font-semibold">🥉 3rd</span>
              <span className="text-white font-bold">1.5 SOL</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-neutral-400 text-xs text-center">
                + <strong className="text-white">KOLBoard</strong> featured status
              </p>
            </div>
          </div>
        </div>

        {/* How to Join */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 rounded-lg p-2.5">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">How to Join</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-white font-semibold mb-1">1. Follow</div>
              <p className="text-neutral-400 text-xs">Join our X community</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">2. Apply</div>
              <p className="text-neutral-400 text-xs">Submit wallet address</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">3. Trade</div>
              <p className="text-neutral-400 text-xs">Get approved & start</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-accent/10 to-accent-dark/10 border border-accent/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-3">Ready to Compete?</h3>
        <p className="text-neutral-300 mb-5 text-sm max-w-xl mx-auto">
          Join the tournament and start trading. All trades tracked automatically on-chain.
        </p>
        <a
          href="https://app.kolspot.live"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-accent-dark hover:shadow-glow-lg text-white font-bold rounded-lg transition-all"
        >
          <span>Launch Tournament</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
