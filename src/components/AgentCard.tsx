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
    <Link href={`/agents/${agent.id}`} className="block w-full">
      <div className="glass-card p-4 sm:p-5 md:p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group cursor-pointer min-h-[44px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl border border-primary-500/20 flex-shrink-0">
              {agent.avatar || "🤖"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-dark-100 group-hover:text-primary-400 transition-colors truncate">
                {agent.name || `Agent #${agent.id}`}
              </h3>
              <a
                href={getExplorerUrl("address", agent.owner)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-xs text-dark-400 hover:text-accent-400 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                {shortenAddress(agent.owner)}
              </a>
            </div>
          </div>
          <span className={cn(
            "text-[10px] sm:text-xs px-2 py-1 rounded-full border whitespace-nowrap flex-shrink-0",
            agent.status === 1
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          )}>
            {AGENT_STATUS_MAP[agent.status]}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-dark-400 mb-3 sm:mb-4 line-clamp-2">
          {agent.description || "No description available"}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {(typeof agent.capabilities === 'string' ? agent.capabilities.split(',').map(s => s.trim()).filter(Boolean) : agent.capabilities).slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] sm:text-xs px-2 py-0.5 bg-primary-500/10 text-primary-300 rounded-md border border-primary-500/20 truncate max-w-[120px]"
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-dark-700/50">
          <div className="text-center min-w-0">
            <p className="text-[10px] sm:text-xs text-dark-400">Rating</p>
            <p className="text-xs sm:text-sm font-semibold text-yellow-400 truncate">⭐ {rating}</p>
          </div>
          <div className="text-center min-w-0">
            <p className="text-[10px] sm:text-xs text-dark-400">Success</p>
            <p className="text-xs sm:text-sm font-semibold text-accent-400 truncate">{successRate}%</p>
          </div>
          <div className="text-center min-w-0">
            <p className="text-[10px] sm:text-xs text-dark-400">Price</p>
            <p className="text-xs sm:text-sm font-semibold text-dark-200 truncate">{formatUSDC(agent.pricePerTask)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
