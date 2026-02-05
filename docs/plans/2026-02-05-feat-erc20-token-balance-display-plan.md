---
title: "feat: Add ERC-20 Token Balance Display"
type: feat
date: 2026-02-05
tokens: [USDC]
---

# feat: Add ERC-20 Token Balance Display

## Overview

Add USDC balance display to the wallet, completing the broken UX where users can send USDC but cannot see their USDC balance. Uses wagmi's `useBalance` hook with token addresses, displays alongside ETH in BalanceCard with per-chain breakdown.

## Problem Statement / Motivation

**Current state:** The app can send USDC (contract addresses exist in `SendForm.tsx:21-26`), but users cannot see their USDC balance. They're essentially sending tokens blind.

**User impact:**
- Users must check external block explorers to know their USDC balance
- No way to verify USDC was received
- Incomplete portfolio view

## Proposed Solution

Extend the existing balance display to include USDC:

1. **Create shared token configuration** - Extract USDC addresses from SendForm to shared config
2. **Add USDC balance fetching** - Use `useBalance` with `token` parameter (same pattern as ETH)
3. **Hardcode USDC price** - Stablecoin at $1.00 (no additional API calls)
4. **Update BalanceCard UI** - Show combined USD total, with ETH + USDC in breakdown

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token scope | USDC only | Matches SendForm capability, minimal RPC calls (+4) |
| Breakdown structure | Per-chain | Matches existing ETH pattern |
| Zero balances | Hidden | Cleaner UI, less clutter |
| USDC price | Hardcoded $1.00 | Stablecoin, avoids API rate limits |

## Technical Approach

### Architecture

```
app/
├── config/
│   └── tokens.ts           # NEW: Shared token configuration
├── hooks/
│   ├── useEthPrice.ts      # Existing (unchanged)
│   └── useTokenBalances.ts # NEW: Multi-token balance aggregation
└── components/
    ├── BalanceCard.tsx     # MODIFY: Use new hook, update UI
    └── SendForm.tsx        # MODIFY: Import from shared config
```

### Data Flow

```
useTokenBalances hook
  ├── useBalance (ETH, mainnet)
  ├── useBalance (ETH, base)
  ├── useBalance (ETH, arbitrum)
  ├── useBalance (ETH, sepolia)
  ├── useBalance (USDC, mainnet, token: 0xA0b8...)
  ├── useBalance (USDC, base, token: 0x8335...)
  ├── useBalance (USDC, arbitrum, token: 0xaf88...)
  └── useBalance (USDC, sepolia, token: 0x94a9...)

  → useMemo aggregates by chain
  → Returns: { chainBalances, totalUsdValue, isLoading }
```

### Key Implementation Details

#### 1. Token Configuration (`app/config/tokens.ts`)

```typescript
import { mainnet, base, arbitrum, sepolia } from "wagmi/chains";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  usdPrice: number | "fetch"; // "fetch" for non-stablecoins
  addresses: Partial<Record<number, `0x${string}`>>;
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    isNative: true,
    usdPrice: "fetch",
    addresses: {}, // Native token, no contract address
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isNative: false,
    usdPrice: 1.0, // Stablecoin hardcoded
    addresses: {
      [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      [sepolia.id]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
  },
];

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, sepolia];
```

#### 2. Balance Hook (`app/hooks/useTokenBalances.ts`)

```typescript
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

export function useTokenBalances(walletAddress: `0x${string}` | undefined) {
  const { ethPrice } = useEthPrice();

  // 4 ETH balance calls (existing pattern)
  const ethMainnet = useBalance({ address: walletAddress, chainId: mainnet.id, ... });
  // ... 3 more ETH calls

  // 4 USDC balance calls (new)
  const usdcMainnet = useBalance({
    address: walletAddress,
    token: SUPPORTED_TOKENS[1].addresses[mainnet.id],
    chainId: mainnet.id,
    query: { enabled: !!walletAddress }
  });
  // ... 3 more USDC calls

  return useMemo(() => {
    // Aggregate by chain, filter zero balances
  }, [ethPrice, ...balances]);
}
```

