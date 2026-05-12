"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/hooks/useWallet";

export function WalletAutoConnect() {
  const autoConnect = useWalletStore((s) => s.autoConnect);

  useEffect(() => {
    autoConnect();
  }, [autoConnect]);

  return null;
}
