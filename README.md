ArcenEmbed Studio — Multi-Chain Wallet-Native Billing & Checkout UI

Live Production Demo: https://arcenpay-embed-studio.vercel.app

GitHub Repository: https://github.com/ankittiwari-04/arcenpay-embed-studio

Protocol Reference: ArcenPay · ArcenPay Documentation · ArcenPay About

Overview

ArcenEmbed Studio is an interactive, iframeless React & Next.js 15 billing surface showcase engineered for ArcenPay — the protocol for on-chain subscriptions, programmable entitlement gating, and autonomous x402 AI agent commerce.

Traditional crypto checkouts feel like clunky plumbing adapted from legacy fiat card flows. ArcenEmbed Studio demonstrates how wallet-native billing feels when treated as a first-class product surface: zero redirects, sub-50ms cryptographic mandate verification, instant feature-flag unlocking, and unified multi-chain UX across Solana, EVM (BOT Chain #677, Base #8453, Arc), and Stellar Soroban.

Key Product Surfaces Implemented

Surface

Component

Core Capabilities

01 · Multi-Chain Checkout

<ArcenEmbed surface="checkout" />

Zero-redirect USDC subscription & one-time payment link checkout across Solana (Phantom, Solflare, Backpack), EVM (Rabby, MetaMask, Rainbow via wagmi v2), and Stellar (Freighter, Lobstr), with a 3-stage signature → <50ms x402 verification → on-chain receipt flow.

02 · Customer Billing Portal

<ArcenEmbed surface="portal" />

Active subscription management, 1-click settlement rail switching, live metered API usage simulation ($0.002/req via x402), real-time entitlement gates (pro_dashboard, rate_limit, enterprise_sso), and verified mainnet receipt inspection.

03 · Autonomous Agent Mandates

ArcenAuth (AAM) + x402

Programmable daily USDC spending caps for autonomous AI agents (ai-trading-bot on app.uniswap.org and MCP tool swarms), 1-click on-chain mandate pause/revocation, and a live <50ms verification stream.

04 · Iframeless Token Studio

<ArcenPayProvider tokens={...} />

Real-time design token customizer (accentColor, borderRadius, defaultChain, sponsorGas) that dynamically updates the live checkout widget and generates copy-ready TypeScript .tsx code.

Multi-Chain Architecture & Settlement Specs

Built around the production networks and contract specifications documented on ArcenPay and ArcenPay Documentation:

Network

Chain ID / Environment

Wallet Adapter / SDK Stack

Authorization & Settlement Mechanism

Finality

Solana Mainnet

9100000

@solana/wallet-adapter-react (Phantom, Solflare, Backpack)

Ed25519 Off-Chain Mandate + SPL USDC Allowance

~400ms

BOT Chain Mainnet

677 (0xea54...19d9)

wagmi v2 + viem (Rabby, MetaMask, Rainbow)

EIP-712 TypedData Mandate + ERC-20 Permit2

~1.2s

Base / Arc (EVM)

8453 / 4216

wagmi v2 + viem

EIP-712 TypedData Mandate + Sponsored Paymaster

~1.2s

Stellar Mainnet

Soroban

@stellar/freighter-api (Freighter, Lobstr, xBull)

Soroban HostFunction Auth + FeeBump Sponsored (0 Gas)

~3.1s

Tech Stack

Framework: Next.js 15 (App Router) + React 18

Language: Strict TypeScript (tsc --noEmit verified)

EVM Wallet Stack: wagmi v2, viem, @tanstack/react-query (configured with custom botChainMainnet Chain ID 677 and registry 0xea549C49A1A97faC398F977BCC0D65256c5419d9)

Solana Wallet Stack: @solana/web3.js, @solana/wallet-adapter-react, @solana/wallet-adapter-wallets

Stellar Wallet Stack: @stellar/freighter-api

Styling & Motion: Tailwind CSS + CSS Custom Properties for zero-iframe host token inheritance

Project Structure

arcenpay-embed-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout & typography configuration
│   │   └── page.tsx                        # App Router entry wiring MultiChainWalletProvider
│   ├── components/
│   │   └── ArcenEmbedStudio.tsx            # Checkout, Customer Portal, x402 Agent & Token Studio
│   ├── hooks/
│   │   └── useArcenEntitlements.ts         # Type-safe entitlement gating & x402 telemetry hook
│   └── providers/
│       └── MultiChainWalletProvider.tsx    # Unified wagmi v2 (BOT #677 / Base) + Solana provider
├── package.json
├── tsconfig.json
└── README.md


Quickstart & Local Development

Clone the repository and install dependencies:

git clone https://github.com/ankittiwari-04/arcenpay-embed-studio.git
cd arcenpay-embed-studio
npm install


Run TypeScript verification and start the development server:

npx tsc --noEmit
npm run dev


Open in browser:
Navigate to http://localhost:3000 to test multi-chain plan switching, promo code calculation (DEGEN20), wallet adapter handshakes, <50ms x402 mandate verification, and live design token customization.

Why Wallet-Native Billing?

On-chain users and autonomous AI agents hold liquidity directly in wallets and expect sub-second cryptographic access gating — forcing them through legacy fiat card plumbing kills Web3 conversion and breaks programmable machine-to-machine commerce.
