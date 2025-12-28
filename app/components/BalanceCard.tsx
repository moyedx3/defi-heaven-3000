"use client";

import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { useBalance } from "wagmi";
import { useMemo, useState, useEffect } from "react";
import { mainnet, base, sepolia, arbitrum } from "wagmi/chains";

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
  const paraAccount = useParaAccount();
  const [showDetails, setShowDetails] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  
  const evmWallet = useMemo(() => {
    if (!paraAccount.isConnected || !paraAccount.embedded?.wallets) return null;
    const wallets = Object.values(paraAccount.embedded.wallets);
    return wallets.find((w: any) => w.type === "EVM");
  }, [paraAccount]);

  const walletAddress = evmWallet?.address as `0x${string}` | undefined;

  // Fetch ETH price in USD
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setEthPrice(data.ethereum?.usd || null);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        // Fallback to a default price if API fails
        setEthPrice(2500);
      }
    };

    fetchEthPrice();
    // Refresh price every 30 seconds
    const interval = setInterval(fetchEthPrice, 30000);
    return () => clearInterval(interval);
  }, []);

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
  }, [
    mainnetBalance.data,
    mainnetBalance.isLoading,
    mainnetBalance.isError,
    baseBalance.data,
    baseBalance.isLoading,
    baseBalance.isError,
    arbitrumBalance.data,
    arbitrumBalance.isLoading,
    arbitrumBalance.isError,
    sepoliaBalance.data,
    sepoliaBalance.isLoading,
    sepoliaBalance.isError,
    ethPrice,
  ]);

  if (!paraAccount.isConnected || !walletAddress) {
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
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div className="p-6 md:p-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Balance
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
        {isLoading ? (
          <>
            <div className="h-12 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-6 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </>
        ) : (
          <>
            <div className="text-4xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              {formattedTotal}
            </div>
            {totalUsdValue && (
              <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 sm:ml-3">
                {totalBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 6,
                })}{" "}
                ETH
              </div>
            )}
          </>
        )}
      </div>

        {showDetails && (
          <div className="mt-6 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            {chainBalances.map((chain) => (
              <div
                key={chain.chainId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {chain.chainName}
                    </div>
                    {chain.isLoading && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500">
                        Loading...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {chain.isLoading ? (
                    <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  ) : (
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {chain.usdValue
                          ? chain.usdValue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              style: "currency",
                              currency: "USD",
                            })
                          : "$0.00"}
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500">
                        {parseFloat(chain.formatted).toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 6,
                        })}{" "}
                        {chain.symbol}
                      </div>
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
