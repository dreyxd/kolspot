import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Social */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="KOLSpot" className="h-6 w-6 rounded-md object-cover" />
              <span className="font-semibold">KOLSpot</span>
            </Link>
            <a 
              href="https://x.com/kolspot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-accent transition-colors"
              aria-label="Follow us on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-neutral-500 text-center">
            © {new Date().getFullYear()} KOLSpot. All rights reserved.
          </div>

          {/* Built with */}
          <div className="text-sm text-neutral-500">
            Built on Solana
          </div>
        </div>
      </div>
    </footer>
  )
}
