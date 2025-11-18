import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
              Track the Top KOLs, See Real-Time Performance
            </h1>
            <p className="mt-4 text-neutral-400 max-w-2xl">
              KOLSpot is a KOLs Tournament on Solana. Monitor trades from Key Opinion Leaders and see live PNL updates. Clean, fast, and focused on the data that matters.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/leaderboard" className="btn btn-primary">View Leaderboard</Link>
              <a href="#how-it-works" className="btn btn-outline">How it works</a>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-medium">Live Leaderboard</h3>
            <p className="mt-2 text-sm text-neutral-400">Rankings update in real-time as KOLs execute trades.</p>
          </div>
          <div className="card p-6">
            <h3 className="font-medium">PNL Trends</h3>
            <p className="mt-2 text-sm text-neutral-400">Chart.js visualizes each KOL’s PNL over time.</p>
          </div>
          <div className="card p-6">
            <h3 className="font-medium">On-Chain Focus</h3>
            <p className="mt-2 text-sm text-neutral-400">Backed by Solana data via WebSockets or SSE feeds.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
