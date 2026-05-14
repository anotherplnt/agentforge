"use client";

import { useAgents } from "@/hooks/useContract";
import { formatUSDC, shortenAddress, getExplorerUrl } from "@/lib/config";
import { AGENT_STATUS_MAP } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { agents, fetchAgents } = useAgents();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const agent = agents.find((a) => a.id === parseInt(id));

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#050816] pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
        <p className="text-4xl mb-4">🤖</p>
        <p className="text-dark-400">Agent not found</p>
        <Link href="/agents" className="btn-primary mt-4 inline-block">
          Back to Agents
        </Link>
      </div>
      </div>
    );
  }

  const rating = (agent.reputationScore / 100).toFixed(2);
  const successRate = agent.totalJobs > 0
    ? Math.round((agent.successfulJobs / agent.totalJobs) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#050816] pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-dark-400 mb-6 sm:mb-8">
        <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
        <span>/</span>
        <span className="text-dark-200 truncate">{agent.name || `Agent #${agent.id}`}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl border border-primary-500/20 flex-shrink-0">
                {agent.avatar || "🤖"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-dark-100 truncate">
                  {agent.name || `Agent #${agent.id}`}
                </h1>
                <a
                  href={getExplorerUrl("address", agent.owner)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-accent-400 hover:underline"
                >
                  {shortenAddress(agent.owner)}
                </a>
              </div>
              <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap flex-shrink-0">
                {AGENT_STATUS_MAP[agent.status]}
              </span>
            </div>

            <p className="text-sm sm:text-base text-dark-300 mb-4 sm:mb-6 leading-relaxed">
              {agent.description || "No description available"}
            </p>

            {/* Capabilities */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-dark-200 mb-2 sm:mb-3">Capabilities</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(typeof agent.capabilities === 'string' ? agent.capabilities.split(',').map(s => s.trim()).filter(Boolean) : agent.capabilities).map((cap) => (
                  <span
                    key={cap}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-500/10 text-primary-300 rounded-lg border border-primary-500/20 text-xs sm:text-sm"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-dark-800/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-dark-400 mb-1">Per Task</p>
                <p className="text-xl sm:text-2xl font-bold text-accent-400">{formatUSDC(agent.pricePerTask)}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-dark-400 mb-1">Per Inference</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-400">{formatUSDC(agent.pricePerInference)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Performance</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Rating</span>
                <span className="text-yellow-400 font-semibold text-sm">⭐ {rating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Success Rate</span>
                <span className="text-accent-400 font-semibold text-sm">{successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Total Jobs</span>
                <span className="text-dark-200 font-semibold text-sm">{agent.totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Successful</span>
                <span className="text-dark-200 font-semibold text-sm">{agent.successfulJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Total Earnings</span>
                <span className="text-accent-400 font-semibold text-sm">{formatUSDC(agent.totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href={`/dashboard?tab=create-job`} className="btn-primary w-full text-center block py-3 min-h-[48px] flex items-center justify-center">
                Hire This Agent
              </Link>
              <Link href={`/dashboard?tab=inference`} className="btn-secondary w-full text-center block py-3 min-h-[48px] flex items-center justify-center">
                Pay-per-Inference
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
