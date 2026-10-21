"use client";

import React, { useState } from "react";
import { useArcenEntitlements, ChainKey } from "@/hooks/useArcenEntitlements";

type SurfaceTab = "checkout" | "portal" | "studio";
type PlanKey = "pro" | "agent" | "onboard";

interface PlanConfig {
  id: string;
  title: string;
  badge: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  unlocks: string;
  tags: string[];
}

const PLANS: Record<PlanKey, PlanConfig> = {
  pro: {
    id: "pro_monthly",
    title: "Pro Protocol Plan",
    badge: "POPULAR",
    description: "Recurring wallet mandate · Unlocks Pro Dashboard + 10,000 API req/mo",
    monthlyPrice: 49.0,
    annualPrice: 39.2,
    unlocks: "Pro Dashboard + 10k API Quota",
    tags: ["pro_dashboard: true", "rate_limit: 10,000/mo", "webhooks: signed_ed25519"],
  },
  agent: {
    id: "agent_swarm",
    title: "Autonomous Agent Swarm",
    badge: "x402 + AAM",
    description: "Includes ArcenAuth mandates, Verify-Then-Settle escrow & 15 MCP tools",
    monthlyPrice: 150.0,
    annualPrice: 120.0,
    unlocks: "ArcenAuth AAM + Verify-Then-Settle Escrow",
    tags: ["arcen_auth_aam: true", "x402_facilitator: <50ms", "mcp_tools: 15_enabled"],
  },
  onboard: {
    id: "priority_onboard",
    title: "Priority Onboarding Link",
    badge: "ONE-TIME",
    description: "Hosted payment link flow · Instant custom contract & SLA activation",
    monthlyPrice: 249.0,
    annualPrice: 249.0,
    unlocks: "Custom SLA + Dedicated Solutions Engineer",
    tags: ["hosted_payment_link: verified", "custom_sla: active", "audit_proof: bot_677"],
  },
};

const CHAINS: Record<
  ChainKey,
  {
    name: string;
    sub: string;
    badge: string;
    sdk: string;
    contract: string;
    sigSpec: string;
    wallets: { name: string; addr: string; balance: string }[];
  }
> = {
  solana: {
    name: "Solana",
    sub: "SPL USDC · ~400ms",
    badge: "⚡ ~400ms finality · Solana Mainnet (9100000)",
    sdk: "@solana/wallet-adapter-react",
    contract: "ArcenSo1...9100",
    sigSpec: "Ed25519 Off-Chain Mandate + SPL Auto-Approve",
    wallets: [
      { name: "Phantom", addr: "7xKp...9mQa", balance: "1,420.85 USDC" },
      { name: "Solflare", addr: "9aLm...3vXz", balance: "890.20 USDC" },
      { name: "Backpack", addr: "4pQw...8nRt", balance: "3,110.00 USDC" },
    ],
  },
  evm: {
    name: "EVM · BOT #677",
    sub: "wagmi v2 · Base / Arc",
    badge: "⚡ ~1.2s finality · BOT Chain Mainnet (#677)",
    sdk: "wagmi v2 + viem (EIP-712 Mandate)",
    contract: "0xea54...19d9",
    sigSpec: "EIP-712 TypedData Mandate + ERC-20 Permit2",
    wallets: [
      { name: "Rabby", addr: "0x4a8f...9f2b", balance: "2,890.00 USDC" },
      { name: "MetaMask", addr: "0x71cE...3a19", balance: "1,105.40 USDC" },
      { name: "Rainbow", addr: "0x99bD...8e41", balance: "640.00 USDC" },
    ],
  },
  stellar: {
    name: "Stellar",
    sub: "Soroban · 0 Gas",
    badge: "⚡ ~3.1s finality · Stellar Soroban Mainnet",
    sdk: "@stellar/freighter-api (Soroban Auth)",
    contract: "CDLZFC...7XLP",
    sigSpec: "Soroban HostFunction Auth + FeeBump Sponsored",
    wallets: [
      { name: "Freighter", addr: "GDR4...8XLP", balance: "940.50 USDC" },
      { name: "Lobstr", addr: "GB7X...2MNA", balance: "512.00 USDC" },
      { name: "xBull", addr: "GC9Q...4KWT", balance: "1,780.15 USDC" },
    ],
  },
};

