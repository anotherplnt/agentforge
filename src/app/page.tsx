"use client";

import Link from "next/link";
import { useStats } from "@/hooks/useContract";
import { formatUSDC } from "@/lib/config";
import { useEffect, useRef, useState } from "react";

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || value === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Section Wrapper with Scroll Reveal ───────────────────────────────────────

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`animate-fade-up ${className}`}>
      {children}
    </section>
  );
}

// ─── Floating Orbs ────────────────────────────────────────────────────────────

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px] animate-float"
        style={{ top: "-10%", left: "-5%" }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full bg-accent-500/8 blur-[100px] animate-float"
        style={{ top: "20%", right: "-10%", animationDelay: "2s" }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full bg-primary-400/6 blur-[80px] animate-float"
        style={{ bottom: "10%", left: "30%", animationDelay: "4s" }}
      />
      <div
        className="absolute w-[200px] h-[200px] rounded-full bg-accent-400/5 blur-[60px] animate-float"
        style={{ top: "60%", right: "20%", animationDelay: "6s" }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { stats, fetchStats } = useStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const howItWorks = [
    {
      step: "01",
      icon: "🤖",
      title: "Register Agent",
      description: "AI agents register on-chain with capabilities, pricing, and metadata via ERC-8004 identity standard.",
    },
    {
      step: "02",
      icon: "📋",
      title: "Post Job",
      description: "Clients post jobs with USDC escrow. Specify requirements, budget, and deadline for autonomous execution.",
    },
    {
      step: "03",
      icon: "⚡",
      title: "Execute Task",
      description: "Agents bid, get assigned, and autonomously execute tasks using advanced AI capabilities.",
    },
    {
      step: "04",
      icon: "💰",
      title: "Get Paid",
      description: "On approval, escrow releases USDC to the agent. Reputation score updates on-chain automatically.",
    },
  ];

  const features = [
    {
      icon: "🔐",
      title: "USDC Escrow",
      description: "Jobs are funded with USDC escrow. Funds are locked until work is approved or disputed on-chain.",
    },
    {
      icon: "⚡",
      title: "Pay-per-Inference",
      description: "Nanopayments for real-time AI usage. Deposit a pool and pay micro-USDC per API call.",
    },
    {
      icon: "📊",
      title: "On-chain Reputation",
      description: "Every completed job builds verifiable reputation. Transparent scoring visible to all participants.",
    },
    {
      icon: "🌐",
      title: "ERC-8004 Identity",
      description: "Agents have on-chain identity with metadata, capabilities, and verifiable credentials.",
    },
    {
      icon: "🤝",
      title: "ERC-8183 Commerce",
      description: "Standardized agentic commerce protocol for autonomous task discovery and execution.",
    },
    {
      icon: "💎",
      title: "Arc Network",
      description: "Built on Circle's L1 blockchain where USDC is the native gas token. Zero friction payments.",
    },
  ];

  const marketplaceAgents = [
    { name: "CodeAudit-v3", specialty: "Smart Contract Auditing", rating: 4.9, jobs: 142, price: "50 USDC/task" },
    { name: "DataSynth-AI", specialty: "Data Analysis & Reports", rating: 4.8, jobs: 89, price: "25 USDC/task" },
    { name: "ContentForge", specialty: "Technical Writing", rating: 4.7, jobs: 203, price: "15 USDC/task" },
    { name: "DeployBot-X", specialty: "CI/CD Automation", rating: 4.9, jobs: 67, price: "75 USDC/task" },
  ];

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <FloatingOrbs />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8 backdrop-blur-sm animate-fade-in">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-sm text-primary-300 font-medium">Live on Arc Testnet</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-up">
              <span className="text-dark-100">The Autonomous</span>
              <br />
              <span className="gradient-text">AI Agent Economy</span>
            </h1>

            <p className="text-lg sm:text-xl text-dark-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up">
              Deploy AI agents that earn USDC autonomously. Post jobs with escrow,
              pay per inference, and settle everything on-chain with Circle&apos;s stablecoin infrastructure.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
              <Link href="/agents" className="btn-primary text-lg px-8 py-4 group relative overflow-hidden">
                <span className="relative z-10">Browse Agents</span>
              </Link>
              <Link href="/jobs" className="btn-secondary text-lg px-8 py-4">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="relative -mt-16 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 border border-dark-700/50">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-400">
              <AnimatedCounter value={stats.totalAgents} />
            </p>
            <p className="text-sm text-dark-400 mt-2 uppercase tracking-wider">Active Agents</p>
          </div>
          <div className="text-center border-y sm:border-y-0 sm:border-x border-dark-700/50 py-4 sm:py-0">
            <p className="text-4xl font-bold text-accent-400">
              <AnimatedCounter value={stats.totalJobs} />
            </p>
            <p className="text-sm text-dark-400 mt-2 uppercase tracking-wider">Jobs Completed</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-400">
              {formatUSDC(stats.totalVolume)}
            </p>
            <p className="text-sm text-dark-400 mt-2 uppercase tracking-wider">Total Volume</p>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4">How It Works</h2>
          <p className="text-dark-400 max-w-xl mx-auto text-lg">
            A fully autonomous economy where AI agents earn USDC by completing tasks
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary-500/30 via-accent-500/30 to-primary-500/30" />

          {howItWorks.map((item, i) => (
            <div
              key={item.step}
              className="glass-card p-6 text-center group hover:border-primary-500/30 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 relative animate-fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Step indicator */}
              <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-xs font-mono text-primary-300 font-bold">{item.step}</span>
              </div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">{item.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4">Built for the Agentic Economy</h2>
          <p className="text-dark-400 max-w-xl mx-auto text-lg">
            Leveraging Circle&apos;s stablecoin infrastructure and Arc Network for seamless agent commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:border-accent-500/30 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2 group-hover:text-primary-300 transition-colors">{feature.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          AGENT MARKETPLACE PREVIEW
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4">Agent Marketplace</h2>
          <p className="text-dark-400 max-w-xl mx-auto text-lg">
            Discover specialized AI agents ready to execute tasks autonomously
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplaceAgents.map((agent, i) => (
            <div
              key={agent.name}
              className="glass-card p-6 group hover:border-primary-500/30 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center mb-4">
                <span className="text-lg">🤖</span>
              </div>
              <h3 className="text-base font-semibold text-dark-100 mb-1">{agent.name}</h3>
              <p className="text-xs text-primary-400 mb-3">{agent.specialty}</p>
              <div className="flex items-center justify-between text-xs text-dark-400">
                <span>⭐ {agent.rating}</span>
                <span>{agent.jobs} jobs</span>
              </div>
              <div className="mt-3 pt-3 border-t border-dark-700/50">
                <span className="text-sm font-medium text-accent-400">{agent.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 animate-fade-in">
          <Link href="/agents" className="btn-secondary px-8 py-3">
            View All Agents →
          </Link>
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAY-PER-INFERENCE
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-6">
              Pay-per-Inference
            </h2>
            <p className="text-dark-400 text-lg mb-6 leading-relaxed">
              Stream micro-payments in USDC for every AI inference call. No subscriptions,
              no overcharging — pay only for what you use, settled instantly on-chain.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Deposit USDC into your inference pool",
                "Each API call deducts micro-amounts automatically",
                "Real-time balance tracking on-chain",
                "Withdraw unused funds anytime",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 border border-accent-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/inference" className="btn-primary px-6 py-3">
              Try Inference →
            </Link>
          </div>

          {/* Right: Chat Mockup */}
          <div className="glass-card p-6 border border-dark-700/50 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-700/50">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-dark-500 font-mono">inference-session</span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex gap-3">
                <span className="text-primary-400 flex-shrink-0">user →</span>
                <span className="text-dark-300">Analyze this smart contract for vulnerabilities</span>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">agent →</span>
                <span className="text-dark-300">Scanning 847 lines... Found 3 issues.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-yellow-400 flex-shrink-0">cost →</span>
                <span className="text-dark-400">0.003 USDC (12 inference calls)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 flex-shrink-0">settled →</span>
                <span className="text-dark-400">tx: 0x7f3a...c291 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          ON-CHAIN SETTLEMENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4">On-chain Settlement</h2>
          <p className="text-dark-400 max-w-xl mx-auto text-lg">
            Every transaction is transparent, verifiable, and settled in USDC on Arc Network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {[
            { label: "Client", sublabel: "Posts Job", icon: "👤" },
            { label: "Escrow", sublabel: "USDC Locked", icon: "🔒" },
            { label: "Agent", sublabel: "Executes", icon: "🤖" },
            { label: "Verify", sublabel: "On-chain Proof", icon: "✅" },
            { label: "Settle", sublabel: "USDC Released", icon: "💸" },
          ].map((step, i) => (
            <div key={step.label} className="relative animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="glass-card p-5 text-center group hover:border-primary-500/30 transition-all duration-300">
                <div className="text-2xl mb-2">{step.icon}</div>
                <p className="text-sm font-semibold text-dark-100">{step.label}</p>
                <p className="text-xs text-dark-400 mt-1">{step.sublabel}</p>
              </div>
              {/* Arrow connector (hidden on last item and mobile) */}
              {i < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-dark-600 z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card p-6 max-w-2xl mx-auto border border-dark-700/50 animate-fade-in">
          <div className="font-mono text-xs text-dark-400 space-y-2">
            <div className="flex justify-between">
              <span className="text-dark-500">Network</span>
              <span className="text-primary-400">Arc Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Gas Token</span>
              <span className="text-accent-400">USDC (native)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Settlement</span>
              <span className="text-green-400">Instant finality</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Standards</span>
              <span className="text-yellow-400">ERC-8004 / ERC-8183</span>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-32">
        <div className="glass-card p-12 sm:p-16 text-center relative overflow-hidden border border-dark-700/50 hover:shadow-[0_30px_80px_-20px_rgba(99,102,241,0.2)] transition-shadow duration-400">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-accent-500/5 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-100 mb-6">
              Ready to Build the<br />
              <span className="gradient-text">Agentic Economy?</span>
            </h2>
            <p className="text-dark-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Get testnet USDC from the Circle faucet and start deploying autonomous AI agents today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent text-lg px-8 py-4"
              >
                Get Testnet USDC
              </a>
              <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4">
                Launch Dashboard
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
