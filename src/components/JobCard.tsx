"use client";

import Link from "next/link";
import { cn, type JobData, JOB_STATUS_MAP, JOB_STATUS_COLORS } from "@/lib/utils";
import { formatUSDC, shortenAddress, timeAgo, timeRemaining } from "@/lib/config";

interface JobCardProps {
  job: JobData;
}

export function JobCard({ job }: JobCardProps) {
  const status = JOB_STATUS_MAP[job.status];
  const statusColor = JOB_STATUS_COLORS[status];

  return (
    <Link href={`/jobs/${job.id}`} className="block w-full">
      <div className="glass-card p-4 sm:p-5 md:p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group cursor-pointer min-h-[44px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <h3 className="font-semibold text-sm sm:text-base text-dark-100 group-hover:text-primary-400 transition-colors line-clamp-2 flex-1">
            {job.title}
          </h3>
          <span className={cn("text-[10px] sm:text-xs px-2 py-1 rounded-full border whitespace-nowrap flex-shrink-0", statusColor)}>
            {status}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-dark-400 mb-3 sm:mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Capabilities */}
        {job.requiredCapabilities && job.requiredCapabilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
            {(typeof job.requiredCapabilities === 'string' ? job.requiredCapabilities.split(',').map(s => s.trim()).filter(Boolean) : job.requiredCapabilities).slice(0, 3).map((cap) => (
              <span
                key={cap}
                className="text-[10px] sm:text-xs px-2 py-0.5 bg-accent-500/10 text-accent-300 rounded-md border border-accent-500/20 truncate max-w-[120px]"
              >
                {cap}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 sm:pt-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-dark-400">Budget</p>
              <p className="text-xs sm:text-sm font-semibold text-accent-400 truncate">{formatUSDC(job.budget)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-dark-400">Bids</p>
              <p className="text-xs sm:text-sm font-semibold text-dark-200">{job.bidCount}</p>
            </div>
          </div>
          <div className="text-right min-w-0 flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-dark-400 truncate">
              {job.status === 0 ? timeRemaining(job.deadline) : timeAgo(job.createdAt)}
            </p>
            <p className="text-[10px] sm:text-xs text-dark-500 truncate">
              by {shortenAddress(job.client)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
