import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  usdPrice: number | "fetch"; // "fetch" means use price API, number means hardcoded (for stablecoins)
  addresses: Partial<Record<number, `0x${string}`>>;
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    isNative: true,
    usdPrice: "fetch",
    addresses: {}, // Native token, no contract address needed
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isNative: false,
    usdPrice: 1.0, // Stablecoin - hardcoded at $1
    addresses: {
      [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      [sepolia.id]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
  },
];

export const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: "Ethereum" },
  { id: base.id, name: "Base" },
  { id: arbitrum.id, name: "Arbitrum" },
  { id: sepolia.id, name: "Sepolia" },
];

// Helper to get token by symbol
export function getToken(symbol: string): TokenConfig | undefined {
  return SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
}

// Helper to get USDC address for a chain
export function getUsdcAddress(chainId: number): `0x${string}` | undefined {
  const usdc = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
  return usdc?.addresses[chainId];
}
