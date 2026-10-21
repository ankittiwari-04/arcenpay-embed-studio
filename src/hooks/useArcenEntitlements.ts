"use client";

import { useState, useCallback } from "react";

export type ChainKey = "solana" | "evm" | "stellar";

export interface X402LogEntry {
  id: string;
  action: string;
  latencyMs: number;
  detail: string;
}

export function useArcenEntitlements() {
  const [apiRequestsUsed, setApiRequestsUsed] = useState<number>(6250);
  const [apiAccruedCost, setApiAccruedCost] = useState<number>(12.5);
  const [enterpriseUnlocked, setEnterpriseUnlocked] = useState<boolean>(false);
  const [agentCap, setAgentCap] = useState<number>(200);
  const [agentMandateActive, setAgentMandateActive] = useState<boolean>(true);
  const [logs, setLogs] = useState<X402LogEntry[]>([
    { id: "1", action: "x402_verify", latencyMs: 34, detail: "ai-trading-bot · 150.00 USDC" },
    { id: "2", action: "mcp_tool_call", latencyMs: 29, detail: "cursor-agent · 0.50 USDC" },
    { id: "3", action: "sub_renewal", latencyMs: 41, detail: "Pro Plan · 49.00 USDC" },
  ]);

  const recordX402Event = useCallback((action: string, latencyMs: number, detail: string) => {
    setLogs((prev) => [
      { id: String(Date.now()), action, latencyMs, detail },
      ...prev,
    ]);
  }, []);

  const simulateMeteredBurst = useCallback(() => {
    setApiRequestsUsed((prev) => Math.min(10000, prev + 500));
    setApiAccruedCost((prev) => Number((prev + 1.0).toFixed(2)));
    recordX402Event("x402_meter", 31, "Data API +500 req · 1.00 USDC");
  }, [recordX402Event]);

  return {
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
  };
}
