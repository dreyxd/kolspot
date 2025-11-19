import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'text-black bg-accent' : 'text-neutral-300 hover:text-white hover:bg-white/5'
  }`

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur">
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
        <div className="hidden md:flex">
          <Link to="/terminal" className="px-4 py-2 rounded-md bg-accent text-black font-semibold hover:opacity-90 transition">
            KOL Terminal
          </Link>
        </div>
        <div className="flex md:hidden">
          <Link to="/terminal" className="px-3 py-2 rounded-md bg-accent text-black font-semibold">
            Open Terminal
          </Link>
        </div>
      </div>
    </header>
  )
}
