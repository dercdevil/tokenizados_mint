"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { useState } from "react";

// 📌 Configuración wagmi (ejemplo: Sepolia)
const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    injected(),
    walletConnect({
      projectId: "2f5a2c4e5f6d7e8f9a0b1c2d3e4f5a6b", // ID público de ejemplo
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false,
});

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
