"use client";

import { useBalance } from "wagmi";
import { useMemo } from "react";
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";
import { useEthPrice } from "./useEthPrice";
import { SUPPORTED_TOKENS } from "../config/tokens";

export interface TokenBalance {
  symbol: string;
  balance: bigint;
  formatted: string;
  usdValue: number;
  isLoading: boolean;
}

export interface ChainTokenBalances {
  chainId: number;
  chainName: string;
  tokens: TokenBalance[];
  totalUsdValue: number;
  isLoading: boolean;
}

interface UseTokenBalancesResult {
  chainBalances: ChainTokenBalances[];
  totalUsdValue: number;
  totalEthBalance: number;
  totalUsdcBalance: number;
  isLoading: boolean;
}

const CHAIN_INFO = [
  { chain: mainnet, name: "Ethereum" },
  { chain: base, name: "Base" },
  { chain: arbitrum, name: "Arbitrum" },
  { chain: sepolia, name: "Sepolia" },
] as const;

export function useTokenBalances(walletAddress: `0x${string}` | undefined): UseTokenBalancesResult {
  const { ethPrice } = useEthPrice();
  const usdcConfig = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC")!;
  const usdcPrice = typeof usdcConfig.usdPrice === "number" ? usdcConfig.usdPrice : 1.0;

  // ETH balances (4 calls)
  const ethMainnet = useBalance({
    address: walletAddress,
    chainId: mainnet.id,
    query: { enabled: !!walletAddress },
  });
  const ethBase = useBalance({
    address: walletAddress,
    chainId: base.id,
    query: { enabled: !!walletAddress },
  });
  const ethArbitrum = useBalance({
    address: walletAddress,
    chainId: arbitrum.id,
    query: { enabled: !!walletAddress },
  });
  const ethSepolia = useBalance({
    address: walletAddress,
    chainId: sepolia.id,
    query: { enabled: !!walletAddress },
  });

  // USDC balances (4 calls)
  const usdcMainnet = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[mainnet.id],
    chainId: mainnet.id,
    query: { enabled: !!walletAddress },
  });
  const usdcBase = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[base.id],
    chainId: base.id,
    query: { enabled: !!walletAddress },
  });
  const usdcArbitrum = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[arbitrum.id],
    chainId: arbitrum.id,
    query: { enabled: !!walletAddress },
  });
  const usdcSepolia = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[sepolia.id],
    chainId: sepolia.id,
    query: { enabled: !!walletAddress },
  });

  // Derive loading state directly from queries
  const isLoading =
    ethMainnet.isLoading ||
    ethBase.isLoading ||
    ethArbitrum.isLoading ||
    ethSepolia.isLoading ||
    usdcMainnet.isLoading ||
    usdcBase.isLoading ||
    usdcArbitrum.isLoading ||
    usdcSepolia.isLoading;

  const ethBalances = [ethMainnet, ethBase, ethArbitrum, ethSepolia];
  const usdcBalances = [usdcMainnet, usdcBase, usdcArbitrum, usdcSepolia];

  const chainBalances: ChainTokenBalances[] = useMemo(() => {
    return CHAIN_INFO.map(({ chain, name }, index) => {
      const ethQuery = ethBalances[index];
      const usdcQuery = usdcBalances[index];
      const tokens: TokenBalance[] = [];
      const chainLoading = ethQuery.isLoading || usdcQuery.isLoading;

      // Process ETH balance
      if (ethQuery.data) {
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
      if (usdcQuery.data) {
        const usdcValue = parseFloat(usdcQuery.data.formatted);
        const usdcUsdValue = usdcValue * usdcPrice;

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

      const totalUsdValue = tokens.reduce((sum, t) => sum + t.usdValue, 0);

      return {
        chainId: chain.id,
        chainName: name,
        tokens,
        totalUsdValue,
        isLoading: chainLoading,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ethMainnet.data,
    ethMainnet.isLoading,
    ethBase.data,
    ethBase.isLoading,
    ethArbitrum.data,
    ethArbitrum.isLoading,
    ethSepolia.data,
    ethSepolia.isLoading,
    usdcMainnet.data,
    usdcMainnet.isLoading,
    usdcBase.data,
    usdcBase.isLoading,
    usdcArbitrum.data,
    usdcArbitrum.isLoading,
    usdcSepolia.data,
    usdcSepolia.isLoading,
    ethPrice,
    usdcPrice,
  ]);

  // Calculate totals from chainBalances
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
  };
}
