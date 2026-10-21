"use client";

import React, { useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export const botChainMainnet = {
  id: 677,
  name: "BOT Chain Mainnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.network"] },
  },
  contracts: {
    arcenRegistry: {
      address: "0xea549C49A1A97faC398F977BCC0D65256c5419d9" as const,
    },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [botChainMainnet, base, sepolia],
  transports: {
    [botChainMainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function MultiChainWalletProvider({ children }: { children: React.ReactNode }) {
  const solanaWallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={solanaWallets} autoConnect>
            {children}
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
