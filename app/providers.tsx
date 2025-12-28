"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { mainnet, sepolia, base, arbitrum } from "wagmi/chains";
import { http } from "wagmi";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY || "",
        }}
        config={{
          appName: "Para Test App",
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              chains: [mainnet, base, arbitrum, sepolia],
              transports: {
                [mainnet.id]: http(),
                [base.id]: http(),
                [arbitrum.id]: http(),
                [sepolia.id]: http(),
              },
            },
          },
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}

