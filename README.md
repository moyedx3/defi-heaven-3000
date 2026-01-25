# DeFi Heaven 3000 💖

A beautiful anime-styled crypto wallet built with Next.js and Para SDK, inspired by visual novel aesthetics.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Para SDK](https://img.shields.io/badge/Para%20SDK-2.6.0-ff69b4)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

---

## ✨ Current Features (Phase 1)

- **Multi-chain Support**: Ethereum, Sepolia, Base, Arbitrum
- **Portfolio View**: Aggregated balance across all chains with breakdown toggle
- **Send Crypto**: ETH and USDC with real-time USD conversion
- **Receive**: QR code generation for easy deposits
- **Transaction History**: Real-time status tracking with explorer links
- **MPC Wallet**: Secure embedded wallet via Para SDK
- **OAuth Login**: Google, Twitter, Discord, Apple + Email/Phone
- **Compact UI**: 70vh wallet container with inline tab navigation

---

## 🗺️ Roadmap

### Phase 1: Core Wallet (Completed)
- [x] Para SDK integration with MPC wallet
- [x] Multi-chain balance display
- [x] Send ETH/USDC transactions
- [x] Receive with QR code
- [x] Transaction history with status
- [x] Visual novel themed UI

### Phase 2: Swap (Planned)
- [ ] 0x or 1inch API integration
- [ ] Token swap interface
- [ ] Best route finding across DEXs
- [ ] Slippage settings

### Phase 3: DeFi / Lending (Planned)
- [ ] Aave v3 integration ([Para Aave Walkthrough](https://docs.getpara.com/v2/walkthroughs/aave))
- [ ] Supply/deposit assets
- [ ] Borrow against collateral
- [ ] APY display

### Phase 4: Advanced Features (Future)
- [ ] Token portfolio tracking
- [ ] Price alerts
- [ ] NFT display
- [ ] Cross-chain bridging

---

## 🏗️ Project Architecture

```
my-para-app/
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Main page with tab routing
│   ├── providers.tsx           # Para SDK + wagmi setup
│   ├── globals.css             # Anime theme & animations
│   │
│   ├── components/
│   │   ├── AnimeBackground.tsx # Animated background
│   │   ├── HomeView.tsx        # Balance + Send view
│   │   ├── ReceiveView.tsx     # QR code view
│   │   ├── HistoryView.tsx     # Transaction history
│   │   ├── BalanceCard.tsx     # Multi-chain balance
│   │   ├── SendForm.tsx        # Token transfer form
│   │   ├── ReceiveCard.tsx     # Address + QR display
│   │   ├── TransactionList.tsx # Transaction list
│   │   └── BottomNav.tsx       # ViewType export
│   │
│   └── hooks/
│       ├── useTransactionHistory.ts  # Tx state management
│       ├── useEvmWallet.ts           # Shared wallet hook
│       └── useEthPrice.ts            # ETH price from CoinGecko
│
├── public/
│   ├── char-main.png           # Main character
│   ├── char-1.png              # Character variant
│   └── char-2.png              # Character variant
│
└── .env.local                  # API keys (not in repo)
```

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Wallet SDK | Para SDK 2.6.0 |
| EVM Library | wagmi + viem |
| State | React Query (TanStack) |

---

## 🔐 Para SDK Integration

### What is Para?

[Para](https://getpara.com) provides MPC (Multi-Party Computation) wallets - secure embedded wallets without users managing private keys.

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useAccount` | Wallet connection status & embedded wallet data |
| `useModal` | Open/close Para auth modal |
| `useBalance` | Native token balance per chain |
| `useSendTransaction` | Send ETH transactions |
| `useWriteContract` | ERC20 token transactions |
| `useSwitchChain` | Network switching |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useEvmWallet` | Extract EVM wallet from Para account |
| `useEthPrice` | Shared ETH price (30s refresh) |
| `useTransactionHistory` | Tx history with pending state |

---

## 🚀 Getting Started

### 1. Get Para API Key

Sign up at [Para Developer Portal](https://developer.getpara.com)

### 2. Environment Setup

```bash
cp .env.example .env.local
# Add your NEXT_PUBLIC_PARA_API_KEY
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing (BETA)

| Type | Format | Example |
|------|--------|---------|
| Email | `*@test.getpara.com` | `dev@test.getpara.com` |
| Phone | `(xxx)-555-xxxx` | `(425)-555-1234` |

Any OTP code works (e.g., `123456`)

---

## 🎨 Design System

### Visual Novel Aesthetic

- **Font**: Fredoka (rounded, friendly)
- **Primary**: `#d4145a` (magenta)
- **Accent**: `#ff69b4` (hot pink)
- **Container**: 70vh wallet with tab navigation

### Key CSS Classes

```css
.wallet-container  /* Main 70vh container */
.tab-nav           /* Inline tab navigation */
.anime-card        /* Pink gradient cards */
.anime-button      /* 3D effect buttons */
.anime-title-glow  /* Glowing text */
```

---

## 🔗 Resources

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/v2/react)
- [Para Aave Integration](https://docs.getpara.com/v2/walkthroughs/aave)
- [wagmi Documentation](https://wagmi.sh)

---

## 📄 License

MIT
