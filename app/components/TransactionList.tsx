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
      <div className="anime-card rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📋</span>
          <h2 className="anime-subtitle text-base font-bold">
            Transactions
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tx-item px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                </div>
                <div className="skeleton h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="anime-card rounded-2xl p-6 overflow-hidden text-center">
        <div className="py-8">
          <div className="text-5xl mb-4 animate-heartbeat">💫</div>
          <h3 className="anime-subtitle text-lg font-bold mb-2">No Transactions Yet</h3>
          <p className="text-sm text-white/70">
            Your transaction history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="anime-card rounded-2xl p-4 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h2 className="anime-subtitle text-base font-bold">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
          {transactions.length} txns
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[calc(100%-50px)]">
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            onClick={() => {
              const url = getExplorerUrl(tx.chainId, tx.hash);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className={`tx-item ${tx.type === "send" ? "tx-send" : "tx-receive"} px-4 py-3`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                    tx.type === "send"
                      ? "bg-red-500/30 border-2 border-red-400/50"
                      : "bg-green-500/30 border-2 border-green-400/50"
                  }`}
                >
                  {tx.type === "send" ? "↗️" : "↘️"}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {tx.type === "send" ? "Sent" : "Received"}
                    </span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                      {getChainName(tx.chainId)}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/60">
                    {formatDate(tx.date)}
                  </div>
                </div>
              </div>

              {/* Amount & Status */}
              <div className="text-right">
                <div
                  className={`font-bold text-sm ${
                    tx.type === "send" ? "text-red-300" : "text-green-300"
                  }`}
                >
                  {tx.type === "send" ? "-" : "+"}
                  {parseFloat(tx.amount).toFixed(4)} {tx.symbol}
                </div>
                <div
                  className={`status-badge inline-block mt-1 ${
                    tx.status === "confirmed"
                      ? "status-confirmed"
                      : tx.status === "pending"
                      ? "status-pending"
                      : "status-failed"
                  }`}
                >
                  {tx.status === "pending" ? "⏳ Pending" : tx.status === "confirmed" ? "✓ Done" : "✗ Failed"}
                </div>
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
