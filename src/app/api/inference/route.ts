import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY as `0x${string}` | undefined;

const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
} as const;

const CONTRACT_ADDRESS = "0x946373Ff1Ab59224999904C8A412bcFF94210128" as `0x${string}`;
const INFERENCE_COST = parseUnits("0.01", 18); // 0.01 USDC (18 decimals on Arc)

const CHARGE_ABI = [
  {
    name: "chargeInference",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "depositor", type: "address" },
      { name: "agent", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getInferencePool",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "depositor", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "depositor", type: "address" },
          { name: "balance", type: "uint256" },
          { name: "totalSpent", type: "uint256" },
          { name: "callCount", type: "uint256" },
        ],
      },
    ],
  },
] as const;

const SYSTEM_PROMPT = `You are an AI agent on AgentForge, a decentralized marketplace on Arc Network. You are helpful, concise, and professional. You specialize in text generation, code review, data analysis, and blockchain-related tasks. Each response you give costs the user $0.01 USDC via nanopayments on-chain. Keep responses focused and valuable. Reply in 2-4 sentences max.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, agentId, depositorAddress, agentOwnerAddress, history } = body;

    if (!prompt || !depositorAddress) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, depositorAddress" },
        { status: 400 }
      );
    }

    // ── 1. Charge inference on-chain (server-side, operator wallet) ──
    let chargeSuccess = false;
    let chargeTxHash: string | null = null;
    let chargeError: string | null = null;

    if (OPERATOR_PRIVATE_KEY) {
      try {
        const account = privateKeyToAccount(OPERATOR_PRIVATE_KEY);
        const walletClient = createWalletClient({
          account,
          chain: ARC_TESTNET,
          transport: http("https://rpc.testnet.arc.network", { timeout: 15_000 }),
        });
        const publicClient = createPublicClient({
          chain: ARC_TESTNET,
          transport: http("https://rpc.testnet.arc.network", { timeout: 15_000 }),
        });

        // Check pool balance first
        const pool = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CHARGE_ABI,
          functionName: "getInferencePool",
          args: [depositorAddress as `0x${string}`],
        }) as any;

        const poolBalance = BigInt(pool.balance || pool[1] || 0);

        if (poolBalance < INFERENCE_COST) {
          return NextResponse.json(
            { error: "Insufficient pool balance. Please deposit USDC first.", code: "INSUFFICIENT_BALANCE" },
            { status: 402 }
          );
        }

        // Agent owner address — fallback to contract owner if not provided
        const agentOwner = (agentOwnerAddress || account.address) as `0x${string}`;

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CHARGE_ABI,
          functionName: "chargeInference",
          args: [depositorAddress as `0x${string}`, agentOwner, INFERENCE_COST],
        });

        console.log("chargeInference tx:", hash);
        chargeTxHash = hash;
        chargeSuccess = true;
      } catch (err: any) {
        chargeError = err?.shortMessage || err?.message || "Charge failed";
        console.warn("chargeInference failed:", chargeError);
        // If pool balance check passed but tx failed, still allow (RPC issue)
        // But if it's a balance error, block
        if (chargeError?.includes("Insufficient pool")) {
          return NextResponse.json(
            { error: "Insufficient pool balance. Please deposit USDC first.", code: "INSUFFICIENT_BALANCE" },
            { status: 402 }
          );
        }
      }
    } else {
      console.warn("OPERATOR_PRIVATE_KEY not set — skipping on-chain charge");
    }

    // ── 2. Get AI response ──
    const costPerInference = 0.01;
    let response = "";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-6).map((m: any) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: prompt },
    ];

    // Try Groq first
    if (GROQ_API_KEY) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          response = data.choices[0]?.message?.content || "";
        }
      } catch {}
    }

    // Fallback to OpenAI
    if (!response && OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          response = data.choices[0]?.message?.content || "";
        }
      } catch {}
    }

    // Final fallback
    if (!response) {
      const lower = prompt.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        response = "Hello! I'm your AI agent on AgentForge. I can help with text generation, code review, data analysis, and blockchain tasks. What would you like me to work on?";
      } else if (lower.includes("code") || lower.includes("program")) {
        response = "I'd be happy to help with code. Could you share the specific code or describe what you'd like me to review/write? I support Solidity, TypeScript, Python, and more.";
      } else if (lower.includes("blockchain") || lower.includes("smart contract")) {
        response = "I specialize in smart contract development on EVM chains. I can help with contract architecture, security patterns, gas optimization, and deployment strategies.";
      } else {
        response = `I've processed your request. Based on my analysis, I can provide detailed assistance on this topic. Would you like me to elaborate further?`;
      }
    }

    return NextResponse.json({
      success: true,
      response,
      charge: {
        success: chargeSuccess,
        txHash: chargeTxHash,
        error: chargeError,
        amount: "0.01",
        currency: "USDC",
      },
      inference: {
        agentId: agentId || 1,
        cost: costPerInference,
        currency: "USDC",
        model: GROQ_API_KEY ? "llama-3.1-8b" : OPENAI_API_KEY ? "gpt-4o-mini" : "local",
        tokensUsed: Math.floor(response.length / 4),
      },
    });
  } catch (error) {
    console.error("Inference error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
