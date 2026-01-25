# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Setup

Requires `.env.local` with Para API key:
```bash
NEXT_PUBLIC_PARA_API_KEY=beta_YOUR_API_KEY_HERE
```

Get a BETA key from https://developer.getpara.com

## Testing with BETA Para SDK

- Email: `*@test.getpara.com` (e.g., `dev@test.getpara.com`)
- Phone: `(xxx)-555-xxxx` (e.g., `(425)-555-1234`)
- Any OTP code works (e.g., `123456`)

## Para SDK Documentation

Full Para documentation is available in `llm.txt` (1.2MB). Key reference:

### Para Architecture
- **MPC (Multi-Party Computation)**: 2-of-2 key system - User Share + Cloud Share
- **Passkey**: Separate key using hardware secure enclaves for biometric auth
- **DKG (Distributed Key Generation)**: Private key never assembled in single location
- Sessions default to 90 minutes

### Key Para Hooks (@getpara/react-sdk)
| Hook | Purpose |
|------|---------|
| `useAccount` | Get wallet connection status, address, embedded wallets |
| `useModal` | Control Para authentication modal (`openModal()`, `closeModal()`) |
| `useParaClient` | Access Para client instance directly |

### Wagmi Integration
Para automatically creates and manages the Wagmi provider internally when `externalWalletConfig.evmConnector` is configured. All wagmi hooks work seamlessly:
- `useSendTransaction` - Send native token (ETH)
- `useWriteContract` - Call contract functions (ERC20 transfers)
- `useWaitForTransactionReceipt` - Track tx confirmation
- `useBalance` - Get token balances
- `useSwitchChain` - Switch networks

### Supported Auth Methods
OAuth: Google, Twitter/X, Discord, Apple, Facebook
Also: Email, Phone (with OTP)

### Supported Chains
EVM-compatible chains, Cosmos ecosystem, Solana (via separate connectors)

## Architecture Overview

This is a Next.js 16 crypto wallet app using the Para SDK for MPC wallet management with multi-chain EVM support.

### Provider Stack (`app/providers.tsx`)

```
QueryClientProvider (React Query)
  └── ParaProvider (@getpara/react-sdk)
        ├── MPC wallet authentication (OAuth, Email, Phone)
        ├── wagmi integration for EVM chains
        └── Chains: Ethereum, Base, Arbitrum, Sepolia
```

Para SDK handles all transaction signing via MPC - no private keys are exposed. The app uses wagmi hooks which Para intercepts for MPC signing.

### Transaction Flow

1. User authenticates via Para modal → MPC wallet created
2. App gets wallet address from `useAccount` hook (via Para's embedded wallets)
3. Transactions sent via wagmi hooks → Para handles MPC signing
4. Pending txs stored in localStorage keyed by wallet address
5. `useTransactionHistory` polls blockchain explorers every 15 seconds
6. When tx appears in explorer, moves from pending → confirmed
7. After 1 hour, confirmed txs removed from localStorage (indexed by explorer)

### Shared Hooks (`app/hooks/`)

| Hook | Purpose |
|------|---------|
| `useEvmWallet` | Extract EVM wallet from Para account (address, isConnected) |
| `useEthPrice` | Single source for ETH/USD price (CoinGecko, 30s refresh) |
| `useTransactionHistory` | Multi-chain tx history with localStorage persistence |

### Key Patterns

**Getting the EVM wallet address (use shared hook):**
```tsx
import { useEvmWallet } from "./hooks/useEvmWallet";
const { address, isConnected } = useEvmWallet();
```

**Transaction history persistence:**
- `para_pending_transactions_{address}` - localStorage key for pending txs
- `para_confirmed_transactions_{address}` - localStorage key for confirmed txs (temp cache)
- Custom event `pendingTransactionAdded` triggers immediate refresh

### Supported Chains

| Chain | Explorer API |
|-------|-------------|
| Ethereum | api.etherscan.io |
| Sepolia | api-sepolia.etherscan.io |
| Base | api.basescan.org |
| Arbitrum | api.arbiscan.io |

### Styling

Tax Heaven 3000 anime aesthetic using Tailwind v4:
- Primary: `#d4145a` (magenta pink)
- Accent: `#ff69b4` (hot pink)
- Font: Fredoka
- Key CSS classes: `.anime-card`, `.anime-button`, `.anime-title`
