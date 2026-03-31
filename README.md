# TrustEstate

Secure real estate transactions on Solana with AI-powered fraud detection.

## Problem

In Kazakhstan and CIS countries, real estate fraud causes billions in losses annually:
- **Double selling** — one property sold to multiple buyers using forged documents
- **Fake documents** — forged power of attorney, fake technical passports
- **Price manipulation** — artificially inflated or deflated prices for kickbacks
- **No transparency** — buyers can't verify ownership history or property authenticity

## Solution

TrustEstate tokenizes real estate on Solana blockchain. Each property becomes an NFT with immutable ownership records. AI verifies documents and detects fraud before transactions execute. Smart contract escrow protects both buyer and seller.

### Key Features

- **Property Tokenization** — each property = unique NFT on Solana
- **AI Document Verification** — checks authenticity, detects duplicates, estimates market price
- **Fraud Detection** — AI flags double listings, price anomalies, suspicious sellers
- **Escrow Smart Contract** — funds locked until both parties confirm + AI approves
- **Atomic Swap** — NFT transfers to buyer and SOL releases to seller in one transaction
- **Fractional Ownership** — split property into SPL tokens for investment
- **Rental Distribution** — automated proportional income distribution to token holders

## Architecture

```
Frontend (React + Vite + Tailwind)
    |
    v
Backend (Express + Claude AI API)
    |
    v
Solana Smart Contract (Anchor/Rust)
    - Property NFT (mint, transfer)
    - Deal Escrow (fund, release, refund)
    - AI Verdict (on-chain risk scores)
    - Fractional Shares (SPL tokens)
```

## Smart Contract Flow

```
1. Seller tokenizes property → AI verifies documents → NFT minted
2. Buyer creates deal → deposits SOL into escrow
3. Seller confirms → AI analyzes deal risk
4. AI verdict on-chain:
   - Score < 40  → Auto-approve
   - Score 40-75 → Manual review
   - Score > 75  → Blocked (fraud detected)
5. Execute: NFT → buyer, SOL → seller (atomic)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Rust, Anchor Framework 0.30 |
| Blockchain | Solana (devnet) |
| AI Engine | Claude API (Anthropic) |
| Backend | Express.js, TypeScript |
| Frontend | React 18, Vite, Tailwind CSS |
| Wallet | Phantom, Solflare via @solana/wallet-adapter |
| State | Zustand |

## Project Structure

```
trust_solana/
├── programs/trustestate/src/    # Anchor smart contract (Rust)
│   └── lib.rs                   # All instructions + accounts + state
├── server/src/                  # Backend
│   ├── ai/fraudDetector.ts      # AI verification + fraud detection
│   ├── solana/executor.ts       # PDA helpers + Solana interaction
│   └── routes/                  # REST API endpoints
├── app/src/                     # React frontend
│   ├── pages/                   # Dashboard, Properties, Tokenize, Deals
│   ├── components/              # Navbar, RiskBadge, StatusBadge, WalletProvider
│   ├── store/                   # Zustand state management
│   └── lib/                     # API client
└── tests/                       # Anchor tests
```

## On-Chain Accounts

| Account | Purpose |
|---------|---------|
| `Platform` | Global stats (total properties, deals, fraud blocked) |
| `Property` | Tokenized property data + AI verification score |
| `Verification` | AI verification details (score, flags, market estimate) |
| `Deal` | Buy/sell transaction with escrow |
| `DealAiCheck` | AI risk analysis for deal (score, flags, recommendation) |
| `FractionalProperty` | Fractional ownership config + share mint |

## AI Fraud Detection

The AI oracle checks for:

1. **Duplicate listings** — same cadastral ID already tokenized
2. **Price anomalies** — price significantly deviates from market
3. **Suspicious seller** — too many listings in short period
4. **Document issues** — format/data inconsistencies
5. **Address verification** — validates address format and data
6. **Rapid resale** — property flipped too quickly (possible fraud)
7. **Deal risk** — buyer-seller patterns, account age, repeat transactions

## Getting Started

### Prerequisites
- Rust + Cargo
- Solana CLI
- Anchor CLI 0.30+
- Node.js 18+

### Smart Contract
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Backend
```bash
cd server
cp .env.example .env
# Add your ANTHROPIC_API_KEY and ORACLE_PRIVATE_KEY
npm install
npm run dev
```

### Frontend
```bash
cd app
npm install
npm run dev
```

## Hackathon

**National Solana Hackathon by Decentrathon**
- Case: 1 — Tokenization of Real-World Assets (RWA)
- Asset: Real Estate
- Network: Solana (devnet)

## Team

Built at Decentrathon 5.0, March-April 2026
