"use client";

import { useState } from "react";
import { useEvmWallet } from "../hooks/useEvmWallet";
import { useTokenBalances } from "../hooks/useTokenBalances";

export function BalanceCard() {
  const { address: walletAddress, isConnected } = useEvmWallet();
  const [showDetails, setShowDetails] = useState(false);

  const {
    chainBalances,
    totalUsdValue,
    totalEthBalance,
    totalUsdcBalance,
    isLoading,
  } = useTokenBalances(walletAddress);

  if (!isConnected || !walletAddress) {
    return null;
  }

  const formattedTotalUsd = totalUsdValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  });

  // Filter chains that have at least one token with balance
  const chainsWithBalance = chainBalances.filter((chain) => chain.tokens.length > 0);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[10px] text-white/70 uppercase tracking-wider">Balance</span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[9px] text-white/50 hover:text-white/80 transition-colors"
        >
          {showDetails ? "▲" : "▼"}
        </button>
      </div>
      {isLoading ? (
        <div className="h-6 w-24 animate-pulse rounded bg-white/30" />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{formattedTotalUsd}</span>
            <span className="text-xs text-white/70">
              {totalEthBalance > 0 && `${totalEthBalance.toFixed(4)} ETH`}
              {totalEthBalance > 0 && totalUsdcBalance > 0 && " + "}
              {totalUsdcBalance > 0 && `${totalUsdcBalance.toFixed(2)} USDC`}
            </span>
          </div>
          {showDetails && chainsWithBalance.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {chainsWithBalance.map((chain) => (
                <div key={chain.chainId} className="text-[9px]">
                  <div className="text-white/60 mb-0.5">{chain.chainName}</div>
                  {chain.tokens.map((token) => (
                    <div
                      key={`${chain.chainId}-${token.symbol}`}
                      className="flex items-center justify-between pl-2"
                    >
                      <span className="text-white/50">{token.symbol}</span>
                      <span className="text-white/80">
                        {token.symbol === "ETH"
                          ? `${parseFloat(token.formatted).toFixed(4)}`
                          : `${parseFloat(token.formatted).toFixed(2)}`}
                        <span className="text-white/50 ml-1">
                          (${token.usdValue.toFixed(2)})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
