"use client";

import Link from "next/link";
import { useWalletStore } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/config";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu when window resized to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-h-[44px]" onClick={closeMenu}>
              <img
                src="/logo-icon.jpg"
                alt="AgentForge"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl ring-1 ring-white/10 group-hover:ring-cyber-cyan/30 transition-all duration-300"
              />
              <span className="text-base sm:text-xl font-bold font-space gradient-text-premium ml-1.5 sm:ml-2">AgentForge</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
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
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-dark-200 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer + Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeMenu}
        />

        {/* Drawer */}
        <div
          className={`absolute top-16 sm:top-20 left-0 right-0 bg-[#050816]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
            mobileOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="px-4 py-5 space-y-1.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link
              href="/agents"
              onClick={closeMenu}
              className="block px-4 py-3.5 text-base text-dark-200 hover:text-white rounded-xl hover:bg-white/5 transition-all min-h-[44px] uppercase tracking-wider font-medium"
            >
              Agents
            </Link>
            <Link
              href="/jobs"
              onClick={closeMenu}
              className="block px-4 py-3.5 text-base text-dark-200 hover:text-white rounded-xl hover:bg-white/5 transition-all min-h-[44px] uppercase tracking-wider font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="block px-4 py-3.5 text-base text-dark-200 hover:text-white rounded-xl hover:bg-white/5 transition-all min-h-[44px] uppercase tracking-wider font-medium"
            >
              Dashboard
            </Link>

            <div className="pt-3 mt-2 border-t border-white/[0.06]">
              {isConnected ? (
                <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm text-cyber-cyan font-mono bg-cyber-cyan/10 px-3 py-2 rounded-xl border border-cyber-cyan/20">
                    {shortenAddress(address!)}
                  </span>
                  <button
                    onClick={() => { disconnect(); closeMenu(); }}
                    className="text-sm text-red-400 hover:text-red-300 px-3 py-2 min-h-[44px]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { connect(); closeMenu(); }}
                  disabled={isConnecting}
                  className="btn-glow w-full text-base !py-3 !rounded-xl mx-0"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
