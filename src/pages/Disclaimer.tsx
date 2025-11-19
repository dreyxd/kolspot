export default function Disclaimer() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
      <p className="text-neutral-400 mb-6">KOLSpot is an analytics platform. It is not financial advice.</p>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">Information Only</h2>
        <p className="text-sm text-neutral-300">All information is provided for informational purposes only and should not be used as the sole basis for making any investment decisions.</p>
      </section>

      <section className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">No Guarantees</h2>
        <p className="text-sm text-neutral-300">We do not warrant the accuracy, completeness, or timeliness of any data presented.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Risk</h2>
        <p className="text-sm text-neutral-300">Trading digital assets involves substantial risk of loss and is not suitable for every investor.</p>
      </section>
    </main>
  )
}