#### 3. BalanceCard UI Updates

**Main display (unchanged structure):**
```
$5,234.56          <- Total USD (ETH + USDC combined)
4.2 ETH            <- Primary token (ETH always shown)
```

**Expanded breakdown (per-chain, multi-token):**
```
▼ Ethereum
  ETH    0.5000   $1,234.56
  USDC   500.00   $500.00
▼ Base
  ETH    0.1000   $246.91
  USDC   100.00   $100.00
```

## Acceptance Criteria

### Functional Requirements

- [ ] USDC balances fetched for all 4 chains using wagmi `useBalance` with token parameter
- [ ] Total USD value includes both ETH and USDC
- [ ] Per-chain breakdown shows ETH and USDC (if balance > 0)
- [ ] Zero-balance tokens are hidden from display
- [ ] USDC valued at $1.00 (no price API call)

### Non-Functional Requirements

- [ ] No additional price API calls (USDC hardcoded)
- [ ] Maximum 8 total balance calls (4 ETH + 4 USDC)
- [ ] Loading states work correctly for partial data
- [ ] Matches existing anime aesthetic

### Edge Cases

- [ ] User has ETH only (no USDC) → Shows ETH only in breakdown
- [ ] User has USDC only (no ETH) → Shows USDC only, $0 ETH hidden
- [ ] User has mixed holdings across chains → Correct per-chain display
- [ ] RPC error for one chain → Other chains still display correctly
- [ ] New wallet with zero balance → Shows $0.00, empty breakdown

## Success Metrics

- Users can see USDC balance without leaving the app
- Portfolio total accurately reflects ETH + USDC holdings
- No increase in CoinGecko API calls

## Dependencies & Risks

**Dependencies:**
- wagmi's `useBalance` hook supports `token` parameter (confirmed in wagmi 2.x)
- USDC contracts are active on all 4 chains (verified addresses exist)

**Risks:**
| Risk | Mitigation |
|------|------------|
| RPC rate limits with +4 calls | wagmi's built-in caching and deduplication |
| USDC contract address changes | Use well-known canonical addresses |
| Testnet USDC availability | Sepolia USDC contract verified in SendForm |

## Implementation Checklist

### Phase 1: Data Layer

- [x] Create `app/config/tokens.ts` with token configuration
- [x] Update `SendForm.tsx` to import USDC addresses from shared config
- [x] Create `app/hooks/useTokenBalances.ts` hook
- [x] Add USDC balance fetching (4 chains)
- [x] Implement aggregation logic with zero-balance filtering

### Phase 2: UI Updates

- [x] Update `BalanceCard.tsx` to use `useTokenBalances` hook
- [x] Modify main display to show combined USD total
- [x] Update breakdown to show multiple tokens per chain
- [x] Ensure loading skeletons work for multi-token state
- [x] Match existing styling (text sizes, colors, spacing)

### Phase 3: Polish

- [ ] Test with Para SDK test credentials
- [ ] Verify on all 4 chains
- [ ] Test edge cases (zero balance, mixed holdings, RPC errors)
- [ ] Verify no console errors or warnings

## References & Research

### Internal References

- Existing ETH balance pattern: `app/components/BalanceCard.tsx:24-46`
- USDC contract addresses: `app/components/SendForm.tsx:21-26`
- Price hook pattern: `app/hooks/useEthPrice.ts:1-47`
- Chain configuration: `app/providers.tsx:6-32`

### External References

- wagmi useBalance docs: https://wagmi.sh/react/api/hooks/useBalance
- USDC contract (Ethereum): https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

### Files to Modify

| File | Action |
|------|--------|
| `app/config/tokens.ts` | CREATE - Shared token configuration |
| `app/hooks/useTokenBalances.ts` | CREATE - Multi-token balance hook |
| `app/components/BalanceCard.tsx` | MODIFY - Use new hook, update UI |
| `app/components/SendForm.tsx` | MODIFY - Import from shared config |
