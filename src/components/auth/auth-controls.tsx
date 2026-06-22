"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyEnabled } from "@/components/providers/privy-provider";
import { cn, formatAddress } from "@/lib/utils";

function EnabledAuthControls({ compact = false }: { compact?: boolean }) {
  const { authenticated, ready, login, logout, user } = usePrivy();
  const solanaWallet = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.chainType === "solana",
  ) as { address: string } | undefined;

  if (!ready) {
    return (
      <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs text-black/60">
        Booting auth...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        className={cn(
          "rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85",
          compact && "px-4 py-2 text-xs",
        )}
        onClick={() => login()}
        type="button"
      >
        Sign in with Apple / Google
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs text-black/70">
        {user?.email?.address ?? user?.google?.email ?? user?.apple?.email ?? "Signed in"}
      </div>
      <Link
        href={solanaWallet ? `/trade/${solanaWallet.address}` : "/trade"}
        className="rounded-full border border-black/10 bg-[#fff1dc] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffe7c0]"
      >
        {solanaWallet ? formatAddress(solanaWallet.address) : "Open trading"}
      </Link>
      <button
        className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
        onClick={() => logout()}
        type="button"
      >
        Log out
      </button>
    </div>
  );
}

export function AuthControls({ compact = false }: { compact?: boolean }) {
  const enabled = usePrivyEnabled();

  if (!enabled) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={cn(
            "rounded-full bg-black px-5 py-3 text-sm font-semibold text-white/70",
            compact && "px-4 py-2 text-xs",
          )}
          disabled
          type="button"
        >
          Add `NEXT_PUBLIC_PRIVY_APP_ID`
        </button>
      </div>
    );
  }

  return <EnabledAuthControls compact={compact} />;
}
