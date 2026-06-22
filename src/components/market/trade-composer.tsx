"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyEnabled } from "@/components/providers/privy-provider";
import { SOL_MINT } from "@/lib/sample-data";
import type { TokenSummary } from "@/lib/types";
import { cn, formatAddress, formatCurrency, formatTokenAmount } from "@/lib/utils";

type QuoteResponse = {
  quote: {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    priceImpactPct?: string;
  } | null;
};

function EnabledTradeComposer({ token }: { token: TokenSummary }) {
  const enabled = usePrivyEnabled();
  const { authenticated, user } = usePrivy();
  const [amount, setAmount] = useState("0.25");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quote, setQuote] = useState<QuoteResponse["quote"] | null>(null);
  const [loading, setLoading] = useState(false);

  const solanaWallet = useMemo(
    () =>
      user?.linkedAccounts.find(
        (account) => account.type === "wallet" && account.chainType === "solana",
      ) as { address: string } | undefined,
    [user?.linkedAccounts],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);

      const lamports = Math.max(1, Math.floor(Number(amount || "0") * 1_000_000_000));
      const query = new URLSearchParams({
        inputMint: side === "buy" ? SOL_MINT : token.address,
        outputMint: side === "buy" ? token.address : SOL_MINT,
        amount: String(lamports),
      });

      if (solanaWallet?.address) {
        query.set("taker", solanaWallet.address);
      }

      try {
        const response = await fetch(`/api/quote?${query}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as QuoteResponse;
        setQuote(data.quote);
      } catch {
        setQuote(null);
      } finally {
        setLoading(false);
      }
    }

    void run();
    return () => controller.abort();
  }, [amount, side, solanaWallet?.address, token.address]);

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_25px_70px_rgba(17,17,17,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-black/45">Trade</p>
          <h3 className="mt-2 text-xl font-semibold text-black">Buy or sell in one flow</h3>
        </div>
        <div className="rounded-full bg-[#fff1dc] px-3 py-1 font-mono text-xs text-black/65">
          Solana
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-[#f4ede2] p-1">
        {(["buy", "sell"] as const).map((value) => (
          <button
            key={value}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              side === value ? "bg-black text-white" : "text-black/60",
            )}
            onClick={() => setSide(value)}
            type="button"
          >
            {value === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-xs uppercase tracking-[0.24em] text-black/40">
          Amount
        </span>
        <div className="rounded-[1.5rem] border border-black/10 bg-[#fcf8f0] px-4 py-4">
          <input
            className="w-full bg-transparent text-2xl font-semibold text-black outline-none"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
          />
          <p className="mt-2 text-sm text-black/50">{side === "buy" ? "SOL in" : `${token.symbol} in`}</p>
        </div>
      </label>

      <div className="mt-5 rounded-[1.5rem] bg-[#111111] p-4 text-white">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Estimated receive</span>
          <span>{loading ? "Refreshing..." : "Jupiter quote"}</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">
          {quote ? formatTokenAmount(Number(quote.outAmount) / 1_000_000_000, 4) : "--"}{" "}
          <span className="text-base text-white/55">{side === "buy" ? token.symbol : "SOL"}</span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-white/60">
          <div className="flex items-center justify-between">
            <span>Price impact</span>
            <span>{quote?.priceImpactPct ? `${quote.priceImpactPct}%` : "--"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Marked price</span>
            <span>{formatCurrency(token.price, 6)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Wallet</span>
            <span>{solanaWallet ? formatAddress(solanaWallet.address) : "Not connected"}</span>
          </div>
        </div>
      </div>

      <button
        className={cn(
          "mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold transition",
          enabled && authenticated
            ? "bg-[#ff7a00] text-white hover:bg-[#ea6f00]"
            : "bg-black text-white/70",
        )}
        disabled={!enabled || !authenticated}
        type="button"
      >
        {enabled && authenticated ? `${side === "buy" ? "Buy" : "Sell"} ${token.symbol}` : "Connect Privy to trade"}
      </button>

      <p className="mt-3 text-xs leading-5 text-black/45">
        This panel already requests live Jupiter quotes. Once your Privy and Jupiter env vars are added, the final
        transaction signing flow can be enabled against the connected Solana wallet.
      </p>
    </div>
  );
}

export function TradeComposer({ token }: { token: TokenSummary }) {
  const enabled = usePrivyEnabled();

  if (!enabled) {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_25px_70px_rgba(17,17,17,0.08)]">
        <div className="rounded-[1.5rem] bg-[#111111] p-5 text-white">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Trade</p>
          <h3 className="mt-3 text-2xl font-semibold">Privy key needed</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            The quote engine is ready, but sign-in and wallet-aware trading stay disabled until `NEXT_PUBLIC_PRIVY_APP_ID`
            is configured.
          </p>
        </div>
      </div>
    );
  }

  return <EnabledTradeComposer token={token} />;
}
