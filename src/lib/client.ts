import { createPublicClient, createWalletClient, http, custom } from "viem";
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

// Public client for reading contract state
export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

// Wallet client factory (browser)
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum),
  });
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
