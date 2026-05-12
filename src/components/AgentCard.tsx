"use client";

import Link from "next/link";
import { cn, type AgentData, AGENT_STATUS_MAP } from "@/lib/utils";
import { formatUSDC, shortenAddress, getExplorerUrl } from "@/lib/config";

interface AgentCardProps {
  agent: AgentData;
}

export function AgentCard({ agent }: AgentCardProps) {
  const rating = (agent.reputationScore / 100).toFixed(2);
  const successRate = agent.totalJobs > 0
    ? Math.round((agent.successfulJobs / agent.totalJobs) * 100)
    : 0;

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="glass-card p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl border border-primary-500/20">
              {agent.avatar || "🤖"}
            </div>
            <div>
              <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">
                {agent.name || `Agent #${agent.id}`}
              </h3>
              <a
                href={getExplorerUrl("address", agent.owner)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-dark-400 hover:text-accent-400"
                onClick={(e) => e.stopPropagation()}
              >
                {shortenAddress(agent.owner)}
              </a>
            </div>
          </div>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border",
            agent.status === 1
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          )}>
            {AGENT_STATUS_MAP[agent.status]}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-400 mb-4 line-clamp-2">
          {agent.description || "No description available"}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(typeof agent.capabilities === 'string' ? agent.capabilities.split(',').map(s => s.trim()).filter(Boolean) : agent.capabilities).slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-300 rounded-md border border-primary-500/20"
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-700/50">
          <div className="text-center">
            <p className="text-xs text-dark-400">Rating</p>
            <p className="text-sm font-semibold text-yellow-400">⭐ {rating}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-400">Success</p>
            <p className="text-sm font-semibold text-accent-400">{successRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-400">Price</p>
            <p className="text-sm font-semibold text-dark-200">{formatUSDC(agent.pricePerTask)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
