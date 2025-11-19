import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import logo from '../assets/logo.png'
import { searchTokens, type TokenSearchResult } from '../services/moralis'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'text-black bg-accent' : 'text-neutral-300 hover:text-white hover:bg-white/5'
  }`

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<number>()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await searchTokens(searchQuery.trim(), 10)
        setSearchResults(results)
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSelectToken = (tokenAddress: string) => {
    setSearchQuery('')
    setShowResults(false)
    setSearchResults([])
    navigate(`/terminal/token/${tokenAddress}`)
  }

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="KOLSpot logo" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-semibold">KOLSpot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>
            How It Works
          </NavLink>
          <NavLink to="/kols" className={navLinkClass}>
            $KOLS
          </NavLink>
          <NavLink to="/docs" className={navLinkClass}>
            Docs
          </NavLink>
          <NavLink to="/faqs" className={navLinkClass}>
            FAQs
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {/* Token Search */}
          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens..."
                className="w-64 px-4 py-2 pr-10 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-80 bg-surface border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                {searchResults.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelectToken(token.address)}
                    className="w-full px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {token.logo && (
                        <img src={token.logo} alt={token.name} className="w-8 h-8 rounded-full" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{token.name}</span>
                          <span className="text-xs text-neutral-500">{token.symbol}</span>
                        </div>
                        <div className="text-xs text-neutral-500 font-mono truncate">
                          {shortAddress(token.address)}
                        </div>
                      </div>
                      {token.marketCap && (
                        <div className="text-xs text-accent font-semibold">
                          ${(token.marketCap / 1000).toFixed(1)}K
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full mt-2 w-80 bg-surface border border-white/10 rounded-lg shadow-2xl p-4 z-50">
                <p className="text-sm text-neutral-400 text-center">No tokens found</p>
              </div>
            )}
          </div>

          <Link to="/terminal" className="px-4 py-2 rounded-md bg-accent text-black font-semibold hover:opacity-90 transition">
            KOL Terminal
          </Link>
        </div>
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            className="p-2 rounded-md text-neutral-200 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            title={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              // X icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            ) : (
              // Hamburger icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 4.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute inset-x-0 top-16 border-t border-white/5 bg-background/95 backdrop-blur shadow-xl"
        >
          <nav className="px-4 py-4 flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/kols" className={navLinkClass}>
              $KOLS
            </NavLink>
            <NavLink to="/docs" className={navLinkClass}>
              Docs
            </NavLink>
            <NavLink to="/faqs" className={navLinkClass}>
              FAQs
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <Link
              to="/terminal"
              className="mt-2 px-4 py-2 rounded-md bg-accent text-black font-semibold text-center"
            >
              KOL Terminal
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
