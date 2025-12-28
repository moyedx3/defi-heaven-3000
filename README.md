# Para Wallet App 💖

A beautiful anime-styled crypto wallet built with Next.js and Para SDK, featuring a Tax Heaven 3000-inspired design.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Para SDK](https://img.shields.io/badge/Para%20SDK-React-ff69b4)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **Multi-chain Support**: Ethereum Mainnet, Sepolia, Arbitrum, Base
- **Send Crypto**: ETH and USDC with real-time USD conversion
- **Receive**: QR code generation for easy deposits
- **Transaction History**: Real-time status tracking with blockchain explorer links
- **MPC Wallet**: Secure embedded wallet via Para SDK
- **OAuth Login**: Google, Twitter, Discord, Apple + Email/Phone

---

## 🏗️ Project Architecture

```
my-para-app/
├── app/
│   ├── layout.tsx              # Root layout with font loading
│   ├── page.tsx                # Main page with view routing
│   ├── providers.tsx           # Para SDK + React Query setup
│   ├── globals.css             # Anime-style theme & animations
│   │
│   ├── components/
│   │   ├── AnimeBackground.tsx # Animated background with characters
│   │   ├── HomeView.tsx        # Balance + Send form view
│   │   ├── ReceiveView.tsx     # QR code receive view
│   │   ├── HistoryView.tsx     # Transaction history view
│   │   ├── BalanceCard.tsx     # Multi-chain balance display
│   │   ├── SendForm.tsx        # Token transfer form
│   │   ├── ReceiveCard.tsx     # Address + QR display
│   │   ├── TransactionList.tsx # Transaction list with status
│   │   └── BottomNav.tsx       # Tab navigation
│   │
│   └── hooks/
│       └── useTransactionHistory.ts  # Transaction state management
│
├── public/
│   ├── char-main.png           # Main anime character
│   ├── char-1.png              # Character variant 1
│   └── char-2.png              # Character variant 2
│
└── .env.local                  # API keys (not in repo)
```

---

## 🔐 Para SDK Integration

### What is Para?

[Para](https://getpara.com) provides MPC (Multi-Party Computation) wallets that enable secure, embedded wallet experiences without users managing private keys.

### Setup in `providers.tsx`

```tsx
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

<ParaProvider
  paraClientConfig={{
    apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY || "",
  }}
  config={{
    appName: "Para Wallet",
  }}
  externalWalletConfig={{
    evmConnector: {
      config: {
        chains: [mainnet, base, arbitrum, sepolia],
        transports: {
          [mainnet.id]: http(),
          [base.id]: http(),
          [arbitrum.id]: http(),
          [sepolia.id]: http(),
        },
      },
    },
  }}
  paraModalConfig={{
    logo: "/char-main.png",
    theme: {
      foregroundColor: "#d4145a",
      backgroundColor: "#ffe4ec",
      accentColor: "#ff69b4",
      mode: "light",
      // ... custom palette
    },
    oAuthMethods: ["GOOGLE", "TWITTER", "DISCORD", "APPLE"],
  }}
>
  {children}
</ParaProvider>
```

### Key Para Hooks Used

| Hook | Purpose |
|------|---------|
| `useAccount` | Get wallet connection status & address |
| `useModal` | Open/close Para authentication modal |
| `useBalance` | Fetch native token balance per chain |
| `useSendTransaction` | Send ETH transactions |
| `useWriteContract` | Send ERC20 token transactions |
| `useWaitForTransactionReceipt` | Track transaction confirmation |
| `useSwitchChain` | Switch between networks |

### Authentication Flow

1. User clicks "Connect Wallet"
2. `openModal()` opens Para's auth modal
3. User authenticates via OAuth or Email/Phone
4. Para creates MPC wallet automatically
5. App receives wallet address via `useAccount`

### Transaction Signing

Para handles all transaction signing via MPC - no private keys are ever exposed:

```tsx
import { useSendTransaction } from "wagmi";

const { sendTransaction } = useSendTransaction();

// Para SDK intercepts this and handles MPC signing
sendTransaction({
  to: recipientAddress,
  value: parseEther(amount),
});
```

---

## 🚀 Getting Started

### 1. Get Para API Key

Sign up at [Para Developer Portal](https://developer.getpara.com) and get a BETA API key.

### 2. Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_PARA_API_KEY=beta_YOUR_API_KEY_HERE
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing (BETA Environment)

Use these test credentials with BETA API keys:

| Type | Format | Example |
|------|--------|---------|
| Email | `*@test.getpara.com` | `dev@test.getpara.com` |
| Phone | `(xxx)-555-xxxx` | `(425)-555-1234` |

**Any OTP code works** (e.g., `123456`)

> ⚠️ BETA accounts limited to 50 users. Delete via Developer Portal if needed.

---

## 🎨 Design System

### Tax Heaven 3000 Aesthetic

- **Font**: Fredoka (rounded, friendly)
- **Primary**: `#d4145a` (magenta pink)
- **Accent**: `#ff69b4` (hot pink)
- **Background**: Soft pink gradient with character pattern

### CSS Classes

```css
.anime-card    /* Pink gradient cards with white border */
.anime-button  /* 3D effect buttons with hover animation */
.anime-title   /* Pink text with white outline */
```

---

## 📁 Key Files Explained

### `app/providers.tsx`
Wraps the app with Para SDK provider, React Query, and wagmi config for multi-chain support.

### `app/hooks/useTransactionHistory.ts`
Manages transaction state with:
- Fetching from blockchain explorers (Etherscan, Basescan, Arbiscan)
- Local storage for pending transactions
- Real-time status updates

### `app/components/SendForm.tsx`
Full-featured send form with:
- Network/token selection
- USD ↔ ETH conversion
- Address validation
- Transaction status feedback

---

## 🔗 Resources

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/v2/react)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)

---

## 📄 License

MIT
