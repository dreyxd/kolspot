export default function SolChallengeExplainer() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 border border-purple-500/30 rounded-xl p-8 mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          1 SOL Challenge
        </h2>
        <p className="text-gray-400 text-lg">
          Prove your trading skills. Win $KOLS tokens. Become a tracked KOL.
        </p>
      </div>

      {/* How It Works */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 rounded-full p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">How It Works</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Each participant receives <strong className="text-white">1 SOL</strong> funded from creator fee rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Trade meme coins on Solana to maximize your portfolio value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Competition runs for <strong className="text-white">7 days</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Top performers win exclusive rewards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 rounded-full p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Rewards</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🥇</span>
                    <span className="font-bold text-yellow-400">1st Place</span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    <strong className="text-white">2.5% $KOLS</strong> supply + Featured KOL status
                  </p>
                </div>
                <div className="bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🥈</span>
                    <span className="font-bold text-gray-300">2nd Place</span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    <strong className="text-white">1.5% $KOLS</strong> supply + Tracked KOL
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🥉</span>
                    <span className="font-bold text-orange-400">3rd Place</span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    <strong className="text-white">1% $KOLS</strong> supply + Tracked KOL
                  </p>
                </div>
                <div className="text-center pt-2 border-t border-gray-700">
                  <p className="text-gray-400 text-xs">
                    <strong className="text-purple-400">Top 5 winners</strong> added to KOL Terminal watch list
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Apply */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-400/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500/30 rounded-full p-3 flex-shrink-0">
            <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">How to Apply</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                <div className="text-purple-400 font-bold mb-2">Step 1</div>
                <p className="text-gray-300 text-sm">
                  Join our X (Twitter) community
                </p>
                <a 
                  href="#" 
                  className="inline-block mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Link coming soon →
                </a>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                <div className="text-purple-400 font-bold mb-2">Step 2</div>
                <p className="text-gray-300 text-sm">
                  Submit your application to admin with your Solana wallet address
                </p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                <div className="text-purple-400 font-bold mb-2">Step 3</div>
                <p className="text-gray-300 text-sm">
                  Get approved, receive 1 SOL, and start trading!
                </p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-200 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="text-yellow-300">Note:</strong> Each participant is funded with 1 SOL from creator fee rewards. 
                  This is a real competition with real rewards. Trade responsibly!
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h4 className="font-bold text-white mb-1">Become a Tracked KOL</h4>
          <p className="text-gray-400 text-sm">Top performers get featured on our KOL Terminal</p>
        </div>
        <div className="bg-black/30 border border-blue-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">💎</div>
          <h4 className="font-bold text-white mb-1">Earn $KOLS Tokens</h4>
          <p className="text-gray-400 text-sm">Win up to 2.5% of total $KOLS supply</p>
        </div>
        <div className="bg-black/30 border border-green-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🚀</div>
          <h4 className="font-bold text-white mb-1">Build Your Reputation</h4>
          <p className="text-gray-400 text-sm">Showcase your trading skills to the community</p>
        </div>
      </div>
    </div>
  );
}
