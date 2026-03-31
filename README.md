<div align="center">

# 🏠 TrustEstate

### AI-powered Real Estate Fraud Protection on Solana

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)](https://explorer.solana.com/address/8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-FF6B35?style=for-the-badge)](https://www.anchor-lang.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-React-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-Fraud%20Detection-10B981?style=for-the-badge)](https://llm.alem.ai)

**Decentrathon 5.0 · National Solana Hackathon Kazakhstan · Case 1: RWA Tokenization**

[🔗 Live Contract on Solana Explorer](https://explorer.solana.com/address/8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY?cluster=devnet)

</div>

---

## 🚨 The Problem

Every year in Kazakhstan, **real estate fraud devastates thousands of families**:

| Metric | Reality |
|--------|---------|
| 🔴 Fraud cases annually | **12,000+** |
| 💸 Average loss per victim | **15,000,000 ₸** (~$30,000) |
| ⏳ Investigation time | **8–14 months** |
| 📄 Most common fraud | Double-selling, forged power of attorney |

> *A seller signs 3 different contracts for the same apartment, disappears with deposits from 3 buyers. No blockchain trail. No recourse.*

Traditional real estate has **zero transparency**, **no immutable ownership record**, and **no automated fraud detection**.

---

## ✅ The Solution

TrustEstate makes every real estate transaction **transparent, verifiable, and fraud-proof**:

```
Property → NFT on Solana   +   AI Fraud Detection   +   Smart Escrow
     (immutable ownership)       (pre-transaction)       (atomic swap)
```

1. **Tokenize** — Property becomes a unique NFT; cadastral ID, doc hash, metadata stored on-chain
2. **AI Verify** — AlemLLM analyzes the property for 7 fraud patterns before listing
3. **Deal** — Buyer deposits SOL into smart contract escrow, AI checks the deal
4. **Execute** — Atomic swap: NFT → buyer, SOL → seller in a single Solana transaction

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                      │
│   Landing · Dashboard · Tokenize · Deals · Properties        │
│   i18n: RU / KZ / EN   ·   Phantom Wallet Integration        │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API + Anchor SDK
┌──────────────────────────▼──────────────────────────────────┐
│                   Express.js Backend                          │
│  ┌─────────────────┐        ┌─────────────────────────────┐  │
│  │  AI Fraud Engine │        │   Solana Transaction Layer  │  │
│  │  (AlemLLM / KZ) │        │   PDA helpers · Executors   │  │
│  │  7 fraud checks  │        │   Oracle keypair signing    │  │
│  └─────────────────┘        └─────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ on-chain
┌──────────────────────────▼──────────────────────────────────┐
│              Solana Smart Contract (Anchor/Rust)              │
│                                                               │
│  initialize_platform   tokenize_property   create_deal       │
│  submit_ai_verification   fund_escrow   confirm_deal         │
│  submit_deal_ai_check   execute_deal   cancel_deal           │
│  fractionalize_property   buy_shares   distribute_rental     │
│                                                               │
│  Program ID: 8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Fraud Detection

AlemLLM (Kazakhstan's national AI) checks **7 fraud patterns** before any property is listed or deal is approved:

| Check | What it detects |
|-------|----------------|
| 🔴 Duplicate listing | Same cadastral ID already tokenized |
| 🔴 Price anomaly | Price deviates >40% from market estimate |
| 🔴 Suspicious seller | 5+ listings in 30 days |
| 🟡 Document issues | Format/data inconsistencies in property docs |
| 🟡 Address validation | Invalid or non-existent address format |
| 🟡 Rapid resale | Property flipped in <30 days |
| 🟡 Deal risk patterns | Buyer account age, repeat transactions |

**Risk Score → On-Chain Verdict:**
```
Score 0–39   →  ✅ Auto-approved  →  Deal proceeds
Score 40–74  →  🟡 Under review   →  Manual check required
Score 75–100 →  🚫 Blocked        →  platform.total_fraud_blocked++
```

---

## ⛓️ Smart Contract

**12 instructions** covering the full real estate lifecycle:

```rust
Program ID: 8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY

Accounts:
  Platform           — global stats (properties, deals, fraud_blocked)
  Property           — NFT metadata + AI verification score + fraud flags
  Verification       — AI verdict: score, flags, market price estimate
  Deal               — buyer/seller/price/status/escrow_vault
  DealAiCheck        — AI risk analysis: score, flags[], recommendation
  FractionalProperty — shares, price_per_share, rental_vault
```

**Atomic Escrow Flow:**
```
buyer deposits SOL → escrow PDA
seller confirms → property locked
AI checks deal → verdict on-chain
execute_deal():
    token::transfer(NFT: seller → buyer)  ─┐ atomic
    escrow → seller (lamports)             ─┘
```

---

## 💡 Why Solana?

| Requirement | Solana | Traditional DB |
|------------|--------|----------------|
| Transaction finality | **0.4 seconds** | N/A |
| Transaction cost | **~$0.001** | N/A |
| Ownership immutability | ✅ Guaranteed | ❌ Can be modified |
| Fraud auditability | ✅ Public, permanent | ❌ Hidden/deleted |
| Atomic swap | ✅ Built-in | ❌ Requires trust |
| Fractional ownership | ✅ SPL tokens | Complex/expensive |

---

## 🌍 Localization

Full **RU / KZ / EN** support — critical for Kazakhstan market:
- Government documents are in Kazakh
- Urban population uses Russian
- International investors need English

---

## 🚀 Quick Start

### Verify deployed contract
```bash
solana program show 8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY --url devnet
```

### Backend
```bash
cd server
cp .env.example .env   # Add ANTHROPIC_API_KEY, ORACLE_PRIVATE_KEY
npm install && npm run dev   # → http://localhost:3001
```

### Frontend
```bash
cd app
npm install
npm run dev   # → http://localhost:5175
```

---

## 📁 Project Structure

```
trust_solana_repo/
├── programs/trustestate/src/lib.rs   # Anchor smart contract (12 instructions)
├── server/src/
│   ├── ai/fraudDetector.ts           # AI fraud detection (7 checks)
│   ├── solana/executor.ts            # PDA helpers, oracle signing
│   └── routes/                       # REST API endpoints
└── app/src/
    ├── pages/                         # Landing, Dashboard, Tokenize, Deals, Properties
    ├── hooks/useTrustEstate.ts        # Anchor program integration
    ├── lib/idl.ts                     # Full Anchor IDL
    ├── store/                         # Zustand: useStore, useTxStore
    └── i18n/                          # ru.json, kk.json, en.json
```

---

## 🏆 Hackathon Highlights

| Achievement | Detail |
|------------|--------|
| ✅ Smart contract deployed | Solana Devnet · `8j9MKKmv...` |
| ✅ 12 on-chain instructions | Full real estate lifecycle |
| ✅ AI fraud detection | AlemLLM — Kazakhstan's national AI |
| ✅ Real Solana transactions | initialize_platform + tokenize_property from UI |
| ✅ RU/KZ/EN localization | Native Kazakhstan market support |
| ✅ Fractional ownership | SPL token shares + rental distribution |
| ✅ Atomic escrow | NFT ↔ SOL in single transaction |

---

## 🗺️ Roadmap — Scaling Potential

TrustEstate is built as a foundation for Kazakhstan's national real estate infrastructure. Planned phases:

### Phase 2 — Mainnet Launch (Q3 2026)
- Deploy to Solana Mainnet after regulatory sandbox approval
- Integration with **EGKN** (state cadastral database) via API
- KYC/AML layer with digital ID verification (eGov Kazakhstan)
- Mobile app (React Native) for property sellers and buyers

### Phase 3 — Multi-City Expansion (Q4 2026)
- Expand from Almaty to Astana, Shymkent, and Aktobe
- **Notary module** — digital signing of property transfer acts
- Court-admissible blockchain certificates for property ownership
- Insurance module — escrow-backed deal insurance

### Phase 4 — Central Asian Market (2027)
| Country | Market Size | Entry Strategy |
|---------|-------------|----------------|
| 🇰🇿 Kazakhstan | $12B/year | First mover, regulatory partnership |
| 🇺🇿 Uzbekistan | $8B/year | Mirror deployment, local AI model |
| 🇰🇬 Kyrgyzstan | $2B/year | Partner-led rollout |

### Revenue Model
```
Transaction fee:  0.5% of deal value  →  flows to Platform PDA treasury
Verification fee: 5 SOL per property  →  oracle sustainability
Fractional mgmt:  2% of rental income →  distributed to token holders
```

### Impact Projection
| Year | Properties Tokenized | Fraud Prevented | Revenue |
|------|---------------------|-----------------|---------|
| 2026 | 500 | 12 cases | $25K |
| 2027 | 5,000 | 120 cases | $250K |
| 2028 | 50,000 | 1,200 cases | $2.5M |

> *If just 10% of Kazakhstan's 120,000 annual real estate transactions run through TrustEstate by 2028, that's 14,400 families protected from fraud.*

---

<div align="center">

**Built with ❤️ in Kazakhstan · Decentrathon 5.0 · April 2026**

[🔗 Solana Explorer](https://explorer.solana.com/address/8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY?cluster=devnet)

</div>
