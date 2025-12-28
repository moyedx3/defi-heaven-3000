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
          appName: "Para Wallet",
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
        paraModalConfig={{
          logo: "/char-main.png",
          theme: {
            foregroundColor: "#d4145a",
            backgroundColor: "#ffe4ec",
            accentColor: "#ff69b4",
            mode: "light",
            borderRadius: "lg",
            font: "Fredoka, sans-serif",
            oAuthLogoVariant: "dark",
            customPalette: {
              text: {
                primary: "#d4145a",
                secondary: "#ff69b4",
                subtle: "#ffb6c1",
                inverted: "#ffffff",
                error: "#ff3b30",
              },
              modal: {
                surface: {
                  main: "#fff0f5",
                  footer: "#ffe4ec",
                },
                border: "#ffb6c1",
              },
              button: {
                primary: {
                  background: "linear-gradient(180deg, #ff69b4 0%, #d4145a 100%)",
                  hover: "#ff1493",
                  text: "#ffffff",
                },
              },
            },
          },
          oAuthMethods: ["GOOGLE", "TWITTER", "DISCORD", "APPLE"],
          disablePhoneLogin: false,
          disableEmailLogin: false,
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}

