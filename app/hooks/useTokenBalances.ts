"use client";

import { useBalance } from "wagmi";
import { useMemo } from "react";
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";
import { useEthPrice } from "./useEthPrice";
import { SUPPORTED_TOKENS, SUPPORTED_CHAINS } from "../config/tokens";

// Stale time for balance queries - balances rarely change except after transactions
const BALANCE_STALE_TIME = 30_000; // 30 seconds

interface TokenBalance {
  symbol: string;
  balance: bigint;
  formatted: string;
  usdValue: number;
  isLoading: boolean;
}

interface ChainTokenBalances {
  chainId: number;
  chainName: string;
  tokens: TokenBalance[];
  totalUsdValue: number;
  isLoading: boolean;
  isError: boolean;
}

interface UseTokenBalancesResult {
  chainBalances: ChainTokenBalances[];
  totalUsdValue: number;
  totalEthBalance: number;
  totalUsdcBalance: number;
  isLoading: boolean;
  isError: boolean;
}

// USDC price is hardcoded at $1 (stablecoin)
const USDC_PRICE = 1.0;

export function useTokenBalances(walletAddress: `0x${string}` | undefined): UseTokenBalancesResult {
  const { ethPrice } = useEthPrice();

  // Get USDC config with proper null check
  const usdcConfig = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
  if (!usdcConfig) {
    throw new Error("USDC token configuration not found - check config/tokens.ts");
  }

  // ETH balances (4 calls) with staleTime for caching
  const ethMainnet = useBalance({
    address: walletAddress,
    chainId: mainnet.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const ethBase = useBalance({
    address: walletAddress,
    chainId: base.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const ethArbitrum = useBalance({
    address: walletAddress,
    chainId: arbitrum.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const ethSepolia = useBalance({
    address: walletAddress,
    chainId: sepolia.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });

  // USDC balances (4 calls) with staleTime for caching
  const usdcMainnet = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[mainnet.id],
    chainId: mainnet.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const usdcBase = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[base.id],
    chainId: base.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const usdcArbitrum = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[arbitrum.id],
    chainId: arbitrum.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  const usdcSepolia = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[sepolia.id],
    chainId: sepolia.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });

  // Derive loading and error states directly from queries
  const isLoading =
    ethMainnet.isLoading ||
    ethBase.isLoading ||
    ethArbitrum.isLoading ||
    ethSepolia.isLoading ||
    usdcMainnet.isLoading ||
    usdcBase.isLoading ||
    usdcArbitrum.isLoading ||
    usdcSepolia.isLoading;

  const isError =
    ethMainnet.isError ||
    ethBase.isError ||
    ethArbitrum.isError ||
    ethSepolia.isError ||
    usdcMainnet.isError ||
    usdcBase.isError ||
    usdcArbitrum.isError ||
    usdcSepolia.isError;

  // Build chain balances using reduce to avoid variable reassignment
  const chainBalances: ChainTokenBalances[] = useMemo(() => {
    const ethQueries = [ethMainnet, ethBase, ethArbitrum, ethSepolia];
    const usdcQueries = [usdcMainnet, usdcBase, usdcArbitrum, usdcSepolia];

    return SUPPORTED_CHAINS.map((chainConfig, index) => {
      const ethQuery = ethQueries[index];
      const usdcQuery = usdcQueries[index];
      const tokens: TokenBalance[] = [];
      const chainLoading = ethQuery.isLoading || usdcQuery.isLoading;
      const chainError = ethQuery.isError || usdcQuery.isError;

      // Process ETH balance
      if (!ethQuery.isError && ethQuery.data) {
        const ethValue = parseFloat(ethQuery.data.formatted);
        const ethUsdValue = ethPrice ? ethValue * ethPrice : 0;

        if (ethValue > 0) {
          tokens.push({
            symbol: "ETH",
            balance: ethQuery.data.value,
            formatted: ethQuery.data.formatted,
            usdValue: ethUsdValue,
            isLoading: false,
          });
        }
      }

      // Process USDC balance
      if (!usdcQuery.isError && usdcQuery.data) {
        const usdcValue = parseFloat(usdcQuery.data.formatted);
        const usdcUsdValue = usdcValue * USDC_PRICE;

        if (usdcValue > 0) {
          tokens.push({
            symbol: "USDC",
            balance: usdcQuery.data.value,
            formatted: usdcQuery.data.formatted,
            usdValue: usdcUsdValue,
            isLoading: false,
          });
        }
      }

      const chainTotalUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);

      return {
        chainId: chainConfig.id,
        chainName: chainConfig.name,
        tokens,
        totalUsdValue: chainTotalUsd,
        isLoading: chainLoading,
        isError: chainError,
      };
    });
  }, [
    ethMainnet, ethBase, ethArbitrum, ethSepolia,
    usdcMainnet, usdcBase, usdcArbitrum, usdcSepolia,
    ethPrice,
  ]);

  // Calculate totals from chainBalances (using reduce to avoid reassignment)
  const totalUsdValue = chainBalances.reduce((sum, chain) => sum + chain.totalUsdValue, 0);

  const totalEthBalance = chainBalances.reduce((sum, chain) => {
    const ethToken = chain.tokens.find((t) => t.symbol === "ETH");
    return sum + (ethToken ? parseFloat(ethToken.formatted) : 0);
  }, 0);

  const totalUsdcBalance = chainBalances.reduce((sum, chain) => {
    const usdcToken = chain.tokens.find((t) => t.symbol === "USDC");
    return sum + (usdcToken ? parseFloat(usdcToken.formatted) : 0);
  }, 0);

  return {
    chainBalances,
    totalUsdValue,
    totalEthBalance,
    totalUsdcBalance,
    isLoading,
    isError,
  };
}
