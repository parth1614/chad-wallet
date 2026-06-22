import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftRight, Flame, TrendingUp } from "lucide-react";
import { AuthControls } from "@/components/auth/auth-controls";
import { ChartCard } from "@/components/market/chart-card";
import { PositionCard } from "@/components/market/position-card";
import { TokenMarquee } from "@/components/market/token-marquee";
import { TradeComposer } from "@/components/market/trade-composer";
import { getTokenBundle, getTrendingTokens } from "@/lib/market";
import { formatAddress, formatCompactCurrency, formatCurrency, formatPercent, formatTokenAmount, isPositive } from "@/lib/utils";

export default async function TradePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  if (!address) {
    notFound();
  }

  const [bundle, trending] = await Promise.all([getTokenBundle(address), getTrendingTokens()]);
  const token = bundle.summary;

  return (
    <div className="flex min-h-screen flex-col">
      <TokenMarquee tokens={trending} />
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-5 rounded-[2rem] border border-black/10 bg-white/82 px-6 py-5 shadow-[0_18px_60px_rgba(17,17,17,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="font-mono text-xs uppercase tracking-[0.24em] text-black/45">
              Back to landing
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-[-0.05em] text-black">{token.symbol}</h1>
              <div className="rounded-full bg-[#fff1dc] px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] text-black/60">
                Solana
              </div>
              <div
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  isPositive(token.priceChange24h) ? "bg-[#dff8ea] text-[#147a50]" : "bg-[#ffe1dd] text-[#a2392f]"
                }`}
              >
                {formatPercent(token.priceChange24h)}
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
              Live market surface designed for the ChadWallet screening task: trending token rail, price chart, holder concentration, live trade tape,
              Privy auth, and a Jupiter-powered quote card.
            </p>
          </div>

          <AuthControls compact />
        </header>

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="rounded-[2rem] border border-black/10 bg-white/78 p-4 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">Trending now</p>
                <h2 className="mt-2 text-2xl font-semibold text-black">Token runway</h2>
              </div>
              <Flame className="h-5 w-5 text-[#ff7a00]" />
            </div>

            <div className="mt-5 space-y-3">
              {trending.map((item) => (
                <Link
                  key={item.address}
                  href={`/trade/${item.address}`}
                  className={`block rounded-[1.5rem] border px-4 py-4 transition ${
                    item.address === token.address
                      ? "border-black bg-black text-white"
                      : "border-black/8 bg-[#fcf7ef] text-black hover:border-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.symbol}</span>
                    <span className="font-mono text-xs opacity-65">#{item.rank ?? "--"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm opacity-70">
                    <span>{formatCurrency(item.price, 6)}</span>
                    <span className={isPositive(item.priceChange24h) ? "text-[#8ef0bc]" : "text-[#ff998f]"}>
                      {formatPercent(item.priceChange24h)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-black/10 bg-[#111111] p-5 text-white shadow-[0_30px_80px_rgba(17,17,17,0.16)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/40">Token overview</p>
                  <h2 className="mt-2 text-3xl font-black">{token.name}</h2>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/38">{formatAddress(token.address, 6, 6)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Price", value: formatCurrency(token.price, 6) },
                    { label: "Volume 24h", value: formatCompactCurrency(token.volume24h) },
                    { label: "Liquidity", value: formatCompactCurrency(token.liquidity) },
                    { label: "Market cap", value: formatCompactCurrency(token.marketCap) },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
                      <p className="mt-2 text-lg font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <ChartCard data={bundle.chart} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">Holders</p>
                    <h3 className="mt-2 text-2xl font-semibold text-black">Top concentration</h3>
                  </div>
                  <TrendingUp className="h-5 w-5 text-[#ff7a00]" />
                </div>
                <div className="mt-5 space-y-3">
                  {bundle.holders.map((holder, index) => (
                    <div key={`${holder.owner}-${index}`} className="rounded-[1.4rem] bg-[#fcf7ef] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-black/42">#{index + 1}</span>
                        <span className="text-sm font-semibold text-black">{holder.percentage.toFixed(2)}%</span>
                      </div>
                      <div className="mt-2 text-sm text-black/66">{formatAddress(holder.owner, 6, 5)}</div>
                      <div className="mt-2 text-lg font-semibold text-black">{formatTokenAmount(holder.amount, 2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">Live trades</p>
                    <h3 className="mt-2 text-2xl font-semibold text-black">Recent tape</h3>
                  </div>
                  <ArrowLeftRight className="h-5 w-5 text-[#ff7a00]" />
                </div>

                <div className="mt-5 space-y-3">
                  {bundle.trades.map((trade) => (
                    <div key={trade.signature} className="rounded-[1.4rem] bg-[#fcf7ef] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            trade.side === "buy" ? "bg-[#dff8ea] text-[#147a50]" : "bg-[#ffe1dd] text-[#a2392f]"
                          }`}
                        >
                          {trade.side}
                        </span>
                        <span className="font-mono text-xs text-black/40">
                          {new Date(trade.timestamp * 1000).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-black/60">{formatAddress(trade.owner, 6, 5)}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-semibold text-black">{formatCurrency(trade.amountUsd)}</span>
                        <span className="text-sm text-black/55">{formatTokenAmount(trade.tokenAmount, 0)} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <TradeComposer token={token} />
            <PositionCard token={token} />
          </aside>
        </div>
      </main>
      <TokenMarquee tokens={trending} reverse />
    </div>
  );
}
