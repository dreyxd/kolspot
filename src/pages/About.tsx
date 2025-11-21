export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">About KOLSpot</h1>
      <p className="text-neutral-400 mb-6">
        KOLSpot is a comprehensive trading intelligence platform that combines KOL wallet tracking, competitive tournaments, 
        and opportunities for traders to showcase their skills and become tracked KOLs themselves.
      </p>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p className="text-sm text-neutral-300">
          Democratize access to elite trading intelligence while creating opportunities for talented traders to prove their skills, 
          earn rewards, and build their reputation in the Solana ecosystem.
        </p>
      </section>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li><strong>Real-Time KOL Tracking:</strong> Monitor trades from 117+ elite Solana traders with instant on-chain updates.</li>
          <li><strong>Trading Tournaments:</strong> Compete in SOL-funded challenges with prizes from creator fee rewards.</li>
          <li><strong>Path to Recognition:</strong> Win tournaments and demonstrate consistent performance to become an officially tracked KOL.</li>
          <li><strong>Comprehensive Analytics:</strong> Access detailed PNL charts, wallet performance metrics, and trading patterns.</li>
          <li><strong>Creator Fee Rewards:</strong> Tournament prizes funded sustainably through platform creator fees.</li>
        </ul>
      </section>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li>Track curated KOL wallets with real-time on-chain trade detection via Helius and Moralis.</li>
          <li>Join tournaments where top performers earn SOL rewards from creator fees.</li>
          <li>Consistent winners and high performers get featured as tracked KOLs on the platform.</li>
          <li>All data refreshed frequently with configurable intervals for accuracy.</li>
        </ul>
      </section>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">Becoming a Tracked KOL</h2>
        <p className="text-sm text-neutral-300">
          KOLSpot isn't just about tracking existing influencers—it's about discovering and promoting the next generation of elite traders. 
          By participating in tournaments and demonstrating strong, consistent trading performance, you can earn the opportunity to have 
          your wallet officially tracked on KOLSpot, gaining visibility and credibility in the community.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Important Disclaimers</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li>We do not guarantee accuracy or completeness of data.</li>
          <li>We do not provide financial advice or trading recommendations.</li>
          <li>Tournament participation and trading involve financial risk—trade responsibly.</li>
          <li>Past performance does not guarantee future results.</li>
        </ul>
      </section>
    </main>
  )
}
