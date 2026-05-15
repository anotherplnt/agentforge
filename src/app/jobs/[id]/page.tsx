"use client";

import { useJobs, useAgents } from "@/hooks/useContract";
import { formatUSDC, shortenAddress, getExplorerUrl, timeAgo, timeRemaining, parseUSDC, CONTRACTS } from "@/lib/config";
import { JOB_STATUS_MAP, JOB_STATUS_COLORS, cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWalletStore } from "@/hooks/useWallet";
import { sendContractTx, publicClient, switchToArcTestnet } from "@/lib/client";
import { AGENTFORGE_ABI } from "@/lib/abi";

const CONTRACT_ADDRESS = CONTRACTS.agentForge as `0x${string}`;

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { jobs, fetchJobs } = useJobs();
  const { agents, fetchAgents } = useAgents();
  const { address, isConnected, connect } = useWalletStore();
  const [bidding, setBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidTxHash, setBidTxHash] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchAgents();
  }, [fetchJobs, fetchAgents]);

  const job = jobs.find((j) => j.id === parseInt(id));

  if (!job) {
    return (
      <div className="min-h-screen bg-[#050816] pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-dark-400">Job not found</p>
        <Link href="/jobs" className="btn-primary mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
      </div>
    );
  }

  const status = JOB_STATUS_MAP[job.status];
  const statusColor = JOB_STATUS_COLORS[status];
  const assignedAgent = agents.find((a) => a.owner === job.assignedAgent);

  return (
    <div className="min-h-screen bg-[#050816] pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-dark-400 mb-6 sm:mb-8">
        <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-dark-200">Job #{job.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Job Header */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-dark-100 flex-1">{job.title}</h1>
              <span className={cn("text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap flex-shrink-0", statusColor)}>
                {status}
              </span>
            </div>

            <p className="text-sm sm:text-base text-dark-300 leading-relaxed mb-4 sm:mb-6">{job.description}</p>

            {/* Required Capabilities */}
            {job.requiredCapabilities && job.requiredCapabilities.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-dark-200 mb-2">Required Capabilities</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(typeof job.requiredCapabilities === 'string' ? job.requiredCapabilities.split(',').map(s => s.trim()).filter(Boolean) : job.requiredCapabilities).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 sm:px-3 py-1 bg-accent-500/10 text-accent-300 rounded-lg border border-accent-500/20 text-xs sm:text-sm"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverable */}
            {job.deliverableURI && (
              <div className="bg-dark-800/50 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-dark-200 mb-2">Deliverable</h3>
                <a
                  href={job.deliverableURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline text-xs sm:text-sm break-all"
                >
                  {job.deliverableURI}
                </a>
              </div>
            )}
          </div>

          {/* Assigned Agent */}
          {assignedAgent && (
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Assigned Agent</h3>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl border border-primary-500/20 flex-shrink-0">
                  {assignedAgent.avatar || "🤖"}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/agents/${assignedAgent.id}`} className="font-semibold text-sm sm:text-base text-dark-100 hover:text-primary-400 truncate block">
                    {assignedAgent.name || `Agent #${assignedAgent.id}`}
                  </Link>
                  <p className="text-xs sm:text-sm text-dark-400">
                    ⭐ {(assignedAgent.reputationScore / 100).toFixed(2)} · {assignedAgent.successfulJobs} jobs completed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Job Details */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Budget</span>
                <span className="text-accent-400 font-bold text-base sm:text-lg">{formatUSDC(job.budget)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-dark-400">Client</span>
                <a
                  href={getExplorerUrl("address", job.client)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline text-xs sm:text-sm"
                >
                  {shortenAddress(job.client)}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Deadline</span>
                <span className="text-dark-200 text-xs sm:text-sm">{timeRemaining(job.deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Posted</span>
                <span className="text-dark-200 text-xs sm:text-sm">{timeAgo(job.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Bids</span>
                <span className="text-dark-200 font-semibold text-sm">{job.bidCount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-100 mb-3 sm:mb-4">Actions</h3>

            {bidSuccess && (
              <div className="mb-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg text-accent-400 text-sm">
                ✅ Transaction successful!
                {bidTxHash && (
                  <a href={getExplorerUrl("tx", bidTxHash)} target="_blank" rel="noopener noreferrer" className="block mt-1 text-primary-400 underline text-xs">
                    View on ArcScan →
                  </a>
                )}
              </div>
            )}

            {bidError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                ❌ {bidError}
              </div>
            )}

            <div className="space-y-2 sm:space-y-3">
              {!isConnected ? (
                <button onClick={connect} className="btn-primary w-full min-h-[48px]">Connect Wallet</button>
              ) : (
                <>
                  {/* Status 0: Open — Agent can bid, Client can assign */}
                  {job.status === 0 && (
                    <>
                      {address?.toLowerCase() !== job.client?.toLowerCase() && (
                        <button
                          onClick={async () => {
                            setBidding(true); setBidError(null); setBidSuccess(false);
                            try {
                              await switchToArcTestnet();
                              const hash = await sendContractTx({
                                address: CONTRACT_ADDRESS, abi: AGENTFORGE_ABI,
                                functionName: "bidOnJob",
                                args: [BigInt(job.id), BigInt(job.budget), "I can complete this task efficiently.", BigInt(86400)],
                                from: address!,
                              });
                              setBidTxHash(hash); setBidSuccess(true);
                              setTimeout(() => { fetchJobs(); }, 3000);
                            } catch (err: any) {
                              const msg = err?.shortMessage || err?.message || "Failed";
                              if (msg.includes("Not a registered agent") || msg.includes("revert")) {
                                setBidError("You must register as an agent first. Go to Dashboard → Register Agent.");
                              } else {
                                setBidError(msg);
                              }
                            }
                            finally { setBidding(false); }
                          }}
                          disabled={bidding} className="btn-primary w-full min-h-[48px]"
                        >
                          {bidding ? "⏳ Confirm..." : "🤖 Place a Bid"}
                        </button>
                      )}
                      {address?.toLowerCase() === job.client?.toLowerCase() && job.bidCount > 0 && (
                        <button
                          onClick={async () => {
                            setBidding(true); setBidError(null); setBidSuccess(false);
                            try {
                              await switchToArcTestnet();
                              // Get first bidder address from contract
                              const { createPublicClient, http } = await import("viem");
                              const client = createPublicClient({
                                chain: { id: 5042002, name: "Arc", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } } },
                                transport: http("https://rpc.testnet.arc.network", { timeout: 10000 }),
                              });
                              const bids = await client.readContract({
                                address: CONTRACT_ADDRESS,
                                abi: AGENTFORGE_ABI,
                                functionName: "getJobBids",
                                args: [BigInt(job.id)],
                              }) as any[];
                              if (!bids || bids.length === 0) {
                                setBidError("No bids found. Please wait for an agent to bid first.");
                                setBidding(false);
                                return;
                              }
                              const agentAddress = bids[0].agent;
                              if (!agentAddress || agentAddress === "0x0000000000000000000000000000000000000000") {
                                setBidError("Invalid bidder address");
                                setBidding(false);
                                return;
                              }
                              const hash = await sendContractTx({
                                address: CONTRACT_ADDRESS, abi: AGENTFORGE_ABI,
                                functionName: "assignJob",
                                args: [BigInt(job.id), agentAddress],
                                from: address!,
                              });
                              setBidTxHash(hash); setBidSuccess(true);
                              setTimeout(() => fetchJobs(), 3000);
                            } catch (err: any) { setBidError(err?.shortMessage || err?.message || "Failed"); }
                            finally { setBidding(false); }
                          }}
                          disabled={bidding} className="btn-primary w-full min-h-[48px]"
                        >
                          {bidding ? "⏳ Confirm..." : "✅ Assign Agent"}
                        </button>
                      )}
                    </>
                  )}

                  {/* Status 1: Assigned — Agent can start work */}
                  {job.status === 1 && address?.toLowerCase() === job.assignedAgent?.toLowerCase() && (
                    <button
                      onClick={async () => {
                        setBidding(true); setBidError(null); setBidSuccess(false);
                        try {
                          await switchToArcTestnet();
                          const hash = await sendContractTx({
                            address: CONTRACT_ADDRESS, abi: AGENTFORGE_ABI,
                            functionName: "startJob",
                            args: [BigInt(job.id)],
                            from: address!,
                          });
                          setBidTxHash(hash); setBidSuccess(true);
                          setTimeout(() => fetchJobs(), 3000);
                        } catch (err: any) { setBidError(err?.shortMessage || err?.message || "Failed"); }
                        finally { setBidding(false); }
                      }}
                      disabled={bidding} className="btn-primary w-full min-h-[48px] mb-2"
                    >
                      {bidding ? "⏳ Confirm..." : "▶️ Start Work"}
                    </button>
                  )}

                  {/* Status 1/2: Assigned/InProgress — Agent can submit deliverable */}
                  {(job.status === 1 || job.status === 2) && address?.toLowerCase() === job.assignedAgent?.toLowerCase() && (
                    <button
                      onClick={async () => {
                        setBidding(true); setBidError(null); setBidSuccess(false);
                        try {
                          await switchToArcTestnet();
                          const hash = await sendContractTx({
                            address: CONTRACT_ADDRESS, abi: AGENTFORGE_ABI,
                            functionName: "submitDeliverable",
                            args: [BigInt(job.id), "https://github.com/anotherplnt/agentforge/deliverable"],
                            from: address!,
                          });
                          setBidTxHash(hash); setBidSuccess(true);
                          setTimeout(() => fetchJobs(), 3000);
                        } catch (err: any) { setBidError(err?.shortMessage || err?.message || "Failed"); }
                        finally { setBidding(false); }
                      }}
                      disabled={bidding} className="btn-primary w-full min-h-[48px]"
                    >
                      {bidding ? "⏳ Confirm..." : "📦 Submit Deliverable"}
                    </button>
                  )}

                  {/* Status 3: Delivered — Client can approve */}
                  {job.status === 3 && address?.toLowerCase() === job.client?.toLowerCase() && (
                    <button
                      onClick={async () => {
                        setBidding(true); setBidError(null); setBidSuccess(false);
                        try {
                          await switchToArcTestnet();
                          const hash = await sendContractTx({
                            address: CONTRACT_ADDRESS, abi: AGENTFORGE_ABI,
                            functionName: "approveJob",
                            args: [BigInt(job.id)],
                            from: address!,
                          });
                          setBidTxHash(hash); setBidSuccess(true);
                          setTimeout(() => fetchJobs(), 3000);
                        } catch (err: any) { setBidError(err?.shortMessage || err?.message || "Failed"); }
                        finally { setBidding(false); }
                      }}
                      disabled={bidding} className="btn-primary w-full min-h-[48px]"
                    >
                      {bidding ? "⏳ Confirm..." : "💰 Approve & Release USDC"}
                    </button>
                  )}

                  {/* Status 4: Completed */}
                  {job.status === 4 && (
                    <div className="p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg text-accent-400 text-sm text-center">
                      ✅ Job completed! USDC has been released to the agent.
                    </div>
                  )}
                </>
              )}

              <a
                href={getExplorerUrl("address", job.client)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center block min-h-[48px] flex items-center justify-center"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
