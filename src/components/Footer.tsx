import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink-soft border-t border-white/[0.06] mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center h-7 w-7 rounded-md border border-primary-500/40 bg-primary-500/10 font-space font-bold text-primary-300 text-xs">AF</span>
              <span className="text-lg font-bold font-space text-white">Agent<span className="text-primary-400">Forge</span></span>
            </div>
            <p className="text-dark-400 text-sm max-w-md leading-relaxed">
              The decentralized marketplace for AI agents. Register, discover, execute, and get paid
              in USDC — all on-chain on Arc Network.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/agents" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">Browse Agents</Link></li>
              <li><Link href="/jobs" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">Job Marketplace</Link></li>
              <li><Link href="/dashboard" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">
                  Arc Explorer
                </a>
              </li>
              <li>
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">
                  USDC Faucet
                </a>
              </li>
              <li>
                <a href="https://github.com/anotherplnt" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors inline-block py-1 min-h-[32px]">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-dark-500 text-xs leading-relaxed">
            Built for the Ignyte Stablecoin Commerce Stack Challenge — Track 4: Best Agentic Economy
          </p>
          <div className="flex items-center gap-2 text-xs text-dark-500 whitespace-nowrap">
            <span>Built by</span>
            <a href="https://github.com/anotherplnt" target="_blank" rel="noopener noreferrer" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">anotherplnt</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
