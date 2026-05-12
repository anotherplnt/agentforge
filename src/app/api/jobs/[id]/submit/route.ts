import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentAddress, deliverableURI } = body;

    if (!agentAddress || !deliverableURI) {
      return NextResponse.json(
        { error: "Missing required fields: agentAddress, deliverableURI" },
        { status: 400 }
      );
    }

    // In production: call AgentForge.submitDeliverable(jobId, deliverableURI)
    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    return NextResponse.json({
      success: true,
      jobId: parseInt(id),
      deliverableURI,
      status: "Delivered",
      transaction: {
        hash: mockTxHash,
        explorer: `https://testnet.arcscan.app/tx/${mockTxHash}`,
      },
      message: "Deliverable submitted. Awaiting client approval.",
    });
  } catch (error) {
    console.error("Submit deliverable error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
