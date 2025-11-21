import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'

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
        <Link to="/" className="flex items-center">
          <img src={logo} alt="KOLSpot logo" className="h-10 w-auto object-contain rounded-lg" />
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
          <NavLink to="/roadmap" className={navLinkClass}>
            Roadmap
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
          <Link to="/terminal" className="neon-btn">
            <span className="span"></span>
            <span className="txt">KOL Terminal</span>
          </Link>
          <a 
            href="https://app.kolspot.live" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neon-btn"
          >
            <span className="span"></span>
            <span className="txt">Launch App</span>
          </a>
        </div>
        <div className="flex md:hidden">
          <input 
            type="checkbox" 
            id="navbar-checkbox" 
            checked={mobileOpen}
            onChange={() => setMobileOpen(v => !v)}
            className="hidden"
          />
          <label 
            htmlFor="navbar-checkbox" 
            className="hamburger-toggle"
            title={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="hamburger-bar" id="bar1"></div>
            <div className="hamburger-bar" id="bar2"></div>
            <div className="hamburger-bar" id="bar3"></div>
          </label>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute inset-x-0 top-16 border-t border-white/5 bg-background/95 backdrop-blur shadow-xl animate-slide-down"
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
            <NavLink to="/roadmap" className={navLinkClass}>
              Roadmap
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
            <div className="mt-2 flex flex-col gap-2">
              <Link
                to="/terminal"
                className="px-4 py-2 rounded-md bg-accent text-black font-semibold text-center"
              >
                KOL Terminal
              </Link>
              <a
                href="https://app.kolspot.live"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md bg-accent-light text-black font-semibold text-center"
              >
                Launch App
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
