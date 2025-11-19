export default function FAQs() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">FAQs</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">What is KOLSpot?</h2>
          <p className="text-sm text-neutral-300">A real-time dashboard highlighting tokens bought by Key Opinion Leaders on Solana.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Where do prices and lists come from?</h2>
          <p className="text-sm text-neutral-300">We use Moralis for token prices, lists (new/bonding/graduated), and analytics where available.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">How do you detect KOL trades?</h2>
          <p className="text-sm text-neutral-300">We track KOL wallets and detect trades via Helius webhook events.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Is this financial advice?</h2>
          <p className="text-sm text-neutral-300">No. The platform is for informational purposes only. DYOR.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">How often does the data refresh?</h2>
          <p className="text-sm text-neutral-300">Both the Terminal and Token pages support configurable refresh intervals (default 3s on detail).</p>
        </div>
      </div>
    </main>
  )
}
