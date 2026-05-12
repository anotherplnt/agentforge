"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWalletStore } from "@/hooks/useWallet";
import { useAgents, useJobs, useStats } from "@/hooks/useContract";
import { formatUSDC, shortenAddress } from "@/lib/config";
import { CONTRACTS, getExplorerUrl, parseUSDC } from "@/lib/config";
import { JOB_STATUS_MAP, JOB_STATUS_COLORS, cn } from "@/lib/utils";
import { sendContractTx, publicClient, switchToArcTestnet } from "@/lib/client";
import { AGENTFORGE_ABI } from "@/lib/abi";

const CONTRACT_ADDRESS = CONTRACTS.agentForge as `0x${string}`;

type Tab = "overview" | "create-job" | "register-agent" | "inference";

export default function DashboardPage() {
  const { address, isConnected, connect } = useWalletStore();
  const { agents, fetchAgents } = useAgents();
  const { jobs, fetchJobs } = useJobs();
  const { stats, fetchStats } = useStats();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "create-job", "register-agent", "inference"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAgents();
    fetchJobs();
    fetchStats();
  }, [fetchAgents, fetchJobs, fetchStats]);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="glass-card p-12 max-w-md mx-auto">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold text-dark-100 mb-4">Connect Your Wallet</h2>
          <p className="text-dark-400 mb-6">
            Connect your wallet to access the dashboard, post jobs, and manage agents.
          </p>
          <button onClick={connect} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const myJobs = jobs.filter((j) => j.client?.toLowerCase() === address?.toLowerCase());
  const myAgent = agents.find((a) => a.owner?.toLowerCase() === address?.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">Dashboard</h1>
        <p className="text-dark-400">
          Manage your agents, jobs, and inference pools
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-dark-700 pb-4">
        {[
          { id: "overview" as Tab, label: "Overview", icon: "📊" },
          { id: "create-job" as Tab, label: "Create Job", icon: "📋" },
          { id: "register-agent" as Tab, label: "Register Agent", icon: "🤖" },
          { id: "inference" as Tab, label: "Pay-per-Inference", icon: "⚡" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab myJobs={myJobs} myAgent={myAgent} address={address!} />
      )}
      {activeTab === "create-job" && <CreateJobTab address={address!} onSuccess={() => { fetchJobs(); fetchStats(); }} />}
      {activeTab === "register-agent" && <RegisterAgentTab myAgent={myAgent} address={address!} onSuccess={fetchAgents} />}
      {activeTab === "inference" && <InferenceTab agents={agents} address={address!} />}
    </div>
  );
}

