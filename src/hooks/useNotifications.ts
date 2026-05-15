"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPublicClient, http } from "viem";
import { CONTRACT_ADDRESS, ARC_TESTNET } from "@/lib/config";
import { AGENTFORGE_ABI } from "@/lib/abi";

export interface Notification {
  id: string;
  type: "bid" | "assigned" | "started" | "delivered" | "completed";
  jobId: number;
  jobTitle?: string;
  message: string;
  fromAddress: string;
  timestamp: number;
  read: boolean;
  txHash?: string;
}

const STORAGE_KEY = "agentforge_notifications";
const LAST_BLOCK_KEY = "agentforge_last_block";
const POLL_INTERVAL = 15000; // 15 seconds

// Helper to format short address
const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export function useNotifications(userAddress: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isPolling = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!userAddress) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const key = `${STORAGE_KEY}_${userAddress.toLowerCase()}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: Notification[] = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch {}
  }, [userAddress]);

  // Save to localStorage
  const saveNotifications = useCallback(
    (notifs: Notification[]) => {
      if (!userAddress) return;
      const key = `${STORAGE_KEY}_${userAddress.toLowerCase()}`;
      try {
        // Keep only latest 50
        const trimmed = notifs.slice(0, 50);
        localStorage.setItem(key, JSON.stringify(trimmed));
        setNotifications(trimmed);
        setUnreadCount(trimmed.filter((n) => !n.read).length);
      } catch {}
    },
    [userAddress]
  );

  // Fetch jobs map for title lookup (cached)
  const jobTitleCache = useRef<Record<number, string>>({});

  const getJobTitle = useCallback(
    async (client: any, jobId: number): Promise<string> => {
      if (jobTitleCache.current[jobId]) return jobTitleCache.current[jobId];
      try {
        const job = (await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "jobs",
          args: [BigInt(jobId)],
        })) as any;
        const title = Array.isArray(job) ? job[3] : job?.title || `Job #${jobId}`;
        jobTitleCache.current[jobId] = title;
        return title;
      } catch {
        return `Job #${jobId}`;
      }
    },
    []
  );

  // Poll for new events
  useEffect(() => {
    if (!userAddress) return;
    if (isPolling.current) return;
    isPolling.current = true;

    let cancelled = false;
    const userLower = userAddress.toLowerCase();

    const client = createPublicClient({
      chain: ARC_TESTNET,
      transport: http(ARC_TESTNET.rpcUrls.default.http[0], { timeout: 10000 }),
    });

    const lastBlockKey = `${LAST_BLOCK_KEY}_${userLower}`;

    async function poll() {
      if (cancelled) return;
      try {
        const currentBlock = await client.getBlockNumber();
        let fromBlock: bigint;
        try {
          const stored = localStorage.getItem(lastBlockKey);
          fromBlock = stored ? BigInt(stored) : currentBlock - 100n;
        } catch {
          fromBlock = currentBlock - 100n;
        }

        if (fromBlock >= currentBlock) {
          return;
        }

        // Fetch logs for relevant events
        const eventNames = [
          "JobBidPlaced",
          "JobAssigned",
          "JobDelivered",
          "JobCompleted",
        ] as const;

        const allLogs: any[] = [];
        for (const eventName of eventNames) {
          try {
            const logs = await client.getContractEvents({
              address: CONTRACT_ADDRESS,
              abi: AGENTFORGE_ABI,
              eventName,
              fromBlock,
              toBlock: currentBlock,
            });
            allLogs.push(...logs);
          } catch {}
        }

        if (allLogs.length === 0) {
          localStorage.setItem(lastBlockKey, currentBlock.toString());
          return;
        }

        // Get current notifications
        const stored = localStorage.getItem(`${STORAGE_KEY}_${userLower}`);
        const existing: Notification[] = stored ? JSON.parse(stored) : [];
        const existingIds = new Set(existing.map((n) => n.id));

        const newNotifs: Notification[] = [];

        for (const log of allLogs) {
          const id = `${log.transactionHash}_${log.logIndex}`;
          if (existingIds.has(id)) continue;

          const eventName = log.eventName as string;
          const args = log.args as any;
          const jobId = Number(args.jobId);
          const txHash = log.transactionHash;
          const block = await client.getBlock({ blockNumber: log.blockNumber });
          const timestamp = Number(block.timestamp) * 1000;

          // Get job to determine if user is involved
          let jobData: any = null;
          try {
            jobData = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: AGENTFORGE_ABI,
              functionName: "jobs",
              args: [BigInt(jobId)],
            });
          } catch {}

          const jobClient = (Array.isArray(jobData) ? jobData[1] : jobData?.client || "").toLowerCase();
          const jobAgent = (Array.isArray(jobData) ? jobData[2] : jobData?.assignedAgent || "").toLowerCase();
          const title = Array.isArray(jobData) ? jobData[3] : jobData?.title || `Job #${jobId}`;
          jobTitleCache.current[jobId] = title;

          let notif: Notification | null = null;

          // JobBidPlaced(jobId, agent, price): notify client
          if (eventName === "JobBidPlaced") {
            const agent = (args.agent as string).toLowerCase();
            if (jobClient === userLower && agent !== userLower) {
              notif = {
                id,
                type: "bid",
                jobId,
                jobTitle: title,
                message: `New bid on "${title}" from ${short(args.agent)}`,
                fromAddress: args.agent,
                timestamp,
                read: false,
                txHash,
              };
            }
          }

          // JobAssigned(jobId, agent): notify the agent
          if (eventName === "JobAssigned") {
            const agent = (args.agent as string).toLowerCase();
            if (agent === userLower) {
              notif = {
                id,
                type: "assigned",
                jobId,
                jobTitle: title,
                message: `You were assigned to "${title}"`,
                fromAddress: jobClient,
                timestamp,
                read: false,
                txHash,
              };
            }
          }

          // JobDelivered(jobId): notify the client
          if (eventName === "JobDelivered") {
            if (jobClient === userLower) {
              notif = {
                id,
                type: "delivered",
                jobId,
                jobTitle: title,
                message: `"${title}" was delivered. Review and approve.`,
                fromAddress: jobAgent,
                timestamp,
                read: false,
                txHash,
              };
            }
          }

          // JobCompleted(jobId, payout, fee): notify the agent
          if (eventName === "JobCompleted") {
            if (jobAgent === userLower) {
              notif = {
                id,
                type: "completed",
                jobId,
                jobTitle: title,
                message: `Payment received for "${title}"`,
                fromAddress: jobClient,
                timestamp,
                read: false,
                txHash,
              };
            }
          }

          if (notif) {
            newNotifs.push(notif);
          }
        }

        if (newNotifs.length > 0) {
          const merged = [...newNotifs, ...existing].slice(0, 50);
          saveNotifications(merged);

          // Browser notification (optional)
          if (typeof window !== "undefined" && "Notification" in window) {
            if (window.Notification.permission === "granted") {
              for (const n of newNotifs) {
                try {
                  new window.Notification("AgentForge", { body: n.message });
                } catch {}
              }
            }
          }
        }

        localStorage.setItem(lastBlockKey, currentBlock.toString());
      } catch (e) {
        // Silent fail, retry next interval
      }
    }

    // Initial poll
    poll();

    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      isPolling.current = false;
      clearInterval(interval);
    };
  }, [userAddress, saveNotifications]);

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const requestBrowserPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      window.Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestBrowserPermission,
  };
}
