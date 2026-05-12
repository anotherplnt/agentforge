import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an AI agent on AgentForge, a decentralized marketplace on Arc Network. You are helpful, concise, and professional. You specialize in text generation, code review, data analysis, and blockchain-related tasks. Each response you give costs the user $0.01 USDC via nanopayments on-chain. Keep responses focused and valuable.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, agentId, depositorAddress, history } = body;

    if (!prompt || !depositorAddress) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, depositorAddress" },
        { status: 400 }
      );
    }

    const costPerInference = 0.01; // USDC

    let response = "";

    if (OPENAI_API_KEY) {
      // Real AI response via OpenAI
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(history || []).slice(-6).map((m: any) => ({
          role: m.role === "agent" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: prompt },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        response = data.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
      } else {
        response = "I'm experiencing connectivity issues. Please try again in a moment.";
      }
    } else {
      // Fallback smart responses
      const lower = prompt.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        response = "Hello! I'm your AI agent on AgentForge. I can help with text generation, code review, data analysis, and blockchain tasks. What would you like me to work on?";
      } else if (lower.includes("code") || lower.includes("program") || lower.includes("function")) {
        response = "I'd be happy to help with code. Could you share the specific code or describe what you'd like me to review/write? I can assist with Solidity, TypeScript, Python, and more.";
      } else if (lower.includes("blockchain") || lower.includes("smart contract") || lower.includes("solidity")) {
        response = "Great question about blockchain! I specialize in smart contract development on EVM chains. I can help with contract architecture, security patterns, gas optimization, and deployment strategies.";
      } else if (lower.includes("analyze") || lower.includes("data") || lower.includes("research")) {
        response = "I can help analyze data and provide insights. Please share the data or describe what you'd like me to research, and I'll provide a structured analysis.";
      } else {
        response = `I've processed your request: "${prompt.slice(0, 50)}...". Based on my analysis, I can provide detailed assistance on this topic. Would you like me to elaborate on any specific aspect, or shall I provide a comprehensive overview?`;
      }
    }

    return NextResponse.json({
      success: true,
      response,
      inference: {
        agentId: agentId || 1,
        cost: costPerInference,
        currency: "USDC",
        model: OPENAI_API_KEY ? "gpt-4o-mini" : "agentforge-local",
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
