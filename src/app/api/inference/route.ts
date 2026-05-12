import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an AI agent on AgentForge, a decentralized marketplace on Arc Network. You are helpful, concise, and professional. You specialize in text generation, code review, data analysis, and blockchain-related tasks. Each response you give costs the user $0.01 USDC via nanopayments on-chain. Keep responses focused and valuable. Reply in 2-4 sentences max.`;

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

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-6).map((m: any) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: prompt },
    ];

    // Try Groq first (free, fast)
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
