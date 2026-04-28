# ⚡ QuickPay — Stellar Micro-Payment dApp

A clean, minimal, and fully functional **Stellar-based micro-payment application** that lets users send XLM instantly using their [Freighter](https://freighter.app) wallet. Built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, QuickPay is a production-ready frontend for the Stellar Testnet.

---

## 📸 Overview

QuickPay is a single-page dApp (decentralized application) that provides:

- 🔗 **Wallet Connection** via Freighter browser extension
- 💰 **Live XLM Balance** fetched directly from Stellar Horizon
- 📤 **XLM Payments** — build, sign, and submit transactions on-chain
- 🔍 **Transaction Explorer** — view confirmed transactions on `stellar.expert`
- 🎨 **Premium Dark UI** — black background, violet/fuchsia gradients, Geist typography

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Fonts | [Geist Sans + Geist Mono](https://vercel.com/font) |
| Blockchain SDK | [@stellar/stellar-sdk v15](https://github.com/stellar/js-stellar-sdk) |
| Wallet API | [@stellar/freighter-api v6](https://docs.freighter.app/) |
| Network | Stellar **Testnet** |
| Linting | ESLint 9 + eslint-config-next |

---

## 📁 Project Structure

```
stellar-quicktip/
├── public/                        # Static assets (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── favicon.ico            # App favicon
│   │   ├── globals.css            # Global styles, CSS variables, scrollbar, animations
│   │   ├── layout.tsx             # Root layout — fonts, metadata, FreighterProvider wrapper
│   │   └── page.tsx               # Home page — orchestrates all UI sections
│   │
│   ├── components/
│   │   ├── Header.tsx             # App header: logo, wallet connect/disconnect/switch
│   │   ├── BalanceSection.tsx     # Live XLM balance card with loading + error states
│   │   ├── SendPayment.tsx        # Full payment form: inputs, quick amounts, tx feedback
│   │   └── Footer.tsx             # Footer with Stellar branding link
│   │
│   ├── context/
│   │   └── FreighterProvider.tsx  # React Context: wallet state, connect/disconnect/sign
│   │
│   ├── hooks/
│   │   └── useFreighter.ts        # Convenience hook re-exporting FreighterContext
│   │
│   └── lib/
│       ├── stellar.ts             # Network config, Horizon/RPC clients, address utils
│       └── transactions.ts        # Balance fetch, build tx, sign tx, submit tx, explorer URL
│
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── postcss.config.mjs             # PostCSS config (Tailwind v4)
├── eslint.config.mjs              # ESLint config
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

---

## ⚙️ Prerequisites

Before running this project, make sure you have:

1. **Node.js** v18 or higher — [Download](https://nodejs.org/)
2. **npm** (bundled with Node.js) or an alternative package manager
3. **Freighter Wallet** browser extension — [Install from freighter.app](https://freighter.app)
   - After installing, switch Freighter's network to **Testnet**
4. A **funded Stellar Testnet account** — use [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY) to fund it

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stellar-quicktip.git
cd stellar-quicktip
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build the production bundle |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🔌 Wallet Integration — Freighter

QuickPay uses the [Freighter browser extension](https://freighter.app) as its non-custodial wallet. All private keys remain in the user's browser — QuickPay never has access to them.

### How the Connection Flow Works

1. User clicks **"Connect Wallet"** in the header
2. The app calls `setAllowed()` from `@stellar/freighter-api` — this triggers the Freighter popup for account selection
3. On approval, the app reads the public key via `getAddress()` and the active network via `getNetwork()`
4. The session is persisted in `localStorage` (key: `wallet_connected`) so reconnection is seamless on page refresh
5. On window focus, `checkConnection()` runs again to detect if the user has revoked permissions in Freighter

### Disconnect Behavior

- Clicking **Disconnect** opens a confirmation modal
- On confirm: `localStorage` session is cleared and wallet state is reset
- The app never calls any Freighter revocation API — it simply forgets the session locally

### Switch Wallet

- Clicking **Switch** shows a step-by-step guide instructing the user to change accounts directly inside the Freighter extension
- The app automatically detects the new account on the next `checkConnection()` poll (triggered by window focus)

---

## 💸 Payment Flow — Step by Step

When a user submits a payment, the following happens in `SendPayment.tsx`:

```
1. Validate inputs
   ├── Recipient address must be a valid Stellar public key (G...)
   ├── Amount must be a positive number
   └── Amount must not exceed current balance

2. buildPaymentTransaction(sourceAddress, destinationAddress, amount)
   ├── Load source account sequence number from Horizon
   ├── Construct a TransactionBuilder with BASE_FEE and 180s timeout
   └── Add a single Payment operation (native XLM)

3. Serialize transaction to XDR
   └── transaction.toXDR()

4. Sign via Freighter
   └── sign(xdr) → calls signTransaction() from @stellar/freighter-api
       (Freighter popup appears — user approves or rejects)

5. Deserialize signed XDR
   └── TransactionBuilder.fromXDR(signedXdr, networkPassphrase)

6. submitTransaction(signedTransaction)
   └── horizon.submitTransaction() → returns { hash, ledger }

7. Show result
   ├── SUCCESS: Display tx hash with link to stellar.expert explorer
   └── ERROR: Parse Horizon result_codes for user-friendly messages
       (tx_bad_auth, op_underfunded, tx_too_late, etc.)
```

---

## 🌐 Network Configuration

The app is currently configured to run on the **Stellar Testnet**. Network settings are defined in `src/lib/stellar.ts`:

```typescript
export const config = {
  testnet: {
    horizonUrl:       "https://horizon-testnet.stellar.org",
    rpcUrl:           "https://soroban-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
    friendbotUrl:     "https://friendbot.stellar.org",
  },
  public: {
    horizonUrl:       "https://horizon.stellar.org",
    rpcUrl:           "",
    networkPassphrase: Networks.PUBLIC,
    friendbotUrl:     null,
  },
};

// Active network (change to "public" for mainnet)
const NETWORK: Network = "testnet";
```

> **⚠️ Warning:** To switch to Mainnet, change `NETWORK` to `"public"` **and** ensure your Freighter wallet is also set to the Public network. Sending real XLM on mainnet is irreversible.

---

## 🧩 Component Reference

### `Header.tsx`

**Purpose:** App-wide navigation bar.

**States:**
- **Not connected:** Shows a "Connect Wallet" button (violet gradient pill)
- **Connected:** Shows truncated wallet address (e.g., `GABCD...WXYZ`), a "Switch" link, and a "Disconnect" button

**Modals:**
- `Disconnect Confirmation` — prevents accidental disconnections
- `Switch Wallet Guide` — step-by-step instructions for changing Freighter accounts

---

### `BalanceSection.tsx`

**Purpose:** Displays the connected wallet's live XLM balance.

**Behavior:**
- Automatically fetches balance on wallet connect
- Shows a spinner while loading
- Displays the balance with up to 7 decimal places (e.g., `1,234.5600000 XLM`)
- Provides a "Try again" button on fetch errors
- Hides completely when wallet is disconnected

---

### `SendPayment.tsx`

**Purpose:** Core payment form.

**Fields:**
- `Recipient Address` — monospace text input for a Stellar public key
- `Amount (XLM)` — numeric input (step: `0.0000001`, min: `0`)
- `Quick Amount Buttons` — 1, 5, 10 XLM one-click presets

**Transaction Status States:**

| State | UI |
|---|---|
| `idle` | Default form, "Send XLM" button active |
| `loading` | Spinner animation, all inputs disabled |
| `success` | Green card with transaction hash + stellar.expert link |
| `error` | Red card with human-readable error message + dismiss button |

**After a successful send:**
- Form inputs are cleared
- Balance is automatically refreshed in both `SendPayment` and `BalanceSection`

---

### `Footer.tsx`

**Purpose:** Minimal footer with Stellar branding.

**Content:**
- "Built on Stellar Testnet" with the QuickPay lightning bolt icon
- External link to [stellar.org](https://stellar.org)

---

### `FreighterProvider.tsx`

**Purpose:** React Context that manages all wallet state globally.

**Exported Context Shape:**

```typescript
interface FreighterContextType {
  // State
  connected:    boolean;       // Is a wallet session active?
  address:      string | null; // Connected Stellar public key
  network:      string | null; // Active network name from Freighter
  isInstalling: boolean;       // True if Freighter extension is not installed

  // Actions
  connect:    () => Promise<string | undefined>;  // Open Freighter popup, save session
  disconnect: () => void;                         // Clear session, reset state
  sign:       (xdr: string) => Promise<string>;   // Sign a transaction XDR via Freighter
  refresh:    () => Promise<void>;                // Re-check connection status
}
```

**Session Persistence:**
- Uses `localStorage` key `wallet_connected` as a flag
- On page load, if the flag exists, the provider automatically re-verifies permissions with Freighter and restores the session
- On window focus events, the connection is re-verified to stay in sync with Freighter state changes

---

### `useFreighter.ts`

A thin hook that re-exports `useFreighterContext()` for cleaner imports across components:

```typescript
import { useFreighter } from "@/hooks/useFreighter";
const { connected, address, connect, sign } = useFreighter();
```

---

## 🛠️ Utility Functions

### `src/lib/stellar.ts`

| Function | Description |
|---|---|
| `isValidStellarAddress(address)` | Returns `true` if string is a valid Stellar public key (`G...`) |
| `shortenAddress(address)` | Shortens `GABCDE...WXYZ` to `GABCDE...WXYZ` (6 + 4 chars) |
| `formatXLM(amount)` | Formats a numeric string to localized decimal (2–7 decimal places) |

### `src/lib/transactions.ts`

| Function | Description |
|---|---|
| `getAccountBalance(publicKey)` | Fetches native XLM balance from Horizon; returns `"0"` for unfunded accounts |
| `buildPaymentTransaction(source, destination, amount)` | Builds an unsigned Stellar Payment transaction |
| `submitTransaction(signedTransaction)` | Submits a signed transaction to Horizon; returns `{ hash, ledger }` |
| `getTransactionExplorerUrl(hash)` | Returns a `stellar.expert` testnet link for a given tx hash |

---

## 🔒 Security Considerations

- **Non-custodial:** Private keys never leave the user's Freighter extension. QuickPay only handles public keys and signed transaction envelopes (XDR)
- **No backend:** All operations are client-side. There is no server, database, or API key storage
- **Testnet only:** By default the app runs on Testnet — no real funds are at risk
- **Input validation:** Recipient addresses are validated against the Stellar SDK keypair parser before any transaction is built
- **Balance check:** The form prevents sending more XLM than the current balance before even submitting to the network
- **Error handling:** Horizon `result_codes` are parsed and translated into human-readable error messages

---

## 🚀 Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your repository to GitHub
2. Import it into [Vercel](https://vercel.com/new)
3. Vercel auto-detects Next.js — no configuration needed
4. Click **Deploy**

### Build for Production Manually

```bash
npm run build
npm run start
```

The production build will be output to the `.next/` directory.

---

## 🧪 Testing on Testnet

To test the app end-to-end:

1. Install [Freighter](https://freighter.app) and create a wallet
2. Switch Freighter to **Testnet** in Settings → Network
3. Fund your testnet account using Friendbot:
   ```
   https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
   ```
4. Open the app at `http://localhost:3000`
5. Click **Connect Wallet** and approve in Freighter
6. Send XLM to any valid testnet address
7. Click the transaction hash link to view it on [stellar.expert](https://stellar.expert/explorer/testnet)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🔗 Useful Links

| Resource | URL |
|---|---|
| Stellar Documentation | https://developers.stellar.org |
| Stellar SDK (JS) | https://github.com/stellar/js-stellar-sdk |
| Freighter Wallet | https://freighter.app |
| Freighter API Docs | https://docs.freighter.app |
| Horizon Testnet | https://horizon-testnet.stellar.org |
| Stellar Expert Explorer | https://stellar.expert/explorer/testnet |
| Stellar Friendbot | https://friendbot.stellar.org |
| Next.js Documentation | https://nextjs.org/docs |
| Tailwind CSS v4 | https://tailwindcss.com |

---

<div align="center">
  <strong>Built with ⚡ on the Stellar Network</strong>
</div>
