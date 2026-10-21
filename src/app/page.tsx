import { MultiChainWalletProvider } from "@/providers/MultiChainWalletProvider";
import { ArcenEmbedStudio } from "@/components/ArcenEmbedStudio";

export default function HomePage() {
  return (
    <MultiChainWalletProvider>
      <ArcenEmbedStudio />
    </MultiChainWalletProvider>
  );
}
