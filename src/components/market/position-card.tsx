"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyEnabled } from "@/components/providers/privy-provider";
import type { TokenSummary } from "@/lib/types";
import { formatAddress, formatTokenAmount } from "@/lib/utils";

type BalanceResponse = {
  balances: Array<{ mint: string; balance: number }>;
};

function EnabledPositionCard({ token }: { token: TokenSummary }) {
  const enabled = usePrivyEnabled();
  const { user } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);
  const wallet = useMemo(
    () =>
      user?.linkedAccounts.find(
        (account) => account.type === "wallet" && account.chainType === "solana",
      ) as { address: string } | undefined,
    [user?.linkedAccounts],
  );

  useEffect(() => {
    const walletAddress = wallet?.address;

    if (!walletAddress) {
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        const response = await fetch(`/api/wallet/${walletAddress}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as BalanceResponse;
        const tokenBalance = data.balances.find((item) => item.mint === token.address)?.balance ?? 0;
        setBalance(tokenBalance);
      } catch {
        setBalance(null);
      }
    }

    void run();
    return () => controller.abort();
  }, [token.address, wallet?.address]);

  const visibleBalance = wallet ? balance : null;

  return (
    <div className="rounded-[1.75rem] border border-black/10 bg-[#fff8eb] p-5">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">Your position</p>
      <div className="mt-3 text-3xl font-semibold text-black">
        {visibleBalance == null ? "--" : formatTokenAmount(visibleBalance, 4)}
      </div>
      <p className="mt-1 text-sm text-black/55">{token.symbol} balance</p>
      <div className="mt-5 rounded-[1.25rem] bg-white px-4 py-3 text-sm text-black/60">
        {enabled && wallet ? `Wallet ${formatAddress(wallet.address)}` : "Connect Privy to load balances from Solana RPC"}
      </div>
    </div>
  );
}

export function PositionCard({ token }: { token: TokenSummary }) {
  const enabled = usePrivyEnabled();

  if (!enabled) {
    return (
      <div className="rounded-[1.75rem] border border-black/10 bg-[#fff8eb] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">Your position</p>
        <div className="mt-3 text-3xl font-semibold text-black">--</div>
        <p className="mt-1 text-sm text-black/55">Add Privy + Alchemy env vars to load wallet balances</p>
      </div>
    );
  }

  return <EnabledPositionCard token={token} />;
}
