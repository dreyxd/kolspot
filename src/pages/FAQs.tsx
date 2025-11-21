export default function FAQs() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">What is KOLSpot?</h2>
          <p className="text-sm text-neutral-300">
            KOLSpot is a comprehensive trading intelligence platform that tracks KOL wallets, hosts trading tournaments with SOL prizes, 
            and offers opportunities for traders to become officially tracked KOLs.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How do tournaments work?</h2>
          <p className="text-sm text-neutral-300">
            We regularly host trading competitions where participants compete for SOL rewards. Prizes are funded by platform creator fees. 
            Top performers win prizes and gain recognition, with the best traders earning spots as tracked KOLs on our platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How can I become a tracked KOL?</h2>
          <p className="text-sm text-neutral-300">
            Participate in our tournaments and demonstrate consistent trading performance. Top performers and tournament winners are 
            considered for official KOL tracking status, which gives your trades visibility to thousands of users.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">What are creator fees and how do they fund tournaments?</h2>
          <p className="text-sm text-neutral-300">
            Platform creator fees are collected from certain trading activities and token interactions. These fees are used to fund 
            tournament prize pools, ensuring sustainable rewards for top performers without requiring external funding.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Where do prices and data come from?</h2>
          <p className="text-sm text-neutral-300">
            We use Moralis for token prices, lists (new/bonding/graduated), and analytics. Trade detection is powered by Helius webhooks 
            for reliable on-chain monitoring.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How do you detect KOL trades?</h2>
          <p className="text-sm text-neutral-300">
            We track curated KOL wallets and detect their trades in real-time via Helius webhook events, providing instant notifications 
            when tracked wallets make moves.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Is this financial advice?</h2>
          <p className="text-sm text-neutral-300">
            No. KOLSpot is for informational and educational purposes only. We do not provide financial advice. Always do your own research (DYOR) 
            and never invest more than you can afford to lose.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How often does the data refresh?</h2>
          <p className="text-sm text-neutral-300">
            Both the Terminal and Token pages support configurable refresh intervals (default 3s on detail pages). Tournament leaderboards 
            update in real-time as trades are executed on-chain.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Who can participate in tournaments?</h2>
          <p className="text-sm text-neutral-300">
            Tournaments are open to all traders. Check the tournament page for specific entry requirements, rules, and prize structures. 
            Some tournaments may have minimum requirements or entry fees.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How are tournament winners determined?</h2>
          <p className="text-sm text-neutral-300">
            Winners are determined by on-chain verified trading performance metrics such as total PNL, win rate, and ROI during the 
            tournament period. All results are verifiable on the Solana blockchain.
          </p>
        </div>
      </div>
    </main>
  )
}
