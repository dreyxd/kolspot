import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.webp'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
    isActive ? 'text-white bg-accent shadow-glow' : 'text-neutral-300 hover:text-white hover:bg-white/5'
  }`

export default function Navbar() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl relative shadow-3d">
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
          <a 
            href="https://app.kolspot.live" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg border border-accent/50 text-accent font-semibold hover:bg-accent/10 hover:border-accent transition-all duration-300"
          >
            Launch App
          </a>
          <Link to="/terminal" className="px-5 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent-soft shadow-glow hover:shadow-glow-lg transition-all duration-300">
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
