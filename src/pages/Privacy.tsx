export default function Privacy() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-200">
      <h1 className="text-3xl font-bold mb-4">Privacy & Security</h1>
      <p className="text-neutral-400 mb-6">Your privacy matters. This page outlines what we collect and how we use it.</p>

      <section className="space-y-2 mb-8">
        <h2 className="text-xl font-semibold">Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-300">
          <li>Basic usage data (page views, aggregate performance).</li>
          <li>Non-personal technical data (browser, device type, timestamps).</li>
          <li>No collection of sensitive personal information.</li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p className="text-sm text-neutral-300">We may store minimal preferences (e.g., refresh interval) in localStorage or cookies for a better user experience.</p>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-xl font-semibold">Third-Party Services</h2>
        <p className="text-sm text-neutral-300">We use trusted providers (e.g., Moralis, Helius) to fetch blockchain data. Their privacy practices apply when you interact with their content.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-neutral-300">We follow best practices for API access and data handling. Report issues to our X account: <a href="https://x.com/kolspotonsol" className="text-white hover:underline" target="_blank" rel="noreferrer">@kolspotonsol</a>.</p>
      </section>
    </main>
  )
}
