"use client";

import Link from "next/link";
import { useWalletStore } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/config";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <span className="text-xl font-bold gradient-text">AgentForge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/agents" className="text-dark-300 hover:text-white transition-colors">
              Agents
            </Link>
            <Link href="/jobs" className="text-dark-300 hover:text-white transition-colors">
              Jobs
            </Link>
            <Link href="/dashboard" className="text-dark-300 hover:text-white transition-colors">
              Dashboard
            </Link>

            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-accent-400 bg-accent-500/10 px-3 py-1 rounded-full border border-accent-500/20">
                  {shortenAddress(address!)}
                </span>
                <button
                  onClick={disconnect}
                  className="text-sm text-dark-400 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary text-sm py-2"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/agents" className="block px-3 py-2 text-dark-300 hover:text-white">
              Agents
            </Link>
            <Link href="/jobs" className="block px-3 py-2 text-dark-300 hover:text-white">
              Jobs
            </Link>
            <Link href="/dashboard" className="block px-3 py-2 text-dark-300 hover:text-white">
              Dashboard
            </Link>
            {isConnected ? (
              <div className="px-3 py-2">
                <span className="text-sm text-accent-400">{shortenAddress(address!)}</span>
                <button onClick={disconnect} className="ml-3 text-sm text-red-400">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connect} className="btn-primary text-sm py-2 mx-3">
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
