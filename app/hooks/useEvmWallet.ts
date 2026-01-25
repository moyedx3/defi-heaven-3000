"use client";

import { useMemo } from "react";
import { useAccount as useParaAccount } from "@getpara/react-sdk";

interface EvmWallet {
  type: "EVM";
  address: string;
}

/**
 * Shared hook to extract EVM wallet from Para SDK
 * Eliminates duplicate wallet extraction logic across components
 */
export function useEvmWallet() {
  const paraAccount = useParaAccount();

  const evmWallet = useMemo(() => {
    if (!paraAccount.isConnected || !paraAccount.embedded?.wallets) return null;
    const wallets = Object.values(paraAccount.embedded.wallets) as Array<{ type: string; address: string }>;
    return wallets.find((w): w is EvmWallet => w.type === "EVM") || null;
  }, [paraAccount]);

  return {
    wallet: evmWallet,
    address: evmWallet?.address as `0x${string}` | undefined,
    isConnected: paraAccount.isConnected,
  };
}
