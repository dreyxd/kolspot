import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/80 backdrop-blur-xl mt-auto shadow-3d">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo & Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-3">
              <img src={logo} alt="KOLSpot" className="h-8 w-auto object-contain rounded-lg" />
            </Link>
            <p className="text-xs text-neutral-400 mb-3">
              Track top Solana KOLs and their pump.fun trades in real-time.
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://x.com/kolspotonsol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-neutral-300 hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow us on X
              </a>
              <a 
                href="https://t.me/kolspotportal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-neutral-300 hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Join our Telegram
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-medium text-sm mb-3">Navigation</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/terminal" className="text-neutral-400 hover:text-white transition-colors">
                  KOL Terminal
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-neutral-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-neutral-400 hover:text-white transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-neutral-400 hover:text-white transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-neutral-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium text-sm mb-3">Resources</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  Pump.fun
                </a>
              </li>
              <li>
                <a href="https://dexscreener.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  DexScreener
                </a>
              </li>
              <li>
                <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  Solana
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium text-sm mb-3">Legal</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy & Security
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-neutral-400 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} KOLSpot. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>Built on Solana</span>
            <span>•</span>
            <span>Trades via Helius</span>
            <span>•</span>
            <span>Data via Moralis</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
