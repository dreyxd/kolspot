export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How KOLSpot Works</h1>
          <p className="text-lg text-neutral-400">
            Track elite traders, compete in tournaments, and become a recognized KOL
          </p>
        </header>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-3">Real-Time Wallet Tracking</h2>
                <p className="text-neutral-300 mb-4">
                  KOLSpot monitors the on-chain activities of verified Key Opinion Leaders (KOLs) 
                  and top traders on the Solana blockchain. Every trade, swap, and transaction is 
                  tracked in real-time using Helius API integration.
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-400">
                  <li>Live transaction monitoring across multiple wallets</li>
                  <li>Instant notifications when KOLs make trades</li>
                  <li>Complete trade history with timestamps and volumes</li>
                  <li>On-chain verification for authenticity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-3">Performance Analytics</h2>
                <p className="text-neutral-300 mb-4">
                  Get deep insights into each KOL's trading performance with comprehensive 
                  analytics and visualizations. Track their profit and loss (PNL) over time 
                  and understand their trading strategies.
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-400">
                  <li>Real-time PNL calculations and tracking</li>
                  <li>Interactive charts showing performance trends</li>
                  <li>Win rate and trade success metrics</li>
                  <li>Token-specific performance breakdown</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-3">Leaderboard & Tournaments</h2>
                <p className="text-neutral-300 mb-4">
                  Compare traders on our dynamic leaderboard and compete in SOL-funded tournaments. 
                  Top performers win rewards from creator fees and earn recognition.
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-400">
                  <li>Rankings by total PNL, win rate, and trade volume</li>
                  <li>Compete in tournaments for SOL prizes</li>
                  <li>Win consistently to become an officially tracked KOL</li>
                  <li>Rewards funded by platform creator fees</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-3">KOL Activity Board</h2>
                <p className="text-neutral-300 mb-4">
                  Stay updated with the latest moves from all tracked KOLs in one unified feed. 
                  See what tokens they're buying, selling, and which opportunities they're exploring.
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-400">
                  <li>Live trade feed across all monitored wallets</li>
                  <li>Quick insights into trending tokens among KOLs</li>
                  <li>Buy/sell signals from top performers</li>
                  <li>Filter by specific KOLs or token types</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 - Getting Started */}
          <section className="card p-8 bg-primary/10 border-primary/20">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4 text-neutral-300">
              <div>
                <h3 className="font-semibold text-white mb-2">1. Explore the Leaderboard</h3>
                <p className="text-sm">
                  Start by browsing the leaderboard to discover top-performing KOLs. Click on 
                  any trader to see their detailed profile and trading history.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2. Follow Your Favorites</h3>
                <p className="text-sm">
                  Save KOLs you want to track closely. Get personalized insights based on 
                  their trading patterns and strategies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">3. Learn and Adapt</h3>
                <p className="text-sm">
                  Study successful traders' moves, understand their timing, and use these 
                  insights to inform your own trading decisions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">4. Stay Alert</h3>
                <p className="text-sm">
                  Check the KOL Board regularly for the latest activity. Early awareness of 
                  KOL trades can provide valuable market insights.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="card p-8">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">How are KOLs selected?</h3>
                <p className="text-sm text-neutral-400">
                  We track verified influencers, successful traders, and notable figures in the 
                  Solana ecosystem. Our selection is based on trading history, community influence, 
                  and verified wallet ownership.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Is the data real-time?</h3>
                <p className="text-sm text-neutral-400">
                  Yes! We use Helius API to monitor on-chain transactions with minimal latency. 
                  Trades are displayed within seconds of blockchain confirmation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Can I copy trades automatically?</h3>
                <p className="text-sm text-neutral-400">
                  KOLSpot is an analytics and tracking platform. We provide insights and data, 
                  but do not offer automated copy trading. Always do your own research before 
                  making investment decisions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">How is PNL calculated?</h3>
                <p className="text-sm text-neutral-400">
                  PNL is calculated based on entry and exit prices of tracked positions, 
                  including transaction fees. All calculations are derived from on-chain data 
                  for maximum accuracy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Can I suggest a KOL to track?</h3>
                <p className="text-sm text-neutral-400">
                  Yes! We're always looking to expand our tracked wallets. Reach out to us on 
                  Twitter with the KOL's profile and verified wallet address for consideration.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-neutral-400 mb-6">
              Track elite traders or compete in tournaments to prove your skills
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kol-terminal" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
                <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
                <span className="txt relative z-10 text-white">KOL Terminal</span>
              </a>
              <a href="https://app.kolspot.live" target="_blank" rel="noopener noreferrer" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
                <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
                <span className="txt relative z-10 text-white">Launch App</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
