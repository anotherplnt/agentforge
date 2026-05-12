const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

const ABI = require("../artifacts/contracts/AgentForge.sol/AgentForge.json").abi;

const CONTRACT = "0x946373Ff1Ab59224999904C8A412bcFF94210128";
const RPC = "https://rpc.testnet.arc.network";
const PK = "0xdb09147432c3c5ab7504a7003beb99c5216480f03f2324b9d1ff8993d58d518b";

const chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const account = privateKeyToAccount(PK);
const publicClient = createPublicClient({ chain, transport: http(RPC) });
const walletClient = createWalletClient({ chain, transport: http(RPC), account });

async function main() {
  console.log("Wallet:", account.address);
  
  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", formatEther(balance), "USDC");

  // Check current stats
  const stats = await publicClient.readContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "getStats",
  });
  console.log("Stats - Agents:", stats[0].toString(), "Jobs:", stats[1].toString(), "Volume:", formatEther(stats[2]), "USDC");

  // 1. Register Agent
  console.log("\n--- Registering Agent ---");
  try {
    const regHash = await walletClient.writeContract({
      address: CONTRACT,
      abi: ABI,
      functionName: "registerAgent",
      args: [
        "data:application/json," + encodeURIComponent(JSON.stringify({ name: "TestBot Alpha", description: "AI agent for testing" })),
        "text-generation,code-review",
        parseEther("5"),    // 5 USDC per task
        parseEther("0.01"), // 0.01 USDC per inference
      ],
    });
    console.log("Register tx:", regHash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: regHash });
    console.log("Status:", receipt.status, "Block:", receipt.blockNumber.toString());
  } catch (e) {
    console.log("Register error:", e.shortMessage || e.message);
  }

  // 2. Create Job
  console.log("\n--- Creating Job ---");
  try {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24h from now
    const jobHash = await walletClient.writeContract({
      address: CONTRACT,
      abi: ABI,
      functionName: "createJob",
      args: [
        "Write API Documentation",
        "Create comprehensive API docs for our REST endpoints",
        "technical-writing,documentation",
        deadline,
      ],
      value: parseEther("2"), // 2 USDC escrow
    });
    console.log("Create job tx:", jobHash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: jobHash });
    console.log("Status:", receipt.status, "Block:", receipt.blockNumber.toString());
  } catch (e) {
    console.log("Create job error:", e.shortMessage || e.message);
  }

  // 3. Check updated stats
  console.log("\n--- Updated Stats ---");
  const newStats = await publicClient.readContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "getStats",
  });
  console.log("Agents:", newStats[0].toString(), "Jobs:", newStats[1].toString(), "Volume:", formatEther(newStats[2]), "USDC");

  // 4. Verify agent
  const agent = await publicClient.readContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "getAgentByOwner",
    args: [account.address],
  });
  console.log("\nAgent registered:", { id: agent.id.toString(), capabilities: agent.capabilities, status: agent.status });
}

main().catch(console.error);
