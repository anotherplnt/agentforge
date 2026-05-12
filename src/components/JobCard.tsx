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
    <Link href={`/jobs/${job.id}`}>
      <div className="glass-card p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors line-clamp-1 flex-1 mr-3">
            {job.title}
          </h3>
          <span className={cn("text-xs px-2 py-1 rounded-full border whitespace-nowrap", statusColor)}>
            {status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-400 mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Capabilities */}
        {job.requiredCapabilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.requiredCapabilities.map((cap) => (
              <span
                key={cap}
                className="text-xs px-2 py-0.5 bg-accent-500/10 text-accent-300 rounded-md border border-accent-500/20"
              >
                {cap}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-dark-400">Budget</p>
              <p className="text-sm font-semibold text-accent-400">{formatUSDC(job.budget)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Bids</p>
              <p className="text-sm font-semibold text-dark-200">{job.bidCount}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-400">
              {job.status === 0 ? timeRemaining(job.deadline) : timeAgo(job.createdAt)}
            </p>
            <p className="text-xs text-dark-500">
              by {shortenAddress(job.client)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
