"use client";

import { useBalance } from "wagmi";
import { useMemo, useState } from "react";
import { mainnet, base, sepolia, arbitrum } from "wagmi/chains";
import { useEvmWallet } from "../hooks/useEvmWallet";
import { useEthPrice } from "../hooks/useEthPrice";

interface ChainBalance {
  chainId: number;
  chainName: string;
  balance: string;
  formatted: string;
  symbol: string;
  isLoading: boolean;
  usdValue?: number;
}

export function BalanceCard() {
  const { address: walletAddress, isConnected } = useEvmWallet();
  const { ethPrice } = useEthPrice();
  const [showDetails, setShowDetails] = useState(false);

  const mainnetBalance = useBalance({
    address: walletAddress,
    chainId: mainnet.id,
    query: { enabled: !!walletAddress },
  });

  const baseBalance = useBalance({
    address: walletAddress,
    chainId: base.id,
    query: { enabled: !!walletAddress },
  });

  const arbitrumBalance = useBalance({
    address: walletAddress,
    chainId: arbitrum.id,
    query: { enabled: !!walletAddress },
  });

  const sepoliaBalance = useBalance({
    address: walletAddress,
    chainId: sepolia.id,
    query: { enabled: !!walletAddress },
  });

  // Aggregate balances
  const { totalBalance, chainBalances, isLoading } = useMemo(() => {
    let total = 0;
    const balances: ChainBalance[] = [];
    let loading = false;

    const balanceQueries = [
      { query: mainnetBalance, chainId: mainnet.id, chainName: "Ethereum" },
      { query: baseBalance, chainId: base.id, chainName: "Base" },
      { query: arbitrumBalance, chainId: arbitrum.id, chainName: "Arbitrum" },
      { query: sepoliaBalance, chainId: sepolia.id, chainName: "Sepolia" },
    ];

    balanceQueries.forEach(({ query, chainId, chainName }) => {
      if (query.isLoading) {
        loading = true;
        balances.push({
          chainId,
          chainName,
          balance: "0",
          formatted: "0.00",
          symbol: "ETH",
          isLoading: true,
        });
      } else if (query.isError) {
        balances.push({
          chainId,
          chainName,
          balance: "0",
          formatted: "0.00",
          symbol: "ETH",
          isLoading: false,
        });
      } else if (query.data) {
        const value = parseFloat(query.data.formatted);
        total += value;
        balances.push({
          chainId,
          chainName,
          balance: query.data.value.toString(),
          formatted: query.data.formatted,
          symbol: query.data.symbol,
          isLoading: false,
          usdValue: ethPrice ? value * ethPrice : undefined,
        });
      } else {
        balances.push({
          chainId,
          chainName,
          balance: "0",
          formatted: "0.00",
          symbol: "ETH",
          isLoading: false,
        });
      }
    });

    return {
      totalBalance: total,
      chainBalances: balances,
      isLoading: loading,
    };
  }, [mainnetBalance, baseBalance, arbitrumBalance, sepoliaBalance, ethPrice]);

  if (!isConnected || !walletAddress) {
    return null;
  }

  const totalUsdValue = ethPrice ? totalBalance * ethPrice : null;
  const formattedTotal = totalUsdValue
    ? totalUsdValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: "currency",
        currency: "USD",
      })
    : totalBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });

  return (
    <div className="relative overflow-hidden anime-card rounded-2xl">
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 text-lg">✨</div>

      <div className="p-4 relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <div className="anime-subtitle text-xs uppercase tracking-wider">
            💰 Balance
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-all"
          >
            {showDetails ? "Hide" : "Show"} ♥
          </button>
        </div>
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-32 animate-pulse rounded bg-white/30" />
        ) : (
          <>
            <div className="anime-title text-3xl">
              {formattedTotal}
            </div>
            {totalUsdValue && (
              <div className="anime-subtitle text-sm">
                {totalBalance.toFixed(4)} ETH
              </div>
            )}
          </>
        )}
      </div>

        {showDetails && (
          <div className="mt-3 space-y-2 border-t border-white/30 pt-3">
            {chainBalances.map((chain) => (
              <div
                key={chain.chainId}
                className="flex items-center justify-between bg-white/10 rounded-lg px-2 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm">♥</div>
                  <div className="text-xs font-bold text-white">
                    {chain.chainName}
                  </div>
                </div>
                <div className="text-right">
                  {chain.isLoading ? (
                    <div className="h-3 w-16 animate-pulse rounded bg-white/30" />
                  ) : (
                    <div className="text-xs font-bold text-white">
                      {chain.usdValue ? `$${chain.usdValue.toFixed(2)}` : "$0.00"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
