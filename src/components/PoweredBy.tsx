import heliusLogo from '../assets/helius.webp'
import moralisLogo from '../assets/moralis.webp'
import solLogo from '../assets/sol.webp'

export default function PoweredBy() {
  const partners = [
    { name: 'Helius', logo: heliusLogo },
    { name: 'Moralis', logo: moralisLogo },
    { name: 'Solana', logo: solLogo },
  ]

  return (
    <section className="py-16 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
            Powered By
          </h2>
          <p className="text-neutral-400 text-sm">
            Built with industry-leading blockchain infrastructure
          </p>
        </div>

        {/* Infinite Scroll Container */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
          
          <div className="overflow-hidden">
            <div className="flex gap-16 animate-scroll-partners">
              {/* Duplicate the array twice for seamless loop */}
              {[...partners, ...partners, ...partners].map((partner, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
