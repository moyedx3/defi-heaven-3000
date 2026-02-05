---
title: "ERC-20 Token Balance Display"
category: ui-bugs
tags: [wagmi, useBalance, ERC-20, USDC, multi-chain, stablecoin]
module: wallet
symptoms:
  - Users can send USDC but cannot see their USDC balance
  - Portfolio shows only ETH value, not total holdings
  - No way to verify token transfers were received
date_solved: 2026-02-05
severity: critical
---

# ERC-20 Token Balance Display

## Problem

Users could send USDC tokens via the SendForm component but had no way to view their USDC balance in the wallet. This created a broken UX where users were essentially sending tokens blind - they had to check external block explorers to know their balance.

**Symptoms:**
- BalanceCard only displayed ETH balances
- USDC contract addresses existed in SendForm but weren't used for balance display
- Portfolio total was incomplete (missing USDC holdings)
- No way to verify incoming USDC transfers

## Root Cause

The original implementation focused solely on native ETH balances. While USDC sending capability was added via `useWriteContract` and ERC-20 ABI calls, the corresponding balance display was never implemented. The USDC contract addresses were hardcoded locally in SendForm.tsx without a shared configuration.

## Solution

### 1. Create Shared Token Configuration

Extract token addresses and metadata into a centralized config file:

```typescript
// app/config/tokens.ts
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  usdPrice: number | "fetch";
  addresses: Partial<Record<number, `0x${string}`>>;
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    isNative: true,
    usdPrice: "fetch",
    addresses: {},
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isNative: false,
    usdPrice: 1.0, // Stablecoin - hardcoded at $1
    addresses: {
      [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      [sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Official Circle USDC
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
```

### 2. Create Multi-Token Balance Hook

Use wagmi's `useBalance` hook with the `token` parameter to fetch ERC-20 balances:

```typescript
// app/hooks/useTokenBalances.ts
const BALANCE_STALE_TIME = 30_000; // 30 seconds

export function useTokenBalances(walletAddress: `0x${string}` | undefined) {
  const { ethPrice } = useEthPrice();

  // Get USDC config with proper null check
  const usdcConfig = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
  if (!usdcConfig) {
    throw new Error("USDC token configuration not found - check config/tokens.ts");
  }

  // ETH balances (4 calls)
  const ethMainnet = useBalance({
    address: walletAddress,
    chainId: mainnet.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  // ... 3 more ETH calls

  // USDC balances (4 calls) - note the `token` parameter
  const usdcMainnet = useBalance({
    address: walletAddress,
    token: usdcConfig.addresses[mainnet.id],
    chainId: mainnet.id,
    query: { enabled: !!walletAddress, staleTime: BALANCE_STALE_TIME },
  });
  // ... 3 more USDC calls

  // Aggregate by chain, filter zero balances
  const chainBalances = useMemo(() => {
    // ... aggregation logic
  }, [ethMainnet, ethBase, ethArbitrum, ethSepolia,
      usdcMainnet, usdcBase, usdcArbitrum, usdcSepolia, ethPrice]);

  return { chainBalances, totalUsdValue, totalEthBalance, totalUsdcBalance, isLoading, isError };
}
```

### 3. Update BalanceCard UI

Display combined ETH + USDC totals with per-chain breakdown:

```typescript
// app/components/BalanceCard.tsx
const { chainBalances, totalUsdValue, totalEthBalance, totalUsdcBalance } = useTokenBalances(walletAddress);

// Main display shows combined USD total
<span className="text-xl font-bold">{formattedTotalUsd}</span>
<span className="text-xs text-white/70">
  {totalEthBalance > 0 && `${totalEthBalance.toFixed(4)} ETH`}
  {totalEthBalance > 0 && totalUsdcBalance > 0 && " + "}
  {totalUsdcBalance > 0 && `${totalUsdcBalance.toFixed(2)} USDC`}
</span>

// Expandable per-chain breakdown
{chainsWithBalance.map((chain) => (
  <div key={chain.chainId}>
    <div>{chain.chainName}</div>
    {chain.tokens.map((token) => (
      <div key={`${chain.chainId}-${token.symbol}`}>
        <span>{token.symbol}</span>
        <span>{token.formatted} (${token.usdValue.toFixed(2)})</span>
      </div>
    ))}
  </div>
))}
```

## Key Implementation Details

### wagmi useBalance with token parameter

The key insight is that wagmi's `useBalance` hook accepts a `token` parameter for ERC-20 balances:

```typescript
// Native ETH balance
useBalance({ address, chainId: mainnet.id })

// ERC-20 token balance (e.g., USDC)
useBalance({ address, token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", chainId: mainnet.id })
```

### staleTime for caching

Add `staleTime` to prevent excessive RPC calls:

```typescript
query: { enabled: !!walletAddress, staleTime: 30_000 }
```

### Official Circle USDC addresses

Always use official Circle USDC addresses, especially on testnets:

| Chain | Address |
|-------|---------|
| Ethereum Mainnet | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Sepolia Testnet | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Arbitrum | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |

### Stablecoin pricing

For stablecoins like USDC, hardcode the price at $1.00 instead of making additional API calls:

```typescript
usdPrice: 1.0, // Stablecoin - no price API needed
```

## Gotchas & Lessons Learned

1. **Use official token addresses** - Testnet token addresses vary. Always verify you're using the official Circle USDC address, not community/faucet tokens.

2. **Null check token config lookups** - When using `.find()` to get token config, always add a null check with descriptive error:
   ```typescript
   const usdcConfig = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
   if (!usdcConfig) {
     throw new Error("USDC token configuration not found");
   }
   ```

3. **React hooks immutability** - Don't use `let` with reassignment inside `useMemo`. Use `reduce()` or compute values outside the memo.

4. **Centralize token configuration** - Don't duplicate token addresses across components. Create a shared config file.

5. **Include error state** - Track RPC errors with `isError` state so the UI can show appropriate feedback.

## Prevention Checklist

When adding new token support:

- [ ] Use official contract addresses (verify on Etherscan/official docs)
- [ ] Add token to shared config, not individual components
- [ ] Include proper null checks for config lookups
- [ ] Add `staleTime` to balance queries
- [ ] For stablecoins, hardcode price instead of API calls
- [ ] Update both balance display AND send functionality
- [ ] Test on all supported chains including testnets

## Related Files

- `app/config/tokens.ts` - Shared token configuration
- `app/hooks/useTokenBalances.ts` - Multi-token balance aggregation hook
- `app/components/BalanceCard.tsx` - Balance display UI
- `app/components/SendForm.tsx` - Token send functionality
- `docs/plans/2026-02-05-feat-erc20-token-balance-display-plan.md` - Original plan

## References

- [wagmi useBalance documentation](https://wagmi.sh/react/api/hooks/useBalance)
- [Circle USDC contract addresses](https://developers.circle.com/stablecoins/docs/usdc-on-main-networks)
- PR #1: feat(wallet): Add USDC balance display
