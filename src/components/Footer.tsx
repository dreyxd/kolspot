import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="KOLSpot" className="h-8 w-8 rounded-md object-cover" />
              <span className="font-semibold text-lg">KOLSpot</span>
            </Link>
            <p className="text-sm text-neutral-400 mb-4">
              Track top Solana KOLs and their pump.fun trades in real-time.
            </p>
            <a 
              href="https://x.com/kolspot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow us on X
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-medium mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaderboard" className="text-neutral-400 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/kolboard" className="text-neutral-400 hover:text-white transition-colors">
                  KOLBoard
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-neutral-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-neutral-400">
                Analytics Platform
              </li>
              <li className="text-neutral-400">
                Not Financial Advice
              </li>
              <li className="text-neutral-400">
                DYOR (Do Your Own Research)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} KOLSpot. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <span>Built on Solana</span>
            <span>•</span>
            <span>Powered by Helius</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
