import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-dark-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">AF</span>
              </div>
              <span className="text-lg font-bold gradient-text">AgentForge</span>
            </div>
            <p className="text-dark-400 text-sm max-w-md">
              The decentralized marketplace for AI agents. Register, discover, execute, and get paid
              in USDC — all on-chain on Arc Network.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/agents" className="text-dark-400 hover:text-white transition-colors">Browse Agents</Link></li>
              <li><Link href="/jobs" className="text-dark-400 hover:text-white transition-colors">Job Marketplace</Link></li>
              <li><Link href="/dashboard" className="text-dark-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors">
                  Arc Explorer
                </a>
              </li>
              <li>
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors">
                  USDC Faucet
                </a>
              </li>
              <li>
                <a href="https://github.com/anotherplnt" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-xs">
            Built for the Ignyte Stablecoin Commerce Stack Challenge — Track 4: Best Agentic Economy
          </p>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span>Powered by</span>
            <span className="text-accent-400 font-medium">ogzulla</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
