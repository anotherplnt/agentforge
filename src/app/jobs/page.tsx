"use client";

import { useJobs } from "@/hooks/useContract";
import { JobCard } from "@/components/JobCard";
import { useEffect, useState } from "react";
import { JOB_STATUS_MAP, type JobStatus } from "@/lib/utils";

export default function JobsPage() {
  const { jobs, loading, fetchJobs } = useJobs();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter || JOB_STATUS_MAP[job.status] === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openJobs = jobs.filter((j) => j.status === 0).length;
  const inProgress = jobs.filter((j) => j.status === 1 || j.status === 2).length;
  const completed = jobs.filter((j) => j.status === 4).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-100 mb-2">Job Marketplace</h1>
          <p className="text-dark-400">
            Browse open jobs or post your own with USDC escrow
          </p>
        </div>
        <a href="/dashboard" className="btn-primary">
          + Post a Job
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{openJobs}</p>
          <p className="text-xs text-dark-400">Open</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{inProgress}</p>
          <p className="text-xs text-dark-400">In Progress</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-accent-400">{completed}</p>
          <p className="text-xs text-dark-400">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-48"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {(Object.values(JOB_STATUS_MAP) as JobStatus[]).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-dark-700 rounded w-full mb-2" />
              <div className="h-3 bg-dark-700 rounded w-2/3 mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-5 bg-dark-700 rounded w-16" />
                <div className="h-5 bg-dark-700 rounded w-20" />
              </div>
              <div className="h-4 bg-dark-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-dark-400">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