function OverviewTab({ myJobs, myAgent, address }: { myJobs: any[]; myAgent: any; address: string }) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-2xl font-bold text-primary-400">{myJobs.length}</p>
          <p className="text-xs text-dark-400 mt-1">My Jobs</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-accent-400">
            {myAgent ? "Active" : "None"}
          </p>
          <p className="text-xs text-dark-400 mt-1">My Agent</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-yellow-400">
            {myAgent ? formatUSDC(myAgent.totalEarnings) : "$0.00"}
          </p>
          <p className="text-xs text-dark-400 mt-1">Earnings</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-dark-200">
            {shortenAddress(address)}
          </p>
          <p className="text-xs text-dark-400 mt-1">Wallet</p>
        </div>
      </div>

      {/* My Jobs */}
      <div>
        <h3 className="text-lg font-semibold text-dark-100 mb-4">My Jobs</h3>
        {myJobs.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-dark-400">No jobs yet. Create your first job to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myJobs.map((job) => {
              const status = JOB_STATUS_MAP[job.status];
              const statusColor = JOB_STATUS_COLORS[status];
              return (
                <div key={job.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-100">{job.title}</p>
                    <p className="text-sm text-dark-400">{formatUSDC(job.budget)} · {job.bidCount} bids</p>
                  </div>
                  <span className={cn("text-xs px-2 py-1 rounded-full border", statusColor)}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Agent */}
      {myAgent && (
        <div>
          <h3 className="text-lg font-semibold text-dark-100 mb-4">My Agent</h3>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl border border-primary-500/20">
                🤖
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-100">Agent #{myAgent.id}</p>
                <p className="text-sm text-dark-400">
                  ⭐ {(myAgent.reputationScore / 100).toFixed(2)} · {myAgent.totalJobs} jobs · {formatUSDC(myAgent.totalEarnings)} earned
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateJobTab({ address, onSuccess }: { address: string; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      await switchToArcTestnet();

      const deadlineTimestamp = BigInt(Math.floor(new Date(deadline).getTime() / 1000));
      const budgetWei = parseUSDC(budget);

      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "createJob",
        args: [title, description, capabilities, deadlineTimestamp],
        value: budgetWei,
        from: address,
      });

      setTxHash(hash);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setCapabilities("");

      // Wait for confirmation in background
      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
      onSuccess();
    } catch (err: any) {
      console.error("Create job failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="glass-card p-8">
        <h3 className="text-xl font-semibold text-dark-100 mb-6">Create a New Job</h3>

        {success && (
          <div className="mb-6 p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg text-accent-400 text-sm">
            ✅ Job created successfully! USDC has been escrowed.
            {txHash && (
              <a
                href={getExplorerUrl("tx", txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-primary-400 underline text-xs"
              >
                View transaction on ArcScan →
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-dark-200 mb-2">
              Job Title
            </label>
            <input
              id="job-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Write technical documentation"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-dark-200 mb-2">
              Description
            </label>
            <textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              className="input-field min-h-[120px] resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-budget" className="block text-sm font-medium text-dark-200 mb-2">
                Budget (USDC)
              </label>
              <input
                id="job-budget"
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="10.00"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="job-deadline" className="block text-sm font-medium text-dark-200 mb-2">
                Deadline
              </label>
              <input
                id="job-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="job-capabilities" className="block text-sm font-medium text-dark-200 mb-2">
              Required Capabilities (comma-separated)
            </label>
            <input
              id="job-capabilities"
              type="text"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="text-generation, summarization"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "⏳ Confirm in Wallet..." : "Create Job & Escrow USDC"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RegisterAgentTab({ myAgent, address, onSuccess }: { myAgent: any; address: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [pricePerTask, setPricePerTask] = useState("");
  const [pricePerInference, setPricePerInference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (myAgent) {
    return (
      <div className="max-w-2xl">
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-4">🤖</p>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">
            Agent #{myAgent.id}
          </h3>
          <p className="text-dark-400 mb-4">Your agent is already registered and active.</p>
          <div className="text-sm text-dark-300">
            <p>⭐ Rating: {(myAgent.reputationScore / 100).toFixed(2)}</p>
            <p>💼 Jobs: {myAgent.totalJobs}</p>
            <p>💰 Earnings: {formatUSDC(myAgent.totalEarnings)}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      await switchToArcTestnet();

      // metadataURI = JSON with name + description
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify({ name, description }))}`;
      const priceTaskWei = parseUSDC(pricePerTask);
      const priceInferenceWei = parseUSDC(pricePerInference);

      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "registerAgent",
        args: [metadataURI, capabilities, priceTaskWei, priceInferenceWei],
        from: address,
      });

      setTxHash(hash);
      setSuccess(true);
      setName("");
      setDescription("");
      setCapabilities("");
      setPricePerTask("");
      setPricePerInference("");

      // Wait for confirmation in background
      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
      onSuccess();
    } catch (err: any) {
      console.error("Register agent failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="glass-card p-8">
        <h3 className="text-xl font-semibold text-dark-100 mb-6">Register Your AI Agent</h3>

        {success && (
          <div className="mb-6 p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg text-accent-400 text-sm">
            ✅ Agent registered successfully on-chain!
            {txHash && (
              <a
                href={getExplorerUrl("tx", txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-primary-400 underline text-xs"
              >
                View transaction on ArcScan →
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-dark-200 mb-2">
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GPT-Forge Alpha"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="agent-description" className="block text-sm font-medium text-dark-200 mb-2">
              Description
            </label>
            <textarea
              id="agent-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your agent's capabilities..."
              className="input-field min-h-[100px] resize-y"
              required
            />
          </div>

          <div>
            <label htmlFor="agent-capabilities" className="block text-sm font-medium text-dark-200 mb-2">
              Capabilities (comma-separated)
            </label>
            <input
              id="agent-capabilities"
              type="text"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="text-generation, code-review, data-analysis"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="agent-price-task" className="block text-sm font-medium text-dark-200 mb-2">
                Price per Task (USDC)
              </label>
              <input
                id="agent-price-task"
                type="number"
                step="0.01"
                value={pricePerTask}
                onChange={(e) => setPricePerTask(e.target.value)}
                placeholder="5.00"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="agent-price-inference" className="block text-sm font-medium text-dark-200 mb-2">
                Price per Inference (USDC)
              </label>
              <input
                id="agent-price-inference"
                type="number"
                step="0.001"
                value={pricePerInference}
                onChange={(e) => setPricePerInference(e.target.value)}
                placeholder="0.01"
                className="input-field"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "⏳ Confirm in Wallet..." : "Register Agent On-Chain"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InferenceTab({ agents, address }: { agents: any[]; address: string }) {
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string; cost?: string }[]>([
    { role: "agent", content: "Hello! I'm an AI Agent on AgentForge. Each message costs $0.01 USDC via nanopayments. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [poolBalance, setPoolBalance] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);

  const selectedAgent = agents[0];

  // Fetch inference pool balance
  useEffect(() => {
    async function fetchPool() {
      try {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: AGENTFORGE_ABI,
          functionName: "getInferencePool",
          args: [address as `0x${string}`],
        });
        const pool = result as { balance: bigint };
        setPoolBalance(formatUSDC(pool.balance));
      } catch {
        setPoolBalance("$0.00");
      }
    }
    fetchPool();
  }, [address, depositing]);

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setDepositing(true);
    setDepositTxHash(null);

    try {
      await switchToArcTestnet();

      const amountWei = parseUSDC(depositAmount);
      const hash = await sendContractTx({
        address: CONTRACT_ADDRESS,
        abi: AGENTFORGE_ABI,
        functionName: "depositInferencePool",
        args: [],
        value: amountWei,
        from: address,
      });

      setDepositTxHash(hash);
      setDepositAmount("");

      try {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}`, timeout: 30000 });
      } catch {}
    } catch (err: any) {
      console.error("Deposit failed:", err);
    } finally {
      setDepositing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          agentId: selectedAgent?.id || 1,
          depositorAddress: address || "0x0000000000000000000000000000000000000000",
          history: newMessages.filter(m => m.content).slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const cost = data.inference?.cost || 0.01;
      setTotalCost((prev) => prev + cost);

      setMessages((prev) => [
        ...prev,
        { role: "agent", content: data.response || "Processing complete.", cost: `$${cost.toFixed(4)}` },
      ]);
    } catch (err) {
      console.error("Inference error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "I'm processing your request. Please try again in a moment.", cost: "$0.00" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Deposit Pool */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-dark-400">Inference Pool Balance</p>
            <p className="text-lg font-bold text-accent-400">{poolBalance}</p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              step="0.1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="1.00"
              className="input-field w-24 text-sm"
              aria-label="Deposit amount"
            />
            <button
              onClick={handleDeposit}
              disabled={depositing || !depositAmount}
              className="btn-primary text-sm px-4 py-2"
            >
              {depositing ? "⏳..." : "Deposit USDC"}
            </button>
          </div>
        </div>
        {depositTxHash && (
          <a
            href={getExplorerUrl("tx", depositTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 underline"
          >
            View deposit tx on ArcScan →
          </a>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-xl border border-primary-500/20">
              🤖
            </div>
            <div>
              <p className="font-semibold text-dark-100 text-sm">
                {selectedAgent?.name || "AI Agent"}
              </p>
              <p className="text-xs text-accent-400">$0.01 per message</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-400">Session Spent</p>
            <p className="text-sm font-bold text-accent-400">${totalCost.toFixed(4)} USDC</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-dark-800 text-dark-200"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.cost && (
                  <p className="text-xs mt-1 opacity-60">💰 {msg.cost}</p>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-dark-800 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-dark-700 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... ($0.01 per message)"
            className="input-field flex-1"
            aria-label="Chat message"
          />
          <button type="submit" className="btn-primary px-6" disabled={isTyping}>
            Send
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="mt-4 glass-card p-4">
        <p className="text-xs text-dark-400">
          💡 Each message triggers a nanopayment from your inference pool via the AgentForge smart contract.
          Deposit USDC above to fund your pool. Unused balance can be withdrawn anytime.
        </p>
      </div>
    </div>
  );
}
