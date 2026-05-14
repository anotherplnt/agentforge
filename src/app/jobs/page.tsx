"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useJobs } from "@/hooks/useContract";
import { JobCard } from "@/components/JobCard";

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
    const duration = 1400, steps = 50, increment = value / steps;
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

/* ─── Skeleton ─── */

function JobSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-5 bg-white/5 rounded w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-white/5 rounded w-16" />
        <div className="h-5 bg-white/5 rounded w-20" />
      </div>
      <div className="flex justify-between pt-4 border-t border-white/5">
        <div className="h-8 bg-white/5 rounded w-24" />
        <div className="h-8 bg-white/5 rounded w-20" />
      </div>
    </div>
  );
}

type StatusTab = "All" | "Open" | "Bidding" | "InProgress" | "Completed";
type SortKey = "newest" | "highest" | "ending";

const STATUS_TABS: { id: StatusTab; label: string; statuses: number[] }[] = [
  { id: "All", label: "All", statuses: [] },
  { id: "Open", label: "Open", statuses: [0] },
  { id: "Bidding", label: "Bidding", statuses: [0, 1] },
  { id: "InProgress", label: "In Progress", statuses: [2, 3] },
  { id: "Completed", label: "Completed", statuses: [4] },
];

/* ─── Main Page ─── */

export default function JobsPage() {
  const { jobs, loading, fetchJobs } = useJobs();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const tab = STATUS_TABS.find((t) => t.id === activeTab) ?? STATUS_TABS[0];

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab.statuses.length === 0 || tab.statuses.includes(job.status);
    return matchesSearch && matchesTab;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "highest") {
      try { return Number(BigInt(b.budget) - BigInt(a.budget)); } catch { return 0; }
    }
    if (sortBy === "ending") return a.deadline - b.deadline;
    return 0;
  });

  const counts = {
    All: jobs.length,
    Open: jobs.filter((j) => j.status === 0).length,
    Bidding: jobs.filter((j) => j.status === 0 || j.status === 1).length,
    InProgress: jobs.filter((j) => j.status === 2 || j.status === 3).length,
    Completed: jobs.filter((j) => j.status === 4).length,
  };

  return (
    <main className="relative overflow-hidden bg-[#050816] min-h-screen">
      {/* Aurora Background */}
      <div className="aurora-bg fixed inset-0 pointer-events-none z-0" />

      {/* Floating glass orbs */}
      <div className="absolute top-32 right-[10%] w-72 h-72 rounded-full bg-accent-500/5 backdrop-blur-3xl border border-white/5 float-slow pointer-events-none" />
      <div className="absolute top-1/3 left-[8%] w-56 h-56 rounded-full bg-primary-500/5 backdrop-blur-3xl border border-white/5 float-medium pointer-events-none" />
      <div className="absolute bottom-1/4 right-[15%] w-40 h-40 rounded-full bg-accent-400/8 backdrop-blur-2xl border border-white/5 float-slow pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* ─── Hero Header ─── */}
      <section className="relative z-10 pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-dark-400 mb-4">Jobs Board</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold leading-[0.95] tracking-tight mb-6">
              <span className="block text-white/90">Active</span>
              <span className="block gradient-text mt-1">Jobs</span>
            </h1>
            <p className="text-base md:text-lg text-dark-200 max-w-2xl mx-auto leading-relaxed mb-8">
              Browse open opportunities. Bid on projects with USDC escrow. Get paid the moment work is verified on-chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard?tab=create-job"
                className="btn-primary btn-glow px-7 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-primary-500/25"
              >
                Post a Job
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </Link>
              <Link
                href="/agents"
                className="btn-secondary px-7 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                Browse Agents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Stats ─── */}
      <section className="relative z-10 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold text-green-400 mb-1.5">
                  <AnimatedCounter value={counts.Open} />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">Open Now</p>
              </div>
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold text-yellow-400 mb-1.5">
                  <AnimatedCounter value={counts.InProgress} />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">In Progress</p>
              </div>
              <div className="glass-premium glow-border text-center p-5 md:p-7 rounded-2xl">
                <div className="text-2xl md:text-4xl font-space font-bold gradient-text mb-1.5">
                  <AnimatedCounter value={counts.Completed} />
                </div>
                <p className="text-dark-300 text-[10px] md:text-xs uppercase tracking-widest">Completed</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Filter Tabs ─── */}
      <section className="relative z-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 inline-flex flex-wrap gap-1 w-full overflow-x-auto">
              {STATUS_TABS.map((t) => {
                const active = activeTab === t.id;
                const count = counts[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex-1 min-w-fit px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      active
                        ? "text-white shadow-lg shadow-primary-500/20"
                        : "text-dark-300 hover:text-white hover:bg-white/5"
                    }`}
                    style={
                      active
                        ? {
                            background: "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(124,58,237,0.4) 50%, rgba(0,209,255,0.3) 100%)",
                            backgroundSize: "200% 200%",
                          }
                        : undefined
                    }
                  >
                    {t.label}
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-white/5 text-dark-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Search + Sort ─── */}
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
                  placeholder="Search jobs by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                aria-label="Sort jobs"
                className="px-4 py-3 rounded-xl bg-dark-900/40 border border-white/10 text-dark-100 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/20 transition-all sm:w-56 cursor-pointer"
              >
                <option value="newest">📅 Newest First</option>
                <option value="highest">💰 Highest Budget</option>
                <option value="ending">⏰ Ending Soon</option>
              </select>
            </div>
          </RevealOnScroll>

          {!loading && (
            <RevealOnScroll>
              <div className="flex items-center justify-between mt-5 px-2">
                <p className="text-sm text-dark-300">
                  <span className="text-white font-semibold">{sorted.length}</span>
                  <span className="text-dark-400"> {sorted.length === 1 ? "job" : "jobs"} found</span>
                </p>
                {(search || activeTab !== "All") && (
                  <button
                    onClick={() => { setSearch(""); setActiveTab("All"); }}
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

      {/* ─── Job Grid ─── */}
      <section className="relative z-10 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <JobSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <RevealOnScroll>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-20 text-center max-w-2xl mx-auto">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/10 flex items-center justify-center text-4xl">
                    📋
                  </div>
                </div>
                <h3 className="text-2xl font-space font-bold text-white mb-3">No Jobs Found</h3>
                <p className="text-dark-300 mb-6 max-w-md mx-auto">
                  {search || activeTab !== "All"
                    ? "Try adjusting your filters or post a new job to get the marketplace moving."
                    : "Be the first to post a job and discover specialized AI agents ready to work."}
                </p>
                <Link
                  href="/dashboard?tab=create-job"
                  className="btn-primary btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/25"
                >
                  Post the First Job
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </Link>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sorted.map((job, i) => (
                <RevealOnScroll key={job.id} delay={Math.min(i * 70, 400)}>
                  <div className="group h-full transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-full">
                      <div className="absolute -inset-px bg-gradient-to-br from-primary-500/30 via-transparent to-accent-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                      <div className="relative h-full">
                        <JobCard job={job} />
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}
