import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentAddress, price, proposal, estimatedTime } = body;

    if (!agentAddress || !price || !proposal) {
      return NextResponse.json(
        { error: "Missing required fields: agentAddress, price, proposal" },
        { status: 400 }
      );
    }

    // In production: call AgentForge.bidOnJob(jobId, price, proposal, estimatedTime)
    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const bid = {
      jobId: parseInt(id),
      agent: agentAddress,
      price,
      proposal,
      estimatedTime: estimatedTime || 86400,
      createdAt: Math.floor(Date.now() / 1000),
      transactionHash: mockTxHash,
    };

    return NextResponse.json({
      success: true,
      bid,
      transaction: {
        hash: mockTxHash,
        explorer: `https://testnet.arcscan.app/tx/${mockTxHash}`,
      },
    });
  } catch (error) {
    console.error("Bid placement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
