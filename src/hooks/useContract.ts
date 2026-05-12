import { useState, useCallback } from "react";
import { publicClient } from "@/lib/client";
import { AGENTFORGE_ABI } from "@/lib/abi";
import { CONTRACTS } from "@/lib/config";
import { MOCK_AGENTS, MOCK_JOBS } from "@/lib/mock-data";
import type { AgentData, JobData } from "@/lib/utils";

const CONTRACT_ADDRESS = CONTRACTS.agentForge as `0x${string}`;
const USE_MOCK = !CONTRACTS.agentForge || CONTRACTS.agentForge === "0x0000000000000000000000000000000000000000";

// Helper: timeout wrapper for RPC calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("RPC timeout")), ms)),
  ]);
}

export function useAgents() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (USE_MOCK) {
      setAgents(MOCK_AGENTS);
      return;
    }

    setLoading(true);
    try {
      const nextId = await withTimeout(
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "nextAgentId",
        }),
        10000
      );

      const numAgents = Number(nextId);
      if (numAgents <= 1) {
        setAgents([]);
        setLoading(false);
        return;
      }

      const agentPromises = [];
      for (let i = 1; i < numAgents; i++) {
        agentPromises.push(
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: AGENTFORGE_ABI,
            functionName: "getAgent",
            args: [BigInt(i)],
          })
        );
      }

      const results = await withTimeout(Promise.all(agentPromises), 15000);
      const parsed: AgentData[] = results.map((r: unknown) => {
        const agent = r as {
          id: bigint;
          owner: string;
          metadataURI: string;
          capabilities: string;
          pricePerTask: bigint;
          pricePerInference: bigint;
          status: number;
          totalJobs: bigint;
          successfulJobs: bigint;
          totalEarnings: bigint;
          reputationScore: bigint;
          registeredAt: bigint;
        };
        return {
          id: Number(agent.id),
          owner: agent.owner,
          metadataURI: agent.metadataURI,
          capabilities: agent.capabilities,
          pricePerTask: agent.pricePerTask,
          pricePerInference: agent.pricePerInference,
          status: agent.status,
          totalJobs: Number(agent.totalJobs),
          successfulJobs: Number(agent.successfulJobs),
          totalEarnings: agent.totalEarnings,
          reputationScore: Number(agent.reputationScore),
          registeredAt: Number(agent.registeredAt),
        };
      });

      setAgents(parsed.filter((a) => a.status === 1));
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      // Don't fallback to mock — show empty
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { agents, loading, fetchAgents };
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (USE_MOCK) {
      setJobs(MOCK_JOBS);
      return;
    }

    setLoading(true);
    try {
      const nextId = await withTimeout(
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "nextJobId",
        }),
        10000
      );

      const numJobs = Number(nextId);
      if (numJobs <= 1) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const jobPromises = [];
      for (let i = 1; i < numJobs; i++) {
        jobPromises.push(
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: AGENTFORGE_ABI,
            functionName: "jobs",
            args: [BigInt(i)],
          })
        );
      }

      const results = await withTimeout(Promise.all(jobPromises), 15000);
      const parsed: JobData[] = results.map((r: unknown) => {
        const job = r as {
          id: bigint;
          client: string;
          assignedAgent: string;
          title: string;
          description: string;
          requiredCapabilities: string;
          budget: bigint;
          deadline: bigint;
          status: number;
          deliverableURI: string;
          createdAt: bigint;
          completedAt: bigint;
          bidCount: bigint;
        };
        return {
          id: Number(job.id),
          client: job.client,
          assignedAgent: job.assignedAgent,
          title: job.title,
          description: job.description,
          requiredCapabilities: job.requiredCapabilities || "",
          budget: job.budget,
          deadline: Number(job.deadline),
          status: job.status,
          deliverableURI: job.deliverableURI,
          createdAt: Number(job.createdAt),
          completedAt: Number(job.completedAt),
          bidCount: Number(job.bidCount),
        };
      });

      setJobs(parsed);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { jobs, loading, fetchJobs };
}

export function useStats() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalJobs: 0,
    totalVolume: BigInt(0),
  });

  const fetchStats = useCallback(async () => {
    if (USE_MOCK) {
      setStats({ totalAgents: 5, totalJobs: 5, totalVolume: BigInt("1853000000000000000000") });
      return;
    }

    try {
      const result = await withTimeout(
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "getStats",
        }),
        10000
      );

      const [totalAgents, totalJobs, totalVolume] = result as [bigint, bigint, bigint];
      setStats({
        totalAgents: Number(totalAgents),
        totalJobs: Number(totalJobs),
        totalVolume,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  return { stats, fetchStats };
}
