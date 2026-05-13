"use client";

import Link from "next/link";
import { useWalletStore } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/config";
import { useState, useEffect } from "react";

export function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo-icon.jpg" alt="AgentForge" className="h-9 w-9 rounded-xl ring-1 ring-white/10 group-hover:ring-cyber-cyan/30 transition-all duration-300" />
            <span className="text-xl font-bold font-space gradient-text-premium">AgentForge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/agents" className="text-sm text-dark-400 hover:text-white transition-colors duration-300 uppercase tracking-wider font-medium">
              Agents
            </Link>
            <Link href="/jobs" className="text-sm text-dark-400 hover:text-white transition-colors duration-300 uppercase tracking-wider font-medium">
              Jobs
            </Link>
            <Link href="/dashboard" className="text-sm text-dark-400 hover:text-white transition-colors duration-300 uppercase tracking-wider font-medium">
              Dashboard
            </Link>

            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-cyber-cyan bg-cyber-cyan/10 px-4 py-2 rounded-xl border border-cyber-cyan/20 font-mono">
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
                className="btn-glow text-sm !px-6 !py-2.5 !rounded-xl"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-white transition-colors"
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
          <div className="md:hidden pb-6 space-y-2 border-t border-white/[0.06] pt-4">
            <Link href="/agents" className="block px-4 py-3 text-dark-300 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Agents
            </Link>
            <Link href="/jobs" className="block px-4 py-3 text-dark-300 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Jobs
            </Link>
            <Link href="/dashboard" className="block px-4 py-3 text-dark-300 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Dashboard
            </Link>
            {isConnected ? (
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-sm text-cyber-cyan font-mono">{shortenAddress(address!)}</span>
                <button onClick={disconnect} className="text-sm text-red-400">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connect} className="btn-glow text-sm mx-4 !py-2.5">
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
