"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { defaultSolanaRpcsPlugin } from "@privy-io/react-auth/solana";
import { createContext, useContext } from "react";

const privyEnabled = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

const PrivyEnabledContext = createContext(privyEnabled);

export function usePrivyEnabled() {
  return useContext(PrivyEnabledContext);
}

export function PrivyAppProvider({ children }: { children: React.ReactNode }) {
  if (!privyEnabled) {
    return (
      <PrivyEnabledContext.Provider value={false}>
        {children}
      </PrivyEnabledContext.Provider>
    );
  }

  return (
    <PrivyEnabledContext.Provider value>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          plugins: [defaultSolanaRpcsPlugin()],
          loginMethods: ["google"],
          appearance: {
            theme: "light",
            accentColor: "#ff7a00",
            walletChainType: "solana-only",
            showWalletLoginFirst: false,
          },
          embeddedWallets: {
            solana: {
              createOnLogin: "users-without-wallets",
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyEnabledContext.Provider>
  );
}
