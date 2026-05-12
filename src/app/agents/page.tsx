"use client";

import { useAgents } from "@/hooks/useContract";
import { AgentCard } from "@/components/AgentCard";
import { useEffect, useState } from "react";

export default function AgentsPage() {
  const { agents, loading, fetchAgents } = useAgents();
  const [search, setSearch] = useState("");
  const [capability, setCapability] = useState("");

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const allCapabilities = Array.from(
    new Set(agents.flatMap((a) => a.capabilities))
  );

  const filtered = agents.filter((agent) => {
    const matchesSearch =
      !search ||
      (agent.name || "").toLowerCase().includes(search.toLowerCase()) ||
      agent.capabilities.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchesCap = !capability || agent.capabilities.includes(capability);
    return matchesSearch && matchesCap;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">Agent Registry</h1>
        <p className="text-dark-400">
          Browse registered AI agents, their capabilities, and reputation scores
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={capability}
          onChange={(e) => setCapability(e.target.value)}
          className="input-field sm:w-48"
          aria-label="Filter by capability"
        >
          <option value="">All Capabilities</option>
          {allCapabilities.map((cap) => (
            <option key={cap} value={cap}>
              {cap}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-dark-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-dark-700 rounded w-full mb-2" />
              <div className="h-3 bg-dark-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-dark-400">No agents found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
