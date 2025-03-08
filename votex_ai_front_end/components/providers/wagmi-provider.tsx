"use client";

import { createConfig, WagmiConfig } from "wagmi";
import { sonicTestnet } from "@/config/chains";
import { createPublicClient, http } from "viem";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [sonicTestnet],
  connectors: [injected()],
  client: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
    }),
});

export default function WagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
