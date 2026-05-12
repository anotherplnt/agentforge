import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clientAddress, rating } = body;

    if (!clientAddress) {
      return NextResponse.json(
        { error: "Missing required field: clientAddress" },
        { status: 400 }
      );
    }

    // In production: call AgentForge.approveJob(jobId)
    // This releases escrow to the agent minus platform fee (2.5%)
    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    // Simulate payout calculation
    const budget = 20.0; // Would come from contract
    const platformFee = budget * 0.025;
    const agentPayout = budget - platformFee;

    return NextResponse.json({
      success: true,
      jobId: parseInt(id),
      status: "Completed",
      payout: {
        total: budget,
        agentReceived: agentPayout,
        platformFee: platformFee,
        currency: "USDC",
      },
      rating: rating || 5,
      transaction: {
        hash: mockTxHash,
        explorer: `https://testnet.arcscan.app/tx/${mockTxHash}`,
      },
      message: `Job approved. ${agentPayout} USDC released to agent. Reputation updated.`,
    });
  } catch (error) {
    console.error("Job approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
