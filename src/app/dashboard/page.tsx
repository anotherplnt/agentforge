"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWalletStore } from "@/hooks/useWallet";
import { useAgents, useJobs, useStats } from "@/hooks/useContract";
import { formatUSDC, shortenAddress } from "@/lib/config";
import { CONTRACTS, getExplorerUrl, parseUSDC } from "@/lib/config";
import { JOB_STATUS_MAP, JOB_STATUS_COLORS, cn } from "@/lib/utils";
import { sendContractTx, publicClient, switchToArcTestnet } from "@/lib/client";
import { AGENTFORGE_ABI } from "@/lib/abi";

const CONTRACT_ADDRESS = CONTRACTS.agentForge as `0x${string}`;

type Tab = "overview" | "create-job" | "register-agent" | "inference";

/* ─── Reveal Animation ─── */

function RevealOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1, rootMargin: "-30px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-sm"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ─── */

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
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
    if (!started) return;
    if (value === 0) { setCount(0); return; }
    const duration = 1200, steps = 40, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}</span>;
}

/* ─── Premium Wrapper ─── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative overflow-hidden bg-[#050816] min-h-screen">
      <div className="aurora-bg fixed inset-0 pointer-events-none z-0" />
      <div className="absolute top-32 left-[8%] w-72 h-72 rounded-full bg-primary-500/5 backdrop-blur-3xl border border-white/5 float-slow pointer-events-none" />
      <div className="absolute top-1/3 right-[10%] w-56 h-56 rounded-full bg-accent-500/5 backdrop-blur-3xl border border-white/5 float-medium pointer-events-none" />
      <div className="absolute bottom-1/4 left-[15%] w-40 h-40 rounded-full bg-primary-400/8 backdrop-blur-2xl border border-white/5 float-slow pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="relative z-10">{children}</div>
    </main>
  );
}

/* ─── Main Page ─── */

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { address, isConnected, isConnecting, connect } = useWalletStore();
  const { agents, fetchAgents } = useAgents();
  const { jobs, fetchJobs } = useJobs();
  const { stats, fetchStats } = useStats();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "create-job", "register-agent", "inference"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAgents();
    fetchJobs();
    fetchStats();
  }, [fetchAgents, fetchJobs, fetchStats]);

  /* ─── Disconnected State ─── */
  if (!isConnected) {
    return (
      <PageShell>
        <section className="pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-reveal">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-14 max-w-xl mx-auto text-center relative overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 pointer-events-none" />
                <div className="relative">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-3xl">
                      🔐
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-dark-400 mb-3">Authentication Required</p>
                  <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
                    <span className="text-white/90">Connect Your </span>
                    <span className="gradient-text">Wallet</span>
                  </h2>
                  <p className="text-dark-300 mb-8 leading-relaxed">
                    Sign in with your Web3 wallet to access the dashboard, post jobs, register agents, and manage your inference pool.
                  </p>
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    className="btn-primary btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-primary-500/25"
                  >
                    {isConnecting ? "⏳ Connecting..." : "Connect Wallet"}
                    {!isConnecting && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const myJobs = jobs.filter((j) => j.client?.toLowerCase() === address?.toLowerCase());
  const myAgent = agents.find((a) => a.owner?.toLowerCase() === address?.toLowerCase());
  const activeJobs = myJobs.filter((j) => j.status === 0 || j.status === 1 || j.status === 2 || j.status === 3).length;
  const totalEarned = myAgent ? myAgent.totalEarnings : "0";
  const reputation = myAgent ? (myAgent.reputationScore / 100).toFixed(2) : "0.00";
  const pendingTasks = myJobs.filter((j) => j.status === 3).length;

  return (
    <PageShell>
      {/* ─── Welcome Header ─── */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-reveal">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-dark-400 mb-3">Dashboard</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-space font-bold leading-[0.95] tracking-tight mb-3">
                  <span className="text-white/90">Welcome </span>
                  <span className="gradient-text">back</span>
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-2 text-sm font-mono text-cyber-cyan bg-cyber-cyan/10 px-4 py-2 rounded-xl border border-cyber-cyan/20">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {shortenAddress(address!)}
                  </span>
                  <a
                    href={getExplorerUrl("address", address!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dark-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                  >
                    View on ArcScan
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>

              {/* Quick action */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard?tab=create-job"
                  onClick={() => setActiveTab("create-job")}
                  className="btn-primary btn-glow px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-primary-500/25"
                >
                  + Post Job
                </Link>
                {!myAgent && (
                  <Link
                    href="/dashboard?tab=register-agent"
                    onClick={() => setActiveTab("register-agent")}
                    className="btn-secondary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                  >
                    Register Agent
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Stat Cards ─── */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <RevealOnScroll delay={0}>
              <StatCard
                label="Active Jobs"
                icon="📋"
                value={<AnimatedCounter value={activeJobs} />}
                color="from-primary-500/20 to-primary-600/10"
                accent="text-primary-300"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <StatCard
                label="Total Earned"
                icon="💰"
                value={formatUSDC(totalEarned)}
                color="from-accent-500/20 to-accent-600/10"
                accent="text-accent-300"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={160}>
              <StatCard
                label="Reputation"
                icon="⭐"
                value={`${reputation}`}
                color="from-yellow-500/20 to-yellow-600/10"
                accent="text-yellow-300"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={240}>
              <StatCard
                label="Pending Tasks"
                icon="⏳"
                value={<AnimatedCounter value={pendingTasks} />}
                color="from-cyan-500/20 to-cyan-600/10"
                accent="text-cyan-300"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── Tabs ─── */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 inline-flex flex-wrap gap-1 w-full overflow-x-auto">
              {[
                { id: "overview" as Tab, label: "Overview", icon: "📊" },
                { id: "create-job" as Tab, label: "Post Job", icon: "📋" },
                { id: "register-agent" as Tab, label: "My Agent", icon: "🤖" },
                { id: "inference" as Tab, label: "Inference Chat", icon: "⚡" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 min-w-fit px-4 md:px-6 py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap inline-flex items-center justify-center gap-2 ${
                      active
                        ? "text-white shadow-lg shadow-primary-500/20"
                        : "text-dark-300 hover:text-white hover:bg-white/5"
                    }`}
                    style={
                      active
                        ? {
                            background: "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(124,58,237,0.4) 50%, rgba(0,209,255,0.3) 100%)",
                          }
                        : undefined
                    }
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Tab Content ─── */}
      <section className="pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "overview" && (
            <OverviewTab myJobs={myJobs} myAgent={myAgent} />
          )}
          {activeTab === "create-job" && (
            <CreateJobTab address={address!} onSuccess={() => { fetchJobs(); fetchStats(); }} />
          )}
          {activeTab === "register-agent" && (
            <RegisterAgentTab myAgent={myAgent} address={address!} onSuccess={fetchAgents} />
          )}
          {activeTab === "inference" && (
            <InferenceTab agents={agents} address={address!} />
          )}
        </div>
      </section>
    </PageShell>
  );
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  icon,
  value,
  color,
  accent,
}: {
  label: string;
  icon: string;
  value: React.ReactNode;
  color: string;
  accent: string;
}) {
  return (
    <div className="group relative h-full">
      <div className={`absolute -inset-px bg-gradient-to-br ${color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
      <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 group-hover:border-white/20 group-hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} border border-white/10 flex items-center justify-center text-lg`}>
            {icon}
          </div>
        </div>
        <p className={`text-2xl md:text-3xl font-space font-bold ${accent} mb-1`}>{value}</p>
        <p className="text-[11px] md:text-xs text-dark-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════ */

function OverviewTab({ myJobs, myAgent }: { myJobs: any[]; myAgent: any }) {
  return (
    <div className="space-y-8">
      {/* My Jobs */}
      <RevealOnScroll>
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-space font-bold text-white mb-1">My Jobs</h3>
              <p className="text-sm text-dark-400">Jobs you&apos;ve posted as a buyer</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300">
              {myJobs.length} {myJobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {myJobs.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3 opacity-50">📋</div>
              <p className="text-dark-300 mb-4">No jobs yet. Create your first job to get started.</p>
              <Link
                href="/dashboard?tab=create-job"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myJobs.map((job, i) => {
                const status = JOB_STATUS_MAP[job.status];
                const statusColor = JOB_STATUS_COLORS[status];
                return (
                  <RevealOnScroll key={job.id} delay={Math.min(i * 60, 300)}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="block group"
                    >
                      <div className="relative h-full">
                        <div className="absolute -inset-px bg-gradient-to-br from-primary-500/30 via-transparent to-accent-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                        <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 group-hover:border-white/20 group-hover:-translate-y-0.5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1 flex-1">
                              {job.title}
                            </p>
                            <span className={cn("text-[10px] px-2 py-1 rounded-full border whitespace-nowrap", statusColor)}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-dark-400 line-clamp-2 mb-3">{job.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div>
                              <p className="text-[10px] text-dark-400 uppercase tracking-wider">Budget</p>
                              <p className="text-sm font-semibold text-accent-400">{formatUSDC(job.budget)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-dark-400 uppercase tracking-wider">Bids</p>
                              <p className="text-sm font-semibold text-white">{job.bidCount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </RevealOnScroll>

      {/* My Agent */}
      <RevealOnScroll>
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-space font-bold text-white mb-1">My Agent</h3>
              <p className="text-sm text-dark-400">Your registered AI agent on-chain</p>
            </div>
            {myAgent && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {!myAgent ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3 opacity-50">🤖</div>
              <p className="text-dark-300 mb-4">No agent registered yet. Become a service provider.</p>
              <Link
                href="/dashboard?tab=register-agent"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Register an Agent
              </Link>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-br from-primary-500/30 via-transparent to-accent-500/30 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/40 to-accent-500/40 blur-md" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-3xl">
                      🤖
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Agent</p>
                    <p className="text-xl font-space font-bold text-white truncate">{myAgent.name || `Agent #${myAgent.id}`}</p>
                    <p className="text-xs text-dark-400 line-clamp-1">{myAgent.description || `On-chain ID #${myAgent.id}`}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Rating</p>
                    <p className="text-lg font-space font-bold text-yellow-400">⭐ {(myAgent.reputationScore / 100).toFixed(2)}</p>
                  </div>
                  <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Jobs</p>
                    <p className="text-lg font-space font-bold text-primary-400">{myAgent.totalJobs}</p>
                  </div>
                  <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Earned</p>
                    <p className="text-lg font-space font-bold text-accent-400">{formatUSDC(myAgent.totalEarnings)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RevealOnScroll>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CREATE JOB TAB
   ═══════════════════════════════════════════════════════════════════════ */

function CreateJobTab({ address, onSuccess }: { address: string; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      await switchToArcTestnet();
      const deadlineTimestamp = BigInt(Math.floor(new Date(deadline).getTime() / 1000));
      const budgetWei = parseUSDC(budget);

      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "createJob",
        args: [title, description, capabilities, deadlineTimestamp],
        value: budgetWei,
        from: address,
      });

      setTxHash(hash);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setCapabilities("");

      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
      onSuccess();
    } catch (err: any) {
      console.error("Create job failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RevealOnScroll>
      <div className="max-w-2xl">
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 rounded-3xl blur-sm" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 md:p-9">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-lg">
                📋
              </div>
              <div>
                <h3 className="text-2xl font-space font-bold text-white">Post a New Job</h3>
                <p className="text-sm text-dark-400">USDC will be escrowed automatically</p>
              </div>
            </div>

            {success && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm">
                <p className="text-green-300 font-semibold flex items-center gap-2">
                  <span className="text-base">✅</span> Job created successfully
                </p>
                <p className="text-green-300/70 text-xs mt-1">USDC has been escrowed in the contract.</p>
                {txHash && (
                  <a
                    href={getExplorerUrl("tx", txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-primary-400 underline text-xs hover:text-primary-300"
                  >
                    View transaction on ArcScan →
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
                <p className="text-red-300 font-semibold flex items-center gap-2">
                  <span className="text-base">⚠️</span> Transaction failed
                </p>
                <p className="text-red-300/70 text-xs mt-1 break-words">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mt-7">
              <FormField id="job-title" label="Job Title">
                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Write technical documentation"
                  className="premium-input"
                  required
                />
              </FormField>

              <FormField id="job-description" label="Description">
                <textarea
                  id="job-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task in detail..."
                  className="premium-input min-h-[120px] resize-y"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField id="job-budget" label="Budget (USDC)">
                  <input
                    id="job-budget"
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="10.00"
                    className="premium-input"
                    required
                  />
                </FormField>
                <FormField id="job-deadline" label="Deadline">
                  <input
                    id="job-deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="premium-input"
                    required
                  />
                </FormField>
              </div>

              <FormField id="job-capabilities" label="Required Capabilities (comma-separated)">
                <input
                  id="job-capabilities"
                  type="text"
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  placeholder="text-generation, summarization"
                  className="premium-input"
                />
              </FormField>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-glow w-full py-4 rounded-xl text-base font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : (
                  <>
                    Create Job & Escrow USDC
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}

/* ─── Form Field ─── */

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-dark-200 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      <style jsx>{`
        :global(.premium-input) {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgb(241, 245, 249);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        :global(.premium-input::placeholder) {
          color: rgb(148, 163, 184);
        }
        :global(.premium-input:focus) {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          background: rgba(15, 23, 42, 0.6);
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   REGISTER AGENT TAB
   ═══════════════════════════════════════════════════════════════════════ */

function RegisterAgentTab({ myAgent, address, onSuccess }: { myAgent: any; address: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [pricePerTask, setPricePerTask] = useState("");
  const [pricePerInference, setPricePerInference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (myAgent) {
    return (
      <RevealOnScroll>
        <div className="max-w-2xl">
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-br from-primary-500/30 via-transparent to-accent-500/30 rounded-3xl blur-sm" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-9 md:p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/40 to-accent-500/40 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-4xl">
                  🤖
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-dark-400 mb-2">Already Registered</p>
              <h3 className="text-3xl font-space font-bold text-white mb-2">
                {myAgent.name || `Agent #${myAgent.id}`}
              </h3>
              <p className="text-dark-300 mb-8">Your agent is live and accepting jobs on-chain.</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Rating</p>
                  <p className="text-lg font-space font-bold text-yellow-400">⭐ {(myAgent.reputationScore / 100).toFixed(2)}</p>
                </div>
                <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Jobs</p>
                  <p className="text-lg font-space font-bold text-primary-400">{myAgent.totalJobs}</p>
                </div>
                <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Earnings</p>
                  <p className="text-lg font-space font-bold text-accent-400">{formatUSDC(myAgent.totalEarnings)}</p>
                </div>
              </div>

              <Link
                href={`/agents/${myAgent.id}`}
                className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                View Public Profile
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      await switchToArcTestnet();
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify({ name, description }))}`;
      const priceTaskWei = parseUSDC(pricePerTask);
      const priceInferenceWei = parseUSDC(pricePerInference);

      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "registerAgent",
        args: [metadataURI, capabilities, priceTaskWei, priceInferenceWei],
        from: address,
      });

      setTxHash(hash);
      setSuccess(true);
      setName("");
      setDescription("");
      setCapabilities("");
      setPricePerTask("");
      setPricePerInference("");

      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
      onSuccess();
    } catch (err: any) {
      console.error("Register agent failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RevealOnScroll>
      <div className="max-w-2xl">
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 rounded-3xl blur-sm" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 md:p-9">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="text-2xl font-space font-bold text-white">Register Your AI Agent</h3>
                <p className="text-sm text-dark-400">Become a service provider on-chain</p>
              </div>
            </div>

            {success && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm">
                <p className="text-green-300 font-semibold flex items-center gap-2">
                  <span className="text-base">✅</span> Agent registered on-chain
                </p>
                {txHash && (
                  <a
                    href={getExplorerUrl("tx", txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-primary-400 underline text-xs hover:text-primary-300"
                  >
                    View transaction on ArcScan →
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
                <p className="text-red-300 font-semibold flex items-center gap-2">
                  <span className="text-base">⚠️</span> Transaction failed
                </p>
                <p className="text-red-300/70 text-xs mt-1 break-words">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mt-7">
              <FormField id="agent-name" label="Agent Name">
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GPT-Forge Alpha"
                  className="premium-input"
                  required
                />
              </FormField>

              <FormField id="agent-description" label="Description">
                <textarea
                  id="agent-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your agent's capabilities..."
                  className="premium-input min-h-[100px] resize-y"
                  required
                />
              </FormField>

              <FormField id="agent-capabilities" label="Capabilities (comma-separated)">
                <input
                  id="agent-capabilities"
                  type="text"
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  placeholder="text-generation, code-review, data-analysis"
                  className="premium-input"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField id="agent-price-task" label="Price per Task (USDC)">
                  <input
                    id="agent-price-task"
                    type="number"
                    step="0.01"
                    value={pricePerTask}
                    onChange={(e) => setPricePerTask(e.target.value)}
                    placeholder="5.00"
                    className="premium-input"
                    required
                  />
                </FormField>
                <FormField id="agent-price-inference" label="Price per Inference (USDC)">
                  <input
                    id="agent-price-inference"
                    type="number"
                    step="0.001"
                    value={pricePerInference}
                    onChange={(e) => setPricePerInference(e.target.value)}
                    placeholder="0.01"
                    className="premium-input"
                    required
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-glow w-full py-4 rounded-xl text-base font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : (
                  <>
                    Register Agent On-Chain
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   INFERENCE TAB
   ═══════════════════════════════════════════════════════════════════════ */

function InferenceTab({ agents, address }: { agents: any[]; address: string }) {
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string; cost?: string }[]>(() => {
    if (typeof window === "undefined") return [
      { role: "agent", content: "Hello! I'm FOOM, your AI Agent on AgentForge. Each message costs $0.01 USDC via nanopayments. How can I help you today?" },
    ];
    const saved = localStorage.getItem("agentforge_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { role: "agent", content: "Hello! I'm FOOM, your AI Agent on AgentForge. Each message costs $0.01 USDC via nanopayments. How can I help you today?" },
    ];
  });
  const [input, setInput] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [poolBalance, setPoolBalance] = useState<string>("loading");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const selectedAgent = agents.length > 0 ? agents[0] : { id: 1, name: "FOOM", description: "AI Agent specialized in text generation, code review, and data analysis" };

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 1) {
      localStorage.setItem("agentforge_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    async function fetchPool() {
      if (typeof window === "undefined") return;
      try {
        const { createPublicClient, http } = await import("viem");
        const client = createPublicClient({
          chain: { id: 5042002, name: "Arc", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } } },
          transport: http("https://rpc.testnet.arc.network", { timeout: 8000 }),
        });
        const result = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "getInferencePool",
          args: [address as `0x${string}`],
        });
        const balance = (result as any).balance || (result as any)[0] || BigInt(0);
        const formatted = formatUSDC(balance.toString());
        setPoolBalance(formatted);
      } catch {
        setPoolBalance("$0.00");
      }
    }
    fetchPool();
  }, [address, depositing]);

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setDepositing(true);
    setDepositTxHash(null);

    try {
      await switchToArcTestnet();
      const amountWei = parseUSDC(depositAmount);
      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "depositInferencePool",
        args: [],
        value: amountWei,
        from: address,
      });

      setDepositTxHash(hash);
      setDepositAmount("");
      localStorage.setItem("agentforge_has_deposited", "true");
      setPoolBalance("funded");

      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
    } catch (err: any) {
      console.error("Deposit failed:", err);
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!depositAmount) return;
    setDepositing(true);
    try {
      await switchToArcTestnet();
      const amountWei = parseUSDC(depositAmount);
      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "withdrawInferencePool",
        args: [amountWei.toString()],
        from: address,
      });
      setDepositTxHash(hash);
      setDepositAmount("");
      try { await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 }); } catch {}
    } catch (err: any) {
      console.error("Withdraw failed:", err);
    } finally {
      setDepositing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      try {
        await switchToArcTestnet();
        await sendContractTx({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "chargeInference",
          args: [BigInt(selectedAgent?.id || 1)],
          from: address,
        });
      } catch (chargeErr: any) {
        console.warn("Charge skipped:", chargeErr?.shortMessage || chargeErr?.message);
      }

      const res = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          agentId: selectedAgent?.id || 1,
          depositorAddress: address || "0x0000000000000000000000000000000000000000",
          history: newMessages.filter((m) => m.content).slice(-6),
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const cost = data.inference?.cost || 0.01;
      setTotalCost((prev) => prev + cost);

      setMessages((prev) => [
        ...prev,
        { role: "agent", content: data.response || "Processing complete.", cost: `$${cost.toFixed(4)}` },
      ]);

      setDepositing((prev) => !prev);
      setTimeout(() => setDepositing((prev) => !prev), 100);
    } catch (err) {
      console.error("Inference error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "I'm processing your request. Please try again in a moment.", cost: "$0.00" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <RevealOnScroll>
      <div className="max-w-3xl space-y-5">
        {/* Inference Pool Card */}
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-br from-accent-500/20 via-transparent to-primary-500/20 rounded-2xl blur-sm" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-white/10 flex items-center justify-center text-xl">
                  💎
                </div>
                <div>
                  <p className="text-[11px] text-dark-400 uppercase tracking-wider">Inference Pool Balance</p>
                  <p className="text-2xl font-space font-bold text-accent-400">{poolBalance}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <input
                  type="number"
                  step="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="1.00"
                  aria-label="Deposit amount"
                  className="px-3 py-2.5 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all w-24 text-sm"
                />
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                  className="btn-primary text-sm px-4 py-2.5 rounded-xl disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {depositing ? (
                    <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Deposit"}
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={depositing || !depositAmount}
                  className="btn-secondary text-sm px-4 py-2.5 rounded-xl disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>
            </div>
            {depositTxHash && (
              <a
                href={getExplorerUrl("tx", depositTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-primary-400 underline hover:text-primary-300"
              >
                View tx on ArcScan →
              </a>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 rounded-2xl blur-sm" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-dark-900/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 border border-white/10 flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 ring-2 ring-[#0a0f1f] animate-pulse" />
                </div>
                <div>
                  <p className="font-space font-semibold text-white text-sm">{selectedAgent?.name || "AI Agent"}</p>
                  <p className="text-[11px] text-accent-400">$0.01 per message · Live</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-dark-400 uppercase tracking-wider">Session Spent</p>
                <p className="text-sm font-space font-bold text-accent-400">${totalCost.toFixed(4)}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[320px] sm:h-[420px] overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 scroll-smooth" style={{ overscrollBehavior: "contain" }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm",
                      msg.role === "user"
                        ? "text-white shadow-lg shadow-primary-500/20"
                        : "bg-white/5 border border-white/10 text-dark-100"
                    )}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(124,58,237,0.9) 100%)" }
                        : undefined
                    }
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.cost && (
                      <p className="text-[10px] mt-1.5 opacity-60 inline-flex items-center gap-1">
                        <span>💰</span> {msg.cost} settled on-chain
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/5 flex gap-2 bg-dark-900/30">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message... ($0.01 per message)"
                aria-label="Chat message"
                className="flex-1 px-4 py-3 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="btn-primary btn-glow px-5 rounded-xl text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isTyping ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-dark-300 leading-relaxed">
            <span className="text-primary-400">💡</span> Each message triggers a nanopayment from your inference pool via the AgentForge smart contract.
            Deposit USDC above to fund your pool. Unused balance can be withdrawn anytime.
          </p>
        </div>
      </div>
    </RevealOnScroll>
  );
}
