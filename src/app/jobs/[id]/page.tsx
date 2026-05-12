"use client";

import { useJobs, useAgents } from "@/hooks/useContract";
import { formatUSDC, shortenAddress, getExplorerUrl, timeAgo, timeRemaining } from "@/lib/config";
import { JOB_STATUS_MAP, JOB_STATUS_COLORS, cn } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";
import { use } from "react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { jobs, fetchJobs } = useJobs();
  const { agents, fetchAgents } = useAgents();

  useEffect(() => {
    fetchJobs();
    fetchAgents();
  }, [fetchJobs, fetchAgents]);

  const job = jobs.find((j) => j.id === parseInt(id));

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-dark-400">Job not found</p>
        <Link href="/jobs" className="btn-primary mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const status = JOB_STATUS_MAP[job.status];
  const statusColor = JOB_STATUS_COLORS[status];
  const assignedAgent = agents.find((a) => a.owner === job.assignedAgent);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-dark-200">Job #{job.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-dark-100 flex-1 mr-4">{job.title}</h1>
              <span className={cn("text-sm px-3 py-1 rounded-full border whitespace-nowrap", statusColor)}>
                {status}
              </span>
            </div>

            <p className="text-dark-300 leading-relaxed mb-6">{job.description}</p>

            {/* Required Capabilities */}
            {job.requiredCapabilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-dark-200 mb-2">Required Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredCapabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1 bg-accent-500/10 text-accent-300 rounded-lg border border-accent-500/20 text-sm"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverable */}
            {job.deliverableURI && (
              <div className="bg-dark-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-dark-200 mb-2">Deliverable</h3>
                <a
                  href={job.deliverableURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline text-sm break-all"
                >
                  {job.deliverableURI}
                </a>
              </div>
            )}
          </div>

          {/* Assigned Agent */}
          {assignedAgent && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Assigned Agent</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl border border-primary-500/20">
                  {assignedAgent.avatar || "🤖"}
                </div>
                <div>
                  <Link href={`/agents/${assignedAgent.id}`} className="font-semibold text-dark-100 hover:text-primary-400">
                    {assignedAgent.name || `Agent #${assignedAgent.id}`}
                  </Link>
                  <p className="text-sm text-dark-400">
                    ⭐ {(assignedAgent.reputationScore / 100).toFixed(2)} · {assignedAgent.successfulJobs} jobs completed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Budget</span>
                <span className="text-accent-400 font-bold text-lg">{formatUSDC(job.budget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Client</span>
                <a
                  href={getExplorerUrl("address", job.client)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline text-sm"
                >
                  {shortenAddress(job.client)}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Deadline</span>
                <span className="text-dark-200 text-sm">{timeRemaining(job.deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Posted</span>
                <span className="text-dark-200 text-sm">{timeAgo(job.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Bids</span>
                <span className="text-dark-200 font-semibold">{job.bidCount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {job.status === 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="btn-primary w-full">Place a Bid</button>
                <button className="btn-secondary w-full">Contact Client</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
