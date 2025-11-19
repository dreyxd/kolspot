export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">About KOLSpot</h1>
      <p className="text-neutral-400 mb-6">We help you spot Solana tokens KOLs are actually buying—fast.</p>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">Mission</h2>
        <p className="text-sm text-neutral-300">Provide a clear, real-time window into KOL-driven activity on Solana to support research and discovery.</p>
      </section>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">How We Do It</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li>Identify KOL wallets and track relevant on-chain trades.</li>
          <li>Use Moralis for token lists, pricing, and analytics.</li>
          <li>Use Helius for reliable trade detection.</li>
          <li>Refresh data frequently with configurable intervals.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What We Don’t Do</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li>We don’t guarantee accuracy or completeness of data.</li>
          <li>We don’t provide financial advice.</li>
        </ul>
      </section>
    </main>
  )
}