export function ArcenEmbedStudio() {
  const [surface, setSurface] = useState<SurfaceTab>("checkout");
  const [plan, setPlan] = useState<PlanKey>("pro");
  const [interval, setIntervalState] = useState<"monthly" | "annual">("monthly");
  const [addonIncluded, setAddonIncluded] = useState<boolean>(true);
  const [promoInput, setPromoInput] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [chain, setChain] = useState<ChainKey>("solana");
  const [walletIdx, setWalletIdx] = useState<number>(0);
  const [sponsoredGas, setSponsoredGas] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>("#3B82F6");
  const [radiusPx, setRadiusPx] = useState<number>(16);

  // Settlement stepper states
  const [settlingStage, setSettlingStage] = useState<"idle" | "signing" | "verifying" | "settled">("idle");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    apiRequestsUsed,
    apiAccruedCost,
    enterpriseUnlocked,
    setEnterpriseUnlocked,
    agentCap,
    setAgentCap,
    agentMandateActive,
    setAgentMandateActive,
    logs,
    recordX402Event,
    simulateMeteredBurst,
  } = useArcenEntitlements();

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const activePlan = PLANS[plan];
  const activeChain = CHAINS[chain];
  const activeWallet = activeChain.wallets[walletIdx] || activeChain.wallets[0];

  const basePrice = interval === "annual" ? activePlan.annualPrice : activePlan.monthlyPrice;
  const addonPrice = addonIncluded ? 12.5 : 0;
  const subtotal = basePrice + addonPrice;
  const discountAmt = subtotal * discountRate;
  const gasFee = sponsoredGas ? 0 : 0.45;
  const totalDue = Math.max(0, subtotal - discountAmt + gasFee);

  const handleApplyPromo = (codeOverride?: string) => {
    const code = (codeOverride ?? promoInput).trim().toUpperCase();
    setPromoInput(code);
    if (code === "DEGEN20" || code === "ARCEN20") {
      setDiscountRate(0.2);
      triggerToast(`Promo ${code} applied (20% off on-chain mandate)`);
    } else if (code.length > 0) {
      setDiscountRate(0.1);
      triggerToast(`Promo ${code} applied (10% discount)`);
    } else {
      setDiscountRate(0);
      triggerToast("Promo cleared");
    }
  };

  const handleSignAndPay = () => {
    setSettlingStage("signing");
    setTimeout(() => {
      setSettlingStage("verifying");
    }, 420);
    setTimeout(() => {
      setSettlingStage("settled");
      recordX402Event("sub_settle", 38, `${activePlan.title} · $${totalDue.toFixed(2)} USDC`);
      triggerToast("Settled on-chain in 38ms & entitlements unlocked!");
    }, 920);
  };

  const generatedTsxSnippet = `// src/components/ArcenCheckoutModal.tsx
"use client";

import { ArcenPayProvider, ArcenEmbed } from "@arcenpay/react";

export function ArcenCheckoutModal({ customerId }: { customerId: string }) {
  return (
    <ArcenPayProvider
      publishableKey={process.env.NEXT_PUBLIC_ARCEN_PK!}
      customer={{ id: customerId, walletNative: true }}
      defaultChain="${chain}"
      tokens={{
        accentColor: "${accentColor}",
        surfaceColor: "#0B0F1C",
        borderRadius: "${radiusPx}px",
      }}
    >
      <ArcenEmbed
        surface="checkout"
        planId="${activePlan.id}"
        sponsorGas={${sponsoredGas}}
      />
    </ArcenPayProvider>
  );
}`;

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#05070E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
              style={{ backgroundColor: accentColor }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3.5 19.5H8.2L12 11.8L15.8 19.5H20.5L12 3Z" fill="currentColor" />
                <circle cx="12" cy="17.2" r="1.8" fill="#93C5FD" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">ArcenPay</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  @arcenpay/react v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Wallet-Native Billing Surfaces · Non-Custodial Subscriptions &amp; x402 Agent Commerce
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            {(
              [
                ["checkout", "01 · ArcenEmbed Checkout"],
                ["portal", "02 · Customer Portal & x402"],
                ["studio", "03 · Token Studio & .tsx Code"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSurface(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  surface === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-3 text-xs font-mono bg-slate-900/70 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-400">● 99.99% Uptime</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">x402: 38ms</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">BOT #677 · SOL · XLM</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {surface === "checkout" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    Iframeless React Surface
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    &lt;ArcenEmbed surface=&quot;checkout&quot; planId=&quot;{activePlan.id}&quot; /&gt;
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Make Checkout Look Like Product, Not Plumbing.
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Zero-redirect USDC billing across Solana Mainnet, EVM (BOT Chain #677 &amp; Base), and Stellar Soroban.
                </p>
              </div>
              <button
                onClick={() => setSponsoredGas(!sponsoredGas)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              >
                {sponsoredGas ? "Gas: Sponsored ($0.00)" : "Gas: User Pays ($0.45)"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 Cols: Plan Configurator */}
              <div className="lg:col-span-5 rounded-2xl p-5 bg-slate-900/60 border border-slate-800/90 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-blue-400">Host App Context</span>
                    <h2 className="text-base font-bold text-white">1. Select Plan &amp; Cadence</h2>
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
                    <button
                      onClick={() => setIntervalState("monthly")}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${
                        interval === "monthly" ? "bg-blue-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIntervalState("annual")}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${
                        interval === "annual" ? "bg-blue-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Annual <span className="text-emerald-400">-20%</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                    const item = PLANS[k];
                    const price = interval === "annual" ? item.annualPrice : item.monthlyPrice;
                    return (
                      <button
                        key={k}
                        onClick={() => setPlan(k)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          plan === k
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{item.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <div className="text-base font-bold text-white">${price.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">USDC</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={addonIncluded}
                        onChange={(e) => setAddonIncluded(e.target.checked)}
                        className="rounded accent-blue-500"
                      />
                      Include Prepaid Usage Pack (+25,000 API Credits)
                    </span>
                    <span className="font-mono text-slate-300">+$12.50 USDC</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (try DEGEN20)"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() => handleApplyPromo()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleApplyPromo("DEGEN20")}
                      className="px-2.5 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-mono text-blue-300"
                    >
                      DEGEN20
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: The <ArcenEmbed /> Checkout Widget */}
              <div
                className="lg:col-span-7 p-6 bg-[#0B0F1C] border border-slate-800 shadow-2xl space-y-5"
                style={{ borderRadius: `${radiusPx}px` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{activePlan.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        ✓ Audited Registry
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Request from <strong className="text-slate-200">ArcenPay.eth</strong> · {activeChain.contract}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono uppercase text-slate-400">Amount Due</div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                      ${totalDue.toFixed(2)} <span className="text-xs text-blue-400">USDC</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Chain Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-300">
                      1. Settlement Network
                    </span>
                    <span className="font-mono text-[11px] text-cyan-400">{activeChain.badge}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(["solana", "evm", "stellar"] as ChainKey[]).map((cKey) => {
                      const item = CHAINS[cKey];
                      return (
                        <button
                          key={cKey}
                          onClick={() => {
                            setChain(cKey);
                            setWalletIdx(0);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            chain === cKey
                              ? "border-blue-500 bg-blue-500/15"
                              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallet Adapter Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-300">
                      2. Connected Wallet Adapter
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{activeChain.sdk}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {activeChain.wallets.map((w, idx) => (
                      <button
                        key={w.name}
                        onClick={() => {
                          setWalletIdx(idx);
                          triggerToast(`Connected ${w.name} (${w.addr})`);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                          walletIdx === idx
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{w.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{w.addr}</div>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            walletIdx === idx ? "bg-emerald-400" : "bg-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-300">Balance: </span>
                      <strong className="font-mono text-white">{activeWallet.balance}</strong>
                      <div className="text-[11px] font-mono text-slate-400">{activeChain.sigSpec}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[11px]">
                      Sufficient Liquidity
                    </span>
                  </div>
                </div>

                {/* Summary & CTA */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Plan Base ({activePlan.title})</span>
                    <span className="font-mono text-slate-200">${basePrice.toFixed(2)} USDC</span>
                  </div>
                  {addonIncluded && (
                    <div className="flex justify-between text-slate-400">
                      <span>Prepaid API Usage Pack (+25k req)</span>
                      <span className="font-mono text-slate-200">$12.50 USDC</span>
                    </div>
                  )}
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({promoInput})</span>
                      <span className="font-mono">-${discountAmt.toFixed(2)} USDC</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Network &amp; Facilitator Gas</span>
                    <span className="font-mono text-emerald-400">
                      {sponsoredGas ? "Sponsored ($0.00)" : "$0.45 USDC"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignAndPay}
                  disabled={settlingStage === "signing" || settlingStage === "verifying"}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white shadow-lg transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  {settlingStage === "signing"
                    ? `Awaiting Signature in ${activeWallet.name}...`
                    : settlingStage === "verifying"
                    ? "Verifying Mandate via x402 Facilitator (<42ms)..."
                    : `Sign Authorization & Pay $${totalDue.toFixed(2)} USDC`}
                </button>

                {settlingStage === "settled" && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-emerald-200">
                        ✓ On-Chain Settlement Confirmed &amp; Entitlements Minted
                      </div>
                      <div className="font-mono text-[11px] text-emerald-400">
                        Receipt: 0xe3da1fd1...73b2 (38ms via x402 facilitator)
                      </div>
                    </div>
                    <button
                      onClick={() => setSurface("portal")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                    >
                      Open Customer Portal →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {surface === "portal" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                  &lt;ArcenEmbed surface=&quot;portal&quot; /&gt;
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Customer Billing Portal, Entitlements &amp; ArcenAuth Agent Mandates
                </h2>
              </div>
              <button
                onClick={simulateMeteredBurst}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
              >
                + Simulate 500 API Calls (x402)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Subscriptions & Usage */}
              <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Active Subscriptions &amp; Quota
                </h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-white">Pro Plan</div>
                    <div className="text-xs text-slate-400">Billed monthly · Auto-renew active</div>
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-400">$49.00 USDC</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">Data API (Metered x402)</span>
                    <span className="font-mono text-cyan-400">${apiAccruedCost.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Quota Used</span>
                    <span>{apiRequestsUsed.toLocaleString()} / 10,000 req</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                      style={{ width: `${(apiRequestsUsed / 10000) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono uppercase text-slate-400">Entitlement Gates</span>
                    <button
                      onClick={() => setEnterpriseUnlocked(!enterpriseUnlocked)}
                      className="text-[11px] font-mono text-blue-400 underline"
                    >
                      Toggle Enterprise
                    </button>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Pro Dashboard</span>
                    <span className="font-mono text-emerald-400">✓ Unlocked</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Enterprise SSO &amp; SLA</span>
                    <span className="font-mono text-amber-400">
                      {enterpriseUnlocked ? "✓ Unlocked" : "🔒 Requires Enterprise"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Autonomous Agent Mandates */}
              <div className="rounded-2xl p-5 bg-slate-900/60 border border-purple-500/30 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-purple-300">
                    ArcenAuth · Autonomous Agent Mandate
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {agentMandateActive ? "● Active" : "● Paused"}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold font-mono text-white">ai-trading-bot</div>
                      <div className="text-[11px] text-slate-400">app.uniswap.org · Buy 0.05 WETH</div>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">150.00 USDC</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Daily Spending Cap</span>
                      <span className="font-mono text-purple-300">${agentCap}.00 USDC / day</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={500}
                      step={25}
                      value={agentCap}
                      onChange={(e) => setAgentCap(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        recordX402Event("x402_escrow", 36, "ai-trading-bot · 150.00 USDC");
                        triggerToast("Verified & settled agent trade via x402");
                      }}
                      className="py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white"
                    >
                      Execute Trade (x402)
                    </button>
                    <button
                      onClick={() => setAgentMandateActive(!agentMandateActive)}
                      className="py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      {agentMandateActive ? "Pause Mandate" : "Resume Mandate"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live x402 Verification Stream */}
              <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Live x402 Verification Stream (&lt;50ms)
                </h3>
                <div className="space-y-2 text-[11px] font-mono">
                  {logs.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between"
                    >
                      <span className="text-emerald-400">
                        ✓ {entry.action} ({entry.latencyMs}ms)
                      </span>
                      <span className="text-slate-300">{entry.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {surface === "studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">Iframeless Design Token Customizer</h2>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Brand Accent Token</label>
                <div className="grid grid-cols-3 gap-2">
                  {["#3B82F6", "#6366F1", "#10B981"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setAccentColor(hex)}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono flex items-center gap-2"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hex }} />
                      {hex}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Border Radius</span>
                  <span className="font-mono text-blue-400">{radiusPx}px</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={28}
                  value={radiusPx}
                  onChange={(e) => setRadiusPx(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-mono text-blue-400">src/components/ArcenCheckoutModal.tsx</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedTsxSnippet);
                    triggerToast("Copied TypeScript snippet");
                  }}
                  className="px-3 py-1 rounded bg-slate-800 text-xs font-mono"
                >
                  Copy .tsx
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {generatedTsxSnippet}
              </pre>
            </div>
          </div>
        )}
      </main>

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-blue-500/50 shadow-2xl text-xs font-medium text-white">
          ✓ {toastMsg}
        </div>
      )}
    </div>
  );
}
