import { create } from "zustand";

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

export const useWalletStore = create<WalletState>((set) => ({
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
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      if (accounts && accounts.length > 0) {
        set({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId: parseInt(chainId, 16),
        });
      }
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
