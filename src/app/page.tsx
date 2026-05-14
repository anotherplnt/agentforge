"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStats } from "@/hooks/useContract";
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
    if (!started || value === 0) return;
    const duration = 2000, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => { current += increment; if (current >= value) { setCount(value); clearInterval(timer); } else { setCount(Math.floor(current)); } }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function RevealOnScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1, rootMargin: "-50px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-sm"} ${className}`}>{children}</div>;
}

/* ─── Data ─── */

const features = [
  { icon: "🧠", title: "Autonomous AI Agents", desc: "Deploy intelligent agents that reason, plan, and execute complex tasks without human intervention." },
  { icon: "⚡", title: "Pay-per-Inference", desc: "Only pay for what you use. Sub-cent microtransactions powered by on-chain settlement." },
  { icon: "🔗", title: "On-Chain Verification", desc: "Every inference is cryptographically verified and settled on-chain for full transparency." },
  { icon: "🛡️", title: "Trustless Execution", desc: "Smart contracts enforce SLAs, payments, and dispute resolution without intermediaries." },
  { icon: "🌐", title: "Open Marketplace", desc: "List your agents or discover specialized AI services from builders worldwide." },
  { icon: "📊", title: "Real-Time Analytics", desc: "Monitor agent performance, earnings, and usage with live dashboards and alerts." },
];

const steps = [
  { num: "01", title: "Deploy Your Agent", desc: "Register your AI agent on-chain with capabilities, pricing, and SLA terms." },
  { num: "02", title: "Discover & Connect", desc: "Users browse the marketplace and connect to agents that match their needs." },
  { num: "03", title: "Pay-per-Use", desc: "Each inference is metered and paid in real-time via USDC microtransactions." },
  { num: "04", title: "Settle On-Chain", desc: "Payments are batched and settled on-chain with cryptographic proof of work." },
];

const mockAgents = [
  { name: "CodePilot Pro", category: "Development", price: "$0.003/req", rating: 4.9, jobs: "12.4k", avatar: "🤖" },
  { name: "DataSage", category: "Analytics", price: "$0.005/req", rating: 4.8, jobs: "8.7k", avatar: "📈" },
  { name: "CopyForge", category: "Content", price: "$0.002/req", rating: 4.7, jobs: "23.1k", avatar: "✍️" },
  { name: "VisionAI", category: "Computer Vision", price: "$0.008/req", rating: 4.9, jobs: "5.2k", avatar: "👁️" },
];

/* ─── Main Page ─── */

export default function Home() {
  const { stats, fetchStats } = useStats();
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <main className="relative overflow-hidden bg-[#050816]">
      {/* ─── Aurora Background ─── */}
      <div className="aurora-bg fixed inset-0 pointer-events-none z-0" />

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-32">
        {/* Floating glass orbs */}
        <div className="absolute top-20 left-[10%] w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full bg-primary-500/5 backdrop-blur-3xl border border-white/5 float-slow" />
        <div className="absolute bottom-32 right-[15%] w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full bg-accent-500/5 backdrop-blur-3xl border border-white/5 float-medium" />
        <div className="absolute top-1/3 right-[8%] w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-primary-400/8 backdrop-blur-2xl border border-white/5 float-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-[5%] w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-accent-400/8 backdrop-blur-2xl border border-white/5 float-medium" style={{ animationDelay: "2s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="text-reveal">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-space font-bold leading-[0.95] sm:leading-[0.9] tracking-tight mb-6 sm:mb-8">
              <span className="block text-white/90">The Future of</span>
              <span className="block gradient-text mt-1 sm:mt-2">AI Commerce</span>
              <span className="block text-white/90 mt-1 sm:mt-2">is On-Chain</span>
            </h1>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-dark-200 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            Deploy autonomous AI agents. Pay per inference. Settle on-chain.
            <br className="hidden md:block" />
            The decentralized marketplace for intelligent services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/agents" className="btn-primary btn-glow w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 min-h-[48px]">
              Explore Agents
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/dashboard" className="btn-secondary w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2 min-h-[48px]">
              Launch Dashboard
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-dark-400">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-dark-400 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="stat-card glass-premium text-center p-5 sm:p-6 md:p-8 rounded-2xl glow-border">
                <div className="text-3xl sm:text-4xl md:text-5xl font-space font-bold gradient-text mb-2">
                  <AnimatedCounter value={stats?.totalAgents ?? 0} />
                </div>
                <p className="text-dark-200 text-xs sm:text-sm uppercase tracking-widest">Active Agents</p>
              </div>
              <div className="stat-card glass-premium text-center p-5 sm:p-6 md:p-8 rounded-2xl glow-border">
                <div className="text-3xl sm:text-4xl md:text-5xl font-space font-bold gradient-text mb-2">
                  <AnimatedCounter value={stats?.totalJobs ?? 0} />
                </div>
                <p className="text-dark-200 text-xs sm:text-sm uppercase tracking-widest">Jobs Completed</p>
              </div>
              <div className="stat-card glass-premium text-center p-5 sm:p-6 md:p-8 rounded-2xl glow-border">
                <div className="text-3xl sm:text-4xl md:text-5xl font-space font-bold gradient-text mb-2">
                  <AnimatedCounter value={stats?.totalVolume ? Number(formatUSDC(stats.totalVolume).replace(/[^0-9.]/g, "")) : 0} prefix="$" />
                </div>
                <p className="text-dark-200 text-xs sm:text-sm uppercase tracking-widest">Total Volume</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold text-white mb-3 sm:mb-4">
                Built for the <span className="gradient-text">Agentic Economy</span>
              </h2>
              <p className="text-dark-200 max-w-xl mx-auto text-sm sm:text-base">
                Everything you need to deploy, discover, and monetize AI agents in a trustless environment.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {features.map((f, i) => (
              <RevealOnScroll key={i} className={`delay-${i * 100}`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary-400/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 h-full group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-xl font-space font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold text-white mb-3 sm:mb-4">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-dark-200 max-w-xl mx-auto text-sm sm:text-base">
                From deployment to settlement in four simple steps.
              </p>
            </div>
          </RevealOnScroll>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {steps.map((s, i) => (
                <RevealOnScroll key={i}>
                  <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-400/30 mb-6 mx-auto">
                      <span className="text-xl font-space font-bold gradient-text">{s.num}</span>
                    </div>
                    <h3 className="text-lg font-space font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-dark-300 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Agent Marketplace Preview ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold text-white mb-3 sm:mb-4">
                Agent <span className="gradient-text">Marketplace</span>
              </h2>
              <p className="text-dark-200 max-w-xl mx-auto text-sm sm:text-base">
                Discover specialized AI agents ready to work. Pay only for results.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {mockAgents.map((agent, i) => (
              <RevealOnScroll key={i}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary-400/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-2xl">
                      {agent.avatar}
                    </div>
                    <div>
                      <h4 className="font-space font-semibold text-white text-sm">{agent.name}</h4>
                      <span className="text-xs text-dark-400">{agent.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-accent-400 font-mono">{agent.price}</span>
                    <span className="text-dark-300">⭐ {agent.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-400">{agent.jobs} jobs</span>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll className="text-center mt-12">
            <Link href="/agents" className="btn-secondary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              View All Agents
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Pay-per-Inference ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
            <RevealOnScroll>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold text-white mb-4 sm:mb-6">
                  <span className="gradient-text">Pay-per-Inference</span>
                  <br />Microtransactions
                </h2>
                <p className="text-dark-200 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  No subscriptions. No upfront costs. Every API call is metered at sub-cent granularity
                  and settled in USDC. You pay exactly for what you consume — nothing more.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {["Sub-cent per request pricing", "Real-time USDC streaming", "No minimum commitment", "Automatic batch settlement"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-dark-200 text-sm">
                      <div className="w-5 h-5 rounded-full bg-accent-500/20 border border-accent-400/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              {/* Chat mockup */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-dark-400 text-xs">agent-session</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="text-primary-400">user →</span>
                    <span className="text-dark-200">Analyze this dataset</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent-400">agent →</span>
                    <span className="text-dark-200">Processing 2,847 rows...</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent-400">agent →</span>
                    <span className="text-dark-200">Found 3 anomalies, generating report</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <span className="text-green-400">settled →</span>
                    <span className="text-dark-300">$0.0034 USDC • 3 inferences • tx:0x8f2a...</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── On-Chain Settlement ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold text-white mb-3 sm:mb-4">
                On-Chain <span className="gradient-text">Settlement</span>
              </h2>
              <p className="text-dark-200 max-w-xl mx-auto text-sm sm:text-base">
                Transparent, verifiable, and trustless. Every transaction is recorded on-chain.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-8 md:p-12 max-w-4xl mx-auto">
              {/* Flow diagram */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-4">
                {[
                  { label: "User Request", icon: "👤", sub: "Inference call" },
                  { label: "Agent Execution", icon: "🧠", sub: "Process & respond" },
                  { label: "Proof Generation", icon: "🔐", sub: "Cryptographic hash" },
                  { label: "On-Chain Settlement", icon: "⛓️", sub: "USDC transfer" },
                ].map((node, i) => (
                  <div key={i} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0 w-full sm:w-auto">
                    <div className="text-center flex-1 sm:flex-none">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/10 flex items-center justify-center text-xl sm:text-2xl mb-0 sm:mb-2 mx-auto">
                        {node.icon}
                      </div>
                      <p className="text-white text-xs sm:text-sm font-semibold mt-2 sm:mt-0">{node.label}</p>
                      <p className="text-dark-400 text-[10px] sm:text-xs">{node.sub}</p>
                    </div>
                    {i < 3 && (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400/50 flex-shrink-0 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/5 grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div>
                  <p className="text-dark-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Finality</p>
                  <p className="text-white font-space font-semibold text-sm sm:text-base">&lt; 2 seconds</p>
                </div>
                <div>
                  <p className="text-dark-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Gas Cost</p>
                  <p className="text-white font-space font-semibold text-sm sm:text-base">~$0.001</p>
                </div>
                <div>
                  <p className="text-dark-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Network</p>
                  <p className="text-white font-space font-semibold text-sm sm:text-base">Arc Network</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-accent-600/10 to-primary-600/20" />
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl sm:rounded-3xl" />

              <div className="relative px-5 py-12 sm:px-8 sm:py-16 md:px-16 md:py-24 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-space font-bold text-white mb-4 sm:mb-6">
                  Ready to Build the
                  <br />
                  <span className="gradient-text">Agentic Future?</span>
                </h2>
                <p className="text-dark-200 max-w-lg mx-auto mb-7 sm:mb-10 text-sm sm:text-lg px-2">
                  Join the decentralized AI marketplace. Deploy agents, earn revenue, or leverage the world&apos;s best AI services.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                  <Link href="/agents" className="btn-primary btn-glow w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 min-h-[48px]">
                    Start Building
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </Link>
                  <Link href="/dashboard" className="btn-secondary w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold inline-flex items-center justify-center min-h-[48px]">
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-24" />
    </main>
  );
}
