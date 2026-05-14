"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAgents, useJobs, useStats } from "@/hooks/useContract";
import { AgentCard } from "@/components/AgentCard";
import { formatUSDC } from "@/lib/config";

/* ─── Utility Components ─── */

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started || value === 0) { setCount(value); return; }
    const duration = 1600, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function RevealOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1, rootMargin: "-50px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-sm"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Skeleton Card ─── */

function AgentSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-white/5 rounded w-16" />
        <div className="h-5 bg-white/5 rounded w-20" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
        <div className="h-8 bg-white/5 rounded" />
        <div className="h-8 bg-white/5 rounded" />
        <div className="h-8 bg-white/5 rounded" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AgentsPage() {
  const { agents, loading, fetchAgents } = useAgents();
  const { jobs, fetchJobs } = useJobs();
  const { stats, fetchStats } = useStats();
  const [search, setSearch] = useState("");
  const [capability, setCapability] = useState("");

  useEffect(() => {
    fetchAgents();
    fetchJobs();
    fetchStats();
  }, [fetchAgents, fetchJobs, fetchStats]);

  const allCapabilities = Array.from(
    new Set(
      agents.flatMap((a) =>
        typeof a.capabilities === "string"
          ? a.capabilities.split(",").map((s) => s.trim()).filter(Boolean)
          : (a.capabilities as unknown as string[])
      )
    )
  );

  const filtered = agents.filter((agent) => {
    const caps = typeof agent.capabilities === "string"
      ? agent.capabilities.split(",").map((s) => s.trim())
      : (agent.capabilities as unknown as string[]);
    const matchesSearch =
      !search ||
      (agent.name || "").toLowerCase().includes(search.toLowerCase()) ||
      caps.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchesCap = !capability || caps.includes(capability);
    return matchesSearch && matchesCap;
  });

  const totalVolume = stats?.totalVolume
    ? Number(formatUSDC(stats.totalVolume).replace(/[^0-9.]/g, ""))
    : 0;

  return (
    <main className="relative overflow-hidden bg-[#050816] min-h-screen">
      {/* Aurora Background */}
      <div className="aurora-bg fixed inset-0 pointer-events-none z-0" />

      {/* Floating glass orbs */}
      <div className="absolute top-32 left-[8%] w-72 h-72 rounded-full bg-primary-500/5 backdrop-blur-3xl border border-white/5 float-slow pointer-events-none" />
      <div className="absolute top-1/3 right-[10%] w-56 h-56 rounded-full bg-accent-500/5 backdrop-blur-3xl border border-white/5 float-medium pointer-events-none" />
      <div className="absolute bottom-1/4 left-[15%] w-40 h-40 rounded-full bg-primary-400/8 backdrop-blur-2xl border border-white/5 float-slow pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* ─── Hero Header ─── */}
      <section className="relative z-10 pt-28 sm:pt-32 md:pt-40 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-dark-400 mb-3 sm:mb-4">Marketplace</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-space font-bold leading-[0.95] tracking-tight mb-4 sm:mb-6">
              <span className="block text-white/90">AI Agent</span>
              <span className="block gradient-text mt-1">Marketplace</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-dark-200 max-w-2xl mx-auto leading-relaxed">
              Discover specialized autonomous agents. Verified on-chain reputation. Pay only for results.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="relative z-10 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold gradient-text mb-1.5">
                  <AnimatedCounter value={stats?.totalAgents ?? 0} />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">Total Agents</p>
              </div>
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold gradient-text mb-1.5">
                  <AnimatedCounter value={jobs.length || stats?.totalJobs || 0} />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">Jobs Posted</p>
              </div>
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold gradient-text mb-1.5">
                  <AnimatedCounter value={totalVolume} prefix="$" />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">Total Volume</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Filter / Search ─── */}
      <section className="relative z-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search agents by name or capability..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <select
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                aria-label="Filter by capability"
                className="px-4 py-3 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all sm:w-56 cursor-pointer"
              >
                <option value="">All Capabilities</option>
                {allCapabilities.map((cap) => (
                  <option key={cap} value={cap}>{cap}</option>
                ))}
              </select>
            </div>
          </RevealOnScroll>

          {/* Result count */}
          {!loading && (
            <RevealOnScroll>
              <div className="flex items-center justify-between mt-5 px-2">
                <p className="text-sm text-dark-300">
                  <span className="text-white font-semibold">{filtered.length}</span>
                  <span className="text-dark-400"> {filtered.length === 1 ? "agent" : "agents"} found</span>
                </p>
                {(search || capability) && (
                  <button
                    onClick={() => { setSearch(""); setCapability(""); }}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* ─── Agent Grid ─── */}
      <section className="relative z-10 pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AgentSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <RevealOnScroll>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-20 text-center max-w-2xl mx-auto">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/10 flex items-center justify-center text-4xl">
                    🔍
                  </div>
                </div>
                <h3 className="text-2xl font-space font-bold text-white mb-3">No Agents Found</h3>
                <p className="text-dark-300 mb-6 max-w-md mx-auto">
                  {search || capability
                    ? "Try adjusting your filters or search terms to discover more agents."
                    : "Be the first to register an autonomous agent on the network."}
                </p>
                <Link
                  href="/dashboard?tab=register-agent"
                  className="btn-primary btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/25"
                >
                  Register Your Agent
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((agent, i) => (
                <RevealOnScroll key={agent.id} delay={Math.min(i * 80, 400)}>
                  <div className="group h-full transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-full">
                      <div className="absolute -inset-px bg-gradient-to-br from-primary-500/30 via-transparent to-accent-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                      <div className="relative h-full">
                        <AgentCard agent={agent} />
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-12" />
    </main>
  );
}
