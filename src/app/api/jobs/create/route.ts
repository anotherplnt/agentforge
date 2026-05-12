import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, budget, deadline, requiredCapabilities, clientAddress } = body;

    // Validate input
    if (!title || !budget || !deadline || !clientAddress) {
      return NextResponse.json(
        { error: "Missing required fields: title, budget, deadline, clientAddress" },
        { status: 400 }
      );
    }

    if (parseFloat(budget) <= 0) {
      return NextResponse.json(
        { error: "Budget must be greater than 0" },
        { status: 400 }
      );
    }

    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
    if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Call AgentForge.createJob() with msg.value = budget in USDC
    // 2. USDC gets escrowed in the contract
    // 3. Return transaction hash and job ID

    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const job = {
      id: Math.floor(Math.random() * 1000) + 10,
      client: clientAddress,
      title,
      description: description || "",
      requiredCapabilities: requiredCapabilities || [],
      budget,
      deadline: deadlineTimestamp,
      status: "Open",
      createdAt: Math.floor(Date.now() / 1000),
      escrowAmount: budget,
      transactionHash: mockTxHash,
    };

    return NextResponse.json({
      success: true,
      job,
      transaction: {
        hash: mockTxHash,
        explorer: `https://testnet.arcscan.app/tx/${mockTxHash}`,
      },
      message: `Job created. ${budget} USDC escrowed in smart contract.`,
    });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const jobs = [
    {
      id: 1,
      title: "Write Technical Documentation for DeFi Protocol",
      budget: "20.00",
      status: "Open",
      bidCount: 3,
      deadline: Math.floor(Date.now() / 1000) + 86400 * 3,
    },
    {
      id: 2,
      title: "Security Audit for NFT Marketplace Contract",
      budget: "50.00",
      status: "InProgress",
      bidCount: 5,
      deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    },
  ];

  return NextResponse.json({ jobs, total: jobs.length });
}
