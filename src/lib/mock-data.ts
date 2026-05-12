// Mock data for demo purposes when contract is not deployed
import { type AgentData, type JobData } from "./utils";

export const MOCK_AGENTS: AgentData[] = [
  {
    id: 1,
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    metadataURI: "https://api.agentforge.ai/metadata/1",
    capabilities: ["text-generation", "summarization", "translation"],
    pricePerTask: BigInt("5000000000000000000"), // 5 USDC
    pricePerInference: BigInt("10000000000000000"), // 0.01 USDC
    status: 1,
    totalJobs: 47,
    successfulJobs: 45,
    totalEarnings: BigInt("235000000000000000000"), // 235 USDC
    reputationScore: 478,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 30,
    name: "GPT-Forge Alpha",
    description: "Advanced text generation agent specializing in content creation, summarization, and multilingual translation. Powered by state-of-the-art language models.",
    avatar: "🤖",
  },
  {
    id: 2,
    owner: "0xabcdef1234567890abcdef1234567890abcdef12",
    metadataURI: "https://api.agentforge.ai/metadata/2",
    capabilities: ["code-review", "bug-detection", "refactoring"],
    pricePerTask: BigInt("10000000000000000000"), // 10 USDC
    pricePerInference: BigInt("50000000000000000"), // 0.05 USDC
    status: 1,
    totalJobs: 23,
    successfulJobs: 22,
    totalEarnings: BigInt("230000000000000000000"), // 230 USDC
    reputationScore: 491,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 20,
    name: "CodeSentry",
    description: "Expert code review agent that identifies bugs, security vulnerabilities, and suggests refactoring improvements. Supports 15+ programming languages.",
    avatar: "🛡️",
  },
  {
    id: 3,
    owner: "0x9876543210fedcba9876543210fedcba98765432",
    metadataURI: "https://api.agentforge.ai/metadata/3",
    capabilities: ["data-analysis", "visualization", "reporting"],
    pricePerTask: BigInt("8000000000000000000"), // 8 USDC
    pricePerInference: BigInt("30000000000000000"), // 0.03 USDC
    status: 1,
    totalJobs: 31,
    successfulJobs: 29,
    totalEarnings: BigInt("248000000000000000000"), // 248 USDC
    reputationScore: 456,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 15,
    name: "DataMind",
    description: "Intelligent data analysis agent that processes datasets, generates visualizations, and produces comprehensive reports with actionable insights.",
    avatar: "📊",
  },
  {
    id: 4,
    owner: "0xfedcba9876543210fedcba9876543210fedcba98",
    metadataURI: "https://api.agentforge.ai/metadata/4",
    capabilities: ["smart-contract-audit", "solidity", "security"],
    pricePerTask: BigInt("25000000000000000000"), // 25 USDC
    pricePerInference: BigInt("100000000000000000"), // 0.1 USDC
    status: 1,
    totalJobs: 12,
    successfulJobs: 12,
    totalEarnings: BigInt("300000000000000000000"), // 300 USDC
    reputationScore: 500,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 10,
    name: "AuditBot Pro",
    description: "Specialized smart contract auditing agent. Performs deep analysis of Solidity code for vulnerabilities, gas optimization, and best practices compliance.",
    avatar: "🔒",
  },
  {
    id: 5,
    owner: "0x1111222233334444555566667777888899990000",
    metadataURI: "https://api.agentforge.ai/metadata/5",
    capabilities: ["image-generation", "design", "branding"],
    pricePerTask: BigInt("15000000000000000000"), // 15 USDC
    pricePerInference: BigInt("200000000000000000"), // 0.2 USDC
    status: 1,
    totalJobs: 56,
    successfulJobs: 52,
    totalEarnings: BigInt("840000000000000000000"), // 840 USDC
    reputationScore: 462,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 25,
    name: "PixelForge",
    description: "Creative AI agent for image generation, logo design, and brand identity creation. Produces high-quality visuals tailored to your specifications.",
    avatar: "🎨",
  },
];

export const MOCK_JOBS: JobData[] = [
  {
    id: 1,
    client: "0xaaaa111122223333444455556666777788889999",
    assignedAgent: "0x0000000000000000000000000000000000000000",
    title: "Write Technical Documentation for DeFi Protocol",
    description: "Need comprehensive technical documentation for a new DeFi lending protocol. Should cover architecture, API reference, integration guides, and security considerations.",
    requiredCapabilities: ["text-generation", "summarization"],
    budget: BigInt("20000000000000000000"), // 20 USDC
    deadline: Math.floor(Date.now() / 1000) + 86400 * 3,
    status: 0,
    deliverableURI: "",
    createdAt: Math.floor(Date.now() / 1000) - 3600,
    completedAt: 0,
    bidCount: 3,
  },
  {
    id: 2,
    client: "0xbbbb111122223333444455556666777788889999",
    assignedAgent: "0xabcdef1234567890abcdef1234567890abcdef12",
    title: "Security Audit for NFT Marketplace Contract",
    description: "Full security audit of our NFT marketplace smart contract (~500 lines Solidity). Need vulnerability assessment, gas optimization suggestions, and a detailed report.",
    requiredCapabilities: ["smart-contract-audit", "solidity"],
    budget: BigInt("50000000000000000000"), // 50 USDC
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    status: 2,
    deliverableURI: "",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    completedAt: 0,
    bidCount: 5,
  },
  {
    id: 3,
    client: "0xcccc111122223333444455556666777788889999",
    assignedAgent: "0x9876543210fedcba9876543210fedcba98765432",
    title: "Analyze Trading Data and Generate Report",
    description: "Process 6 months of DEX trading data. Generate visualizations showing volume trends, top pairs, and liquidity patterns. Deliver as PDF report.",
    requiredCapabilities: ["data-analysis", "visualization"],
    budget: BigInt("15000000000000000000"), // 15 USDC
    deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
    status: 3,
    deliverableURI: "ipfs://QmXyz123...",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 4,
    completedAt: 0,
    bidCount: 2,
  },
  {
    id: 4,
    client: "0xdddd111122223333444455556666777788889999",
    assignedAgent: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Translate Whitepaper to 5 Languages",
    description: "Translate our 20-page blockchain whitepaper from English to Spanish, French, German, Japanese, and Korean. Must maintain technical accuracy.",
    requiredCapabilities: ["translation", "text-generation"],
    budget: BigInt("30000000000000000000"), // 30 USDC
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
    status: 4,
    deliverableURI: "ipfs://QmAbc456...",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
    completedAt: Math.floor(Date.now() / 1000) - 86400,
    bidCount: 4,
  },
  {
    id: 5,
    client: "0xeeee111122223333444455556666777788889999",
    assignedAgent: "0x0000000000000000000000000000000000000000",
    title: "Design Logo and Brand Kit for Web3 Startup",
    description: "Create a modern logo, color palette, typography guide, and social media templates for a new Web3 gaming startup. Deliverables in SVG and PNG formats.",
    requiredCapabilities: ["image-generation", "design", "branding"],
    budget: BigInt("35000000000000000000"), // 35 USDC
    deadline: Math.floor(Date.now() / 1000) + 86400 * 10,
    status: 0,
    deliverableURI: "",
    createdAt: Math.floor(Date.now() / 1000) - 7200,
    completedAt: 0,
    bidCount: 1,
  },
];
