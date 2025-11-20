export default function Docs() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">Documentation</h1>
      <p className="text-neutral-400 mb-6">KOLSpot surfaces Solana tokens that Key Opinion Leaders (KOLs) actually bought, updating in near real-time.</p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm text-neutral-300">
          <li><span className="font-semibold">Detection:</span> We detect KOL buys via on-chain webhooks and providers (trades powered by Helius).</li>
          <li><span className="font-semibold">Listing:</span> We fetch new/bonding/graduated token lists and pricing from Moralis.</li>
          <li><span className="font-semibold">Filtering:</span> Only tokens with verified KOL buys appear in the Terminal.</li>
          <li><span className="font-semibold">Analytics:</span> Market cap (FDV), liquidity, and 24h stats are provided via Moralis analytics when available.</li>
          <li><span className="font-semibold">Refresh:</span> UI auto-refresh is configurable (3–60s). Turn off to pause.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Endpoints Used</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm text-neutral-300">
          <li>Moralis Solana Gateway: token metadata, price, exchange lists.</li>
          <li>Moralis Deep Index: token analytics (FDV, liquidity, participants).</li>
          <li>Helius: webhook-based trade detection.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Data Caveats</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm text-neutral-300">
          <li>Some tokens may lack full analytics; values will show as Unknown.</li>
          <li>Prices/liquidity can be volatile and subject to provider delays.</li>
          <li>All data is informational and not investment advice.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-neutral-300">Questions or feedback? Reach us on X: <a href="https://x.com/kolspotonsol" className="text-white hover:underline" target="_blank" rel="noreferrer">@kolspotonsol</a>.</p>
      </section>
    </main>
  )
}
