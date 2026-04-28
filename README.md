# ⚡ QuickPay — Stellar Micro-Payment dApp

A clean, minimal, and fully functional **Stellar-based micro-payment application** that lets users send XLM instantly using their [Freighter](https://freighter.app) wallet. Built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, QuickPay is a production-ready frontend for the Stellar Testnet.

---

## 📸 Screenshots

> **Note:** Replace the placeholder URLs below with your Cloudinary image links.

| Screen | Preview |
|---|---|
| Landing / Connect Wallet | ![Landing Page](https://placeholder.cloudinary.com/landing) |
| Dashboard — Balance & Send | ![Dashboard](https://placeholder.cloudinary.com/dashboard) |
| Payment Success | ![Payment Success](https://placeholder.cloudinary.com/success) |
| Transaction History | ![Transaction History](https://placeholder.cloudinary.com/history) |
| Disconnect Confirmation Modal | ![Disconnect Modal](https://placeholder.cloudinary.com/disconnect) |
| Switch Wallet Guide Modal | ![Switch Modal](https://placeholder.cloudinary.com/switch) |
| Network Warning (Non-Testnet) | ![Network Warning](https://placeholder.cloudinary.com/network-warning) |

---

## 🧭 Overview

QuickPay is a single-page dApp (decentralized application) that provides:

- 🔗 **Wallet Connection** via Freighter browser extension
- 💰 **Live XLM Balance** fetched directly from Stellar Horizon, with manual refresh
- 🪣 **Testnet Faucet** — fund your wallet with one click via Stellar Friendbot
- 📤 **XLM Payments** — build, sign, and submit transactions on-chain
- ⚡ **Quick Amount Presets** — send 1, 5, 10, or 50 XLM in a single click
- 📋 **Transaction History** — view your last 10 sent/received payments with live data from Horizon
- 🔍 **Transaction Explorer** — view confirmed transactions on `stellar.expert`
- 📋 **Copy Address** — copy your connected Stellar public key to clipboard from the header
- ⚠️ **Network Guard** — warns you if your Freighter wallet is not on Testnet
- 🎨 **Premium Dark UI** — pure black background, glassmorphic panels, Geist typography, smooth animations

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
| QR Codes | [qrcode.react v4](https://www.npmjs.com/package/qrcode.react) |
| Network | Stellar **Testnet** |
| Linting | ESLint 9 + eslint-config-next |

---

## 📁 Project Structure

```
stellar-quickpay/
├── public/                        # Static assets (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── favicon.ico            # App favicon
│   │   ├── globals.css            # Global styles, CSS variables, scrollbar, animations
│   │   ├── layout.tsx             # Root layout — fonts, metadata, FreighterProvider wrapper
│   │   └── page.tsx               # Home page — orchestrates all UI sections
│   │
│   ├── components/
│   │   ├── Header.tsx             # App header: logo, wallet connect/disconnect/switch/copy
│   │   ├── BalanceSection.tsx     # Live XLM balance card + Friendbot faucet button
│   │   ├── SendPayment.tsx        # Full payment form: inputs, quick amounts, tx feedback
│   │   ├── TransactionHistory.tsx # Recent payments table (sent + received) from Horizon
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
   - After installing, switch Freighter's network to **Testnet** in Settings → Network
4. A **funded Stellar Testnet account** — you can use the in-app **Fund Wallet** button, or manually hit [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stellar-quickpay.git
cd stellar-quickpay
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

### Connection Flow

1. User clicks **"Connect Wallet"** in the header
2. The app calls `setAllowed()` from `@stellar/freighter-api` — this triggers the Freighter popup for account selection
3. On approval, the app reads the public key via `getAddress()` and the active network via `getNetwork()`
4. The session is persisted in `localStorage` (key: `wallet_connected`) so reconnection is seamless on page refresh
5. On window focus, `checkConnection()` runs again to detect if the user has revoked permissions in Freighter

### Disconnect Behavior

- Clicking **Disconnect** opens a confirmation modal to prevent accidental disconnections
- On confirm: `localStorage` session is cleared and all wallet state is reset
- The app never calls any Freighter revocation API — it simply forgets the session locally

### Switch Wallet

- Clicking **Switch** shows a 3-step guide instructing the user to change accounts directly inside the Freighter extension
- The app automatically detects the new account on the next `checkConnection()` poll (triggered by window focus)

### Copy Address

- When connected, the truncated wallet address (e.g. `GABCD...WXYZ`) is displayed in the header as a clickable button
- Clicking it copies the full Stellar public key to the clipboard with a **"Copied!"** confirmation flash

### Network Guard

- After connecting, the app reads the active network from Freighter
- If the connected network is **not Testnet**, an orange warning banner is shown at the top of the page, prompting the user to switch networks in Freighter

---

## 💸 Payment Flow — Step by Step

When a user submits a payment, the following happens inside `SendPayment.tsx`:

```
1. Validate inputs
   ├── Recipient address must be a valid Stellar public key (G...)
   ├── Cannot send to your own address
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
   ├── SUCCESS: Full success card with amount, recipient, network, tx hash link, and "View on Explorer" button
   └── ERROR: Red inline error banner with human-readable message + dismiss button
       (handles: tx_bad_auth, op_underfunded, tx_too_late, User declined, etc.)

8. Post-success cleanup
   ├── Form inputs are cleared
   ├── Balance in BalanceSection is automatically refreshed
   └── TransactionHistory fetches the latest records
```

---

## 📜 Transaction History

The `TransactionHistory` component fetches the **last 10 payment operations** (sent + received) for the connected wallet in real time from the Stellar Horizon API.

**Features:**
- **Sent / Received** direction labels with colour-coded icons (red for sent, green for received)
- **Counterparty address** shown in shortened monospace format
- **Transaction hash** as a direct link to `stellar.expert` explorer
- **Amount** displayed with 7 decimal XLM precision
- **Timestamp** shown as `MMM DD · HH:MM`
- **Manual refresh** button in the panel header
- **Auto-refresh** triggered after each successful payment send
- Graceful **empty state** and **error state** with retry

---

## 🪣 Testnet Faucet (Friendbot)

The `BalanceSection` includes a built-in **"Fund Wallet (Testnet)"** button that calls the Stellar Friendbot API to send free testnet XLM directly to your connected wallet.

- Calls `https://friendbot.stellar.org/?addr=<PUBLIC_KEY>`
- Shows a loading spinner while the request is in progress
- Displays a **success** or **error** message after completion
- Automatically re-fetches your balance on success

> This button only works on **Testnet** and has no effect on real XLM.

---

## 🌐 Network Configuration

The app is currently configured to run on the **Stellar Testnet**. Network settings are defined in `src/lib/stellar.ts`:

```typescript
export const config = {
  testnet: {
    horizonUrl:        "https://horizon-testnet.stellar.org",
    rpcUrl:            "https://soroban-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
    friendbotUrl:      "https://friendbot.stellar.org",
  },
  public: {
    horizonUrl:        "https://horizon.stellar.org",
    rpcUrl:            "",
    networkPassphrase: Networks.PUBLIC,
    friendbotUrl:      null,
  },
};

// Active network (change to "public" for mainnet)
const NETWORK: Network = "testnet";
```

> **⚠️ Warning:** To switch to Mainnet, change `NETWORK` to `"public"` **and** ensure your Freighter wallet is also set to the Public network. Sending real XLM on mainnet is irreversible.

---

## 🧩 Component Reference

### `Header.tsx`

**Purpose:** App-wide sticky navigation bar.

**States:**
- **Not connected:** Shows a **"Connect Wallet"** button; shows **"Install Freighter"** if the extension is not detected
- **Connected:** Shows a **Testnet** network badge, the truncated wallet address (click-to-copy), a **Switch** button, and a **Disconnect** button

**Modals:**
- `Disconnect Confirmation` — prevents accidental disconnections (Cancel / Disconnect)
- `Switch Wallet Guide` — 3-step instruction card for changing Freighter accounts

---

### `BalanceSection.tsx`

**Purpose:** Displays the connected wallet's live XLM balance and provides testnet funding.

**Behavior:**
- Automatically fetches balance on wallet connect
- Shows a spinner while loading
- Displays the balance with 2–7 decimal places (e.g., `1,234.56 XLM`)
- Provides a **"Try again"** button on fetch errors
- Manual **refresh** icon in the top-right corner
- Built-in **"Fund Wallet (Testnet)"** button via Stellar Friendbot
- Hides completely when wallet is disconnected

---

### `SendPayment.tsx`

**Purpose:** Core payment form.

**Fields:**
- `Recipient Address` — monospace text input for a Stellar public key (`G...`)
- `Amount (XLM)` — numeric input (step: `0.0000001`, min: `0`), scroll-wheel disabled to prevent accidental changes

**Quick Amount Presets:**
- **1 XLM**, **5 XLM**, **10 XLM**, **50 XLM** — single-click to populate the amount field

**Validation:**
- Empty fields, invalid Stellar address, sending-to-self, zero/negative amount, insufficient balance

**Transaction Status States:**

| State | UI |
|---|---|
| `idle` | Default form, dynamic "Send X XLM →" button |
| `loading` | Spinner animation, all inputs + button disabled |
| `success` | Green card with amount, recipient, network, tx hash link, "View on Explorer" + "Send Again" buttons |
| `error` | Red inline banner with human-readable error + dismiss (×) button |

**After a successful send:**
- Form inputs are cleared
- Balance is automatically refreshed in `BalanceSection`
- `TransactionHistory` is re-triggered to show the new record

---

### `TransactionHistory.tsx`

**Purpose:** Displays a live feed of recent payment operations for the connected wallet.

**Columns:**
- **Type / Time** — Sent (red ↑) or Received (green ↓) with date and time
- **Address** — Shortened counterparty address + truncated tx hash link to explorer
- **Amount** — XLM amount with +/− prefix and colour coding

**Behavior:**
- Fetches last 20 operations from Horizon, filters to payment type, shows top 10
- Refreshes automatically after each successful send via `refreshTrigger` prop
- Manual refresh button in the panel header
- Empty state and error state with retry
- Hidden when wallet is disconnected

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
- Uses `localStorage` key `wallet_connected` as a boolean flag
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
| `horizon` | Pre-configured `Horizon.Server` instance for the active network |

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
- **No backend:** All operations are fully client-side. There is no server, database, or API key storage
- **Testnet by default:** The app runs on Testnet out of the box — no real funds are at risk
- **Input validation:** Recipient addresses are validated against the Stellar SDK keypair parser before any transaction is built
- **Self-send prevention:** The form explicitly blocks sending XLM to your own connected address
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

1. Install [Freighter](https://freighter.app) and create or import a wallet
2. Switch Freighter to **Testnet** in Settings → Network
3. Open the app at `http://localhost:3000`
4. Click **Connect Wallet** and approve in Freighter
5. Use the **"Fund Wallet (Testnet)"** button (or manually hit Friendbot) to get test XLM
6. Fill in a valid recipient address and an amount, then click **Send XLM**
7. Approve the transaction in the Freighter popup
8. View the success card and click **"View on Explorer"** to confirm on [stellar.expert](https://stellar.expert/explorer/testnet)
9. Check the **Transaction History** panel to see the new record appear

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
| Horizon Testnet API | https://horizon-testnet.stellar.org |
| Stellar Expert Explorer | https://stellar.expert/explorer/testnet |
| Stellar Friendbot (Faucet) | https://friendbot.stellar.org |
| Next.js Documentation | https://nextjs.org/docs |
| Tailwind CSS v4 | https://tailwindcss.com |

---

<div align="center">
  <strong>Built with ⚡ on the Stellar Network</strong>
</div>
