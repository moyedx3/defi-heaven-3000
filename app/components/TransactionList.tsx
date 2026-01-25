"use client";

import { useTransactionHistory, addPendingTransaction } from "../hooks/useTransactionHistory";
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

function formatDate(timestamp: string | number): string {
  const date = new Date(typeof timestamp === "string" ? parseInt(timestamp) * 1000 : timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getChainName(chainId: number): string {
  switch (chainId) {
    case mainnet.id: return "ETH";
    case sepolia.id: return "SEP";
    case base.id: return "BASE";
    case arbitrum.id: return "ARB";
    default: return "ETH";
  }
}

export function TransactionList() {
  const { transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/10 rounded-lg px-2 py-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-6 rounded-full" />
                <div className="skeleton h-3 w-16" />
              </div>
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-6">
        <div className="text-3xl mb-2 animate-heartbeat">💫</div>
        <p className="text-xs text-white/70">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {transactions.map((tx, index) => (
        <div
          key={tx.id}
          onClick={() => {
            const url = getExplorerUrl(tx.chainId, tx.hash);
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className={`bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1.5 cursor-pointer transition-all ${
            tx.type === "send" ? "border-l-2 border-red-400" : "border-l-2 border-green-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{tx.type === "send" ? "↗️" : "↘️"}</span>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-white">
                    {tx.type === "send" ? "Sent" : "Received"}
                  </span>
                  <span className="text-[9px] text-white/50">{getChainName(tx.chainId)}</span>
                </div>
                <div className="text-[9px] text-white/50">{formatDate(tx.date)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-[11px] font-bold ${tx.type === "send" ? "text-red-300" : "text-green-300"}`}>
                {tx.type === "send" ? "-" : "+"}{parseFloat(tx.amount).toFixed(4)} {tx.symbol}
              </div>
              <div className={`text-[8px] ${tx.status === "confirmed" ? "text-green-400" : tx.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>
                {tx.status === "pending" ? "Pending" : tx.status === "confirmed" ? "Done" : "Failed"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Export function to add pending transactions (to be called from SendForm)
export { addPendingTransaction };
