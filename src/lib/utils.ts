import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AgentStatus = "Inactive" | "Active" | "Suspended";
export type JobStatus = "Open" | "Assigned" | "InProgress" | "Delivered" | "Completed" | "Disputed" | "Cancelled" | "Expired";

export const AGENT_STATUS_MAP: Record<number, AgentStatus> = {
  0: "Inactive",
  1: "Active",
  2: "Suspended",
};

export const JOB_STATUS_MAP: Record<number, JobStatus> = {
  0: "Open",
  1: "Assigned",
  2: "InProgress",
  3: "Delivered",
  4: "Completed",
  5: "Disputed",
  6: "Cancelled",
  7: "Expired",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  Open: "bg-green-500/20 text-green-400 border-green-500/30",
  Assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  InProgress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Delivered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export interface AgentData {
  id: number;
  owner: string;
  metadataURI: string;
  capabilities: string[];
  pricePerTask: bigint;
  pricePerInference: bigint;
  status: number;
  totalJobs: number;
  successfulJobs: number;
  totalEarnings: bigint;
  reputationScore: number;
  registeredAt: number;
  // Parsed metadata
  name?: string;
  description?: string;
  avatar?: string;
}

export interface JobData {
  id: number;
  client: string;
  assignedAgent: string;
  title: string;
  description: string;
  requiredCapabilities: string[];
  budget: bigint;
  deadline: number;
  status: number;
  deliverableURI: string;
  createdAt: number;
  completedAt: number;
  bidCount: number;
}

export interface BidData {
  jobId: number;
  agent: string;
  price: bigint;
  proposal: string;
  estimatedTime: number;
  createdAt: number;
}
