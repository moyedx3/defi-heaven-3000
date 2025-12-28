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
      <div className="rounded-3xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:p-8">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Transactions
        </h2>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-3 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:p-8">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Transactions
        </h2>
        <div className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No transactions yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:p-8">
      <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Recent Transactions
      </h2>
      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => {
              const url = getExplorerUrl(tx.chainId, tx.hash);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  tx.type === "send"
                    ? "bg-red-50 dark:bg-red-950/30"
                    : "bg-green-50 dark:bg-green-950/30"
                }`}
              >
                <span className="text-lg">
                  {tx.type === "send" ? "↗" : "↘"}
                </span>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                  {tx.type === "send" ? "Sent" : "Received"}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {tx.type === "send"
                    ? `To ${formatAddress(tx.to || "")}`
                    : `From ${formatAddress(tx.from || "")}`}
                </div>
                <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDate(tx.date)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-semibold ${
                  tx.type === "send"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {tx.type === "send" ? "-" : "+"}
                {parseFloat(tx.amount).toFixed(4)} {tx.symbol}
              </div>
              <div
                className={`mt-1 text-xs font-medium ${
                  tx.status === "confirmed"
                    ? "text-green-600 dark:text-green-400"
                    : tx.status === "pending"
                    ? "text-amber-600 dark:text-amber-400"
                    : tx.status === "failed" || tx.status === "rejected"
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {tx.status === "pending"
                  ? "Pending"
                  : tx.status === "confirmed"
                  ? "Confirmed"
                  : tx.status === "failed"
                  ? "Failed"
                  : tx.status === "rejected"
                  ? "Rejected"
                  : "Unknown"}
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
