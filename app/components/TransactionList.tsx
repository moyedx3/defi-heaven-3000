"use client";

import { useTransactionHistory, addPendingTransaction } from "../hooks/useTransactionHistory";
import { useMemo } from "react";
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";

function getExplorerUrl(chainId: number, txHash: string): string {
  switch (chainId) {
    case mainnet.id:
      return `https://etherscan.io/tx/${txHash}`;
    case sepolia.id:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case base.id:
      return `https://basescan.org/tx/${txHash}`;
    case arbitrum.id:
      return `https://arbiscan.io/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: string | number): string {
  const date = new Date(typeof timestamp === "string" ? parseInt(timestamp) * 1000 : timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionList() {
  const { transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return (
      <div className="relative anime-card rounded-2xl p-4 overflow-hidden">
        <h2 className="mb-3 anime-title text-lg relative z-10">
          Transactions
        </h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/10"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/30" />
                <div className="h-4 w-16 animate-pulse rounded bg-white/30" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded bg-white/30" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="relative anime-card rounded-2xl p-4 overflow-hidden">
        <h2 className="mb-3 anime-title text-lg relative z-10">
          Transactions
        </h2>
        <div className="py-6 text-center anime-subtitle text-sm">
          No transactions yet ♥
        </div>
      </div>
    );
  }

  return (
    <div className="relative anime-card rounded-2xl p-4 overflow-hidden h-full">
      <h2 className="mb-3 anime-title text-lg relative z-10">
        Transactions
      </h2>
      <div className="space-y-2 relative z-10 overflow-y-auto max-h-[calc(100%-40px)]">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => {
              const url = getExplorerUrl(tx.chainId, tx.hash);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 bg-white/10 transition-all hover:bg-white/20 border border-white/30"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                  tx.type === "send"
                    ? "bg-red-500/30"
                    : "bg-green-500/30"
                }`}
              >
                {tx.type === "send" ? "↗️" : "↘️"}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {tx.type === "send" ? "Sent" : "Received"}
                </div>
                <div className="text-[10px] text-white/70">
                  {formatDate(tx.date)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-bold text-sm ${
                  tx.type === "send"
                    ? "text-red-300"
                    : "text-green-300"
                }`}
              >
                {tx.type === "send" ? "-" : "+"}
                {parseFloat(tx.amount).toFixed(4)}
              </div>
              <div
                className={`text-[10px] font-bold ${
                  tx.status === "confirmed"
                    ? "text-green-300"
                    : tx.status === "pending"
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                {tx.status === "pending" ? "⏳ Pending" : tx.status === "confirmed" ? "✅ Confirmed" : "❌ Failed"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export function to add pending transactions (to be called from SendForm)
export { addPendingTransaction };
