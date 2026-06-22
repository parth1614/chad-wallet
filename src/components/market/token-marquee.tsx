import Link from "next/link";
import type { TokenSummary } from "@/lib/types";
import { cn, formatPercent, isPositive } from "@/lib/utils";

export function TokenMarquee({
  tokens,
  reverse = false,
}: {
  tokens: TokenSummary[];
  reverse?: boolean;
}) {
  const items = [...tokens, ...tokens];

  return (
    <div className="overflow-hidden border-y border-black/10 bg-[#111111] py-3 text-white">
      <div className={cn("flex min-w-max gap-3", reverse ? "marquee-reverse" : "marquee")}>
        {items.map((token, index) => (
          <Link
            key={`${token.address}-${index}`}
            href={`/trade/${token.address}`}
            className="flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 transition hover:bg-white/12"
          >
            <span className="font-mono text-xs text-[#ffd166]">SOL</span>
            <span className="text-sm font-semibold">{token.symbol}</span>
            <span
              className={cn(
                "font-mono text-xs",
                isPositive(token.priceChange24h) ? "text-[#8ef0bc]" : "text-[#ff998f]",
              )}
            >
              {formatPercent(token.priceChange24h)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
