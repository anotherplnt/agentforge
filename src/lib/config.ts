// Arc Testnet Configuration
export const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
} as const;

// Contract Addresses
export const CONTRACTS = {
  agentForge: process.env.NEXT_PUBLIC_AGENTFORGE_ADDRESS || "0x0000000000000000000000000000000000000000",
  usdc: "0x3600000000000000000000000000000000000000",
  identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
  validationRegistry: "0x8004Cb1BF31DAf7788923b405b754f57acEB4272",
  agenticCommerce: "0x0747EEf0706327138c69792bF28Cd525089e4583",
} as const;

// Explorer helpers
export function getExplorerUrl(type: "tx" | "address" | "block", hash: string): string {
  return `${ARC_TESTNET.blockExplorers.default.url}/${type}/${hash}`;
}

export function formatUSDC(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / 10 ** decimals;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

export function parseUSDC(amount: string, decimals: number = 18): bigint {
  const value = parseFloat(amount);
  return BigInt(Math.floor(value * 10 ** decimals));
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function timeRemaining(deadline: number): string {
  const seconds = deadline - Math.floor(Date.now() / 1000);
  if (seconds <= 0) return "Expired";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m left`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h left`;
  return `${Math.floor(seconds / 86400)}d left`;
}
