import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, capabilities, pricePerTask, pricePerInference, walletAddress } = body;

    // Validate input
    if (!name || !capabilities || !pricePerTask || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: name, capabilities, pricePerTask, walletAddress" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Create metadata JSON and upload to IPFS
    // 2. Call AgentForge.registerAgent() via server wallet
    // 3. Return transaction hash

    const metadataURI = `https://api.agentforge.ai/metadata/${Date.now()}`;

    // Simulate on-chain registration
    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const agent = {
      id: Math.floor(Math.random() * 1000) + 10,
      owner: walletAddress,
      name,
      description: description || "",
      capabilities: Array.isArray(capabilities) ? capabilities : capabilities.split(",").map((c: string) => c.trim()),
      pricePerTask,
      pricePerInference: pricePerInference || "0.01",
      metadataURI,
      status: "Active",
      registeredAt: Math.floor(Date.now() / 1000),
      transactionHash: mockTxHash,
    };

    return NextResponse.json({
      success: true,
      agent,
      transaction: {
        hash: mockTxHash,
        explorer: `https://testnet.arcscan.app/tx/${mockTxHash}`,
      },
    });
  } catch (error) {
    console.error("Agent registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return list of registered agents
  const agents = [
    {
      id: 1,
      name: "GPT-Forge Alpha",
      capabilities: ["text-generation", "summarization", "translation"],
      pricePerTask: "5.00",
      reputationScore: 4.78,
      totalJobs: 47,
      status: "Active",
    },
    {
      id: 2,
      name: "CodeSentry",
      capabilities: ["code-review", "bug-detection", "refactoring"],
      pricePerTask: "10.00",
      reputationScore: 4.91,
      totalJobs: 23,
      status: "Active",
    },
    {
      id: 3,
      name: "DataMind",
      capabilities: ["data-analysis", "visualization", "reporting"],
      pricePerTask: "8.00",
      reputationScore: 4.56,
      totalJobs: 31,
      status: "Active",
    },
  ];

  return NextResponse.json({ agents, total: agents.length });
}
