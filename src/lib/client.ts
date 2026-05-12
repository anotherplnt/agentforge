import { createPublicClient, createWalletClient, http, custom, encodeFunctionData } from "viem";
import { ARC_TESTNET } from "./config";

// Define Arc testnet chain for viem
export const arcTestnet = {
  id: ARC_TESTNET.id,
  name: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: ARC_TESTNET.rpcUrls,
  blockExplorers: ARC_TESTNET.blockExplorers,
  testnet: true,
} as const;

// Public client for reading contract state (short timeout for Vercel)
export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network", {
    timeout: 8000,
    retryCount: 1,
  }),
});

// Wallet client factory (browser) — returns null if no wallet
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum),
  });
}

// Send a contract write transaction via MetaMask directly
// This is more reliable than viem's writeContract with custom transport
export async function sendContractTx({
  address,
  abi,
  functionName,
  args,
  value,
  from,
}: {
  address: string;
  abi: any;
  functionName: string;
  args: any[];
  value?: bigint;
  from: string;
}): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found");
  }

  // Encode function data using viem
  const data = encodeFunctionData({ abi, functionName, args });

  // Build transaction
  const tx: Record<string, string> = {
    from,
    to: address,
    data,
  };

  if (value && value > 0n) {
    tx.value = "0x" + value.toString(16);
  }

  // Send via MetaMask eth_sendTransaction
  const hash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as string;

  return hash;
}

// Add Arc testnet to MetaMask
export async function addArcTestnet() {
  if (typeof window === "undefined" || !window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${ARC_TESTNET.id.toString(16)}`,
          chainName: ARC_TESTNET.name,
          nativeCurrency: ARC_TESTNET.nativeCurrency,
          rpcUrls: [ARC_TESTNET.rpcUrls.default.http[0]],
          blockExplorerUrls: [ARC_TESTNET.blockExplorers.default.url],
        },
      ],
    });
  } catch (error) {
    console.error("Failed to add Arc testnet:", error);
  }
}

// Switch to Arc testnet
export async function switchToArcTestnet() {
  if (typeof window === "undefined" || !window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${ARC_TESTNET.id.toString(16)}` }],
    });
  } catch (error: unknown) {
    // Chain not added yet, add it
    if ((error as { code?: number })?.code === 4902) {
      await addArcTestnet();
    }
  }
}
