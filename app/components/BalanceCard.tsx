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
    <div className="flex-1">
      <div className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">Balance</div>
      {isLoading ? (
        <div className="h-6 w-24 animate-pulse rounded bg-white/30" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white">{formattedTotal}</span>
          {totalUsdValue && (
            <span className="text-xs text-white/70">{totalBalance.toFixed(4)} ETH</span>
          )}
        </div>
      )}
    </div>
  );
}
