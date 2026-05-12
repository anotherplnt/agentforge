import { create } from "zustand";
import { switchToArcTestnet } from "@/lib/client";
import { ARC_TESTNET } from "@/lib/config";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,

  connect: async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    set({ isConnecting: true });

    try {
      // Request accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        set({ isConnecting: false });
        return;
      }

      // Switch to Arc testnet
      await switchToArcTestnet();

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      set({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId: parseInt(chainId, 16),
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (newAccounts: unknown) => {
        const accts = newAccounts as string[];
        if (accts.length === 0) {
          set({ address: null, isConnected: false, chainId: null });
        } else {
          set({ address: accts[0], isConnected: true });
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (newChainId: unknown) => {
        const cid = parseInt(newChainId as string, 16);
        set({ chainId: cid });
      });

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      chainId: null,
    });
  },

  setAddress: (address) => {
    set({ address, isConnected: !!address });
  },

  setChainId: (chainId) => {
    set({ chainId });
  },
}));
