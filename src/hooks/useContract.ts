import { useState, useCallback, useEffect } from "react";
import { AGENTFORGE_ABI } from "@/lib/abi";
import { CONTRACTS } from "@/lib/config";
import type { AgentData, JobData } from "@/lib/utils";

const CONTRACT_ADDRESS = CONTRACTS.agentForge as `0x${string}`;

// Lazy-load publicClient only in browser to prevent SSR issues
function getPublicClient() {
  if (typeof window === "undefined") return null;
  // Dynamic import at runtime
  const { createPublicClient, http } = require("viem");
  return createPublicClient({
    chain: {
      id: 5042002,
      name: "Arc Testnet",
      nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
      rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
    },
    transport: http("https://rpc.testnet.arc.network", { timeout: 8000, retryCount: 1 }),
  });
}

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
    if (typeof window === "undefined") return;
    const client = getPublicClient();
    if (!client) return;

    setLoading(true);
    try {
      const nextId = await withTimeout(
        client.readContract({
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
          client.readContract({
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
          pricePerTask: agent.pricePerTask.toString(),
          pricePerInference: agent.pricePerInference.toString(),
          status: agent.status,
          totalJobs: Number(agent.totalJobs),
          successfulJobs: Number(agent.successfulJobs),
          totalEarnings: agent.totalEarnings.toString(),
          reputationScore: Number(agent.reputationScore),
          registeredAt: Number(agent.registeredAt),
        };
      });

      setAgents(parsed.filter((a) => a.status === 1));
    } catch (error) {
      console.error("Failed to fetch agents:", error);
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
    if (typeof window === "undefined") return;
    const client = getPublicClient();
    if (!client) return;

    setLoading(true);
    try {
      const nextId = await withTimeout(
        client.readContract({
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
          client.readContract({
            address: CONTRACT_ADDRESS,
            abi: AGENTFORGE_ABI,
            functionName: "jobs",
            args: [BigInt(i)],
          })
        );
      }

      const results = await withTimeout(Promise.all(jobPromises), 15000);
      const parsed: JobData[] = results.map((r: unknown) => {
        const job = r as any;
        // Public mapping returns tuple array, not named struct
        if (Array.isArray(job)) {
          return {
            id: Number(BigInt(job[0])),
            client: String(job[1]),
            assignedAgent: String(job[2]),
            title: String(job[3] || ""),
            description: String(job[4] || ""),
            requiredCapabilities: String(job[5] || ""),
            budget: BigInt(job[6]).toString(),
            deadline: Number(BigInt(job[7])),
            status: Number(BigInt(job[8])),
            deliverableURI: String(job[9] || ""),
            createdAt: Number(BigInt(job[10])),
            completedAt: Number(BigInt(job[11])),
            bidCount: Number(BigInt(job[12])),
          };
        }
        return {
          id: Number(job.id),
          client: String(job.client),
          assignedAgent: String(job.assignedAgent),
          title: String(job.title || ""),
          description: String(job.description || ""),
          requiredCapabilities: String(job.requiredCapabilities || ""),
          budget: BigInt(job.budget).toString(),
          deadline: Number(BigInt(job.deadline)),
          status: Number(job.status),
          deliverableURI: String(job.deliverableURI || ""),
          createdAt: Number(BigInt(job.createdAt)),
          completedAt: Number(BigInt(job.completedAt)),
          bidCount: Number(BigInt(job.bidCount)),
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
    totalVolume: "0",
  });

  const fetchStats = useCallback(async () => {
    if (typeof window === "undefined") return;
    const client = getPublicClient();
    if (!client) return;

    try {
      const result = await withTimeout(
        client.readContract({
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
        totalVolume: totalVolume.toString(),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  return { stats, fetchStats };
}
