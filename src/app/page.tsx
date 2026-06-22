import Link from "next/link";
import { ArrowRight, CandlestickChart, Download, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AuthControls } from "@/components/auth/auth-controls";
import { TokenMarquee } from "@/components/market/token-marquee";
import { getTrendingTokens } from "@/lib/market";
import { formatCompactCurrency, formatCurrency, formatPercent, isPositive } from "@/lib/utils";

const APPLE_LINK = "https://apps.apple.com/us/app/chadwallet/id6757367474";
const PLAY_LINK = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export default async function Home() {
  const tokens = await getTrendingTokens();
  const spotlight = tokens[0];

  return (
    <div className="flex flex-1 flex-col">
      <TokenMarquee tokens={tokens} />
      <main className="noise mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-[2.2rem] border border-black/10 bg-white/78 px-6 py-5 shadow-[0_24px_90px_rgba(17,17,17,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="pulse-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lg font-black text-[#ffd166]">
              C
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-black">ChadWallet</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-black/45">Solana trading app</div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm text-black/62">
            <a href="#features" className="rounded-full px-4 py-2 transition hover:bg-black/5">Why Chad</a>
            <a href="#preview" className="rounded-full px-4 py-2 transition hover:bg-black/5">Preview</a>
            <Link href={`/trade/${spotlight.address}`} className="rounded-full px-4 py-2 transition hover:bg-black/5">
              Trade now
            </Link>
          </nav>

          <AuthControls />
        </header>

        <section className="grid gap-8 px-1 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fff1dc] px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-black/60">
              <Sparkles className="h-3.5 w-3.5" />
              Solana, social-first, built for speed
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[0.96] tracking-[-0.05em] text-black sm:text-6xl lg:text-7xl">
              Hunt the next memecoin before the timeline catches up.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
              ChadWallet brings fast discovery, social signal, and one-tap execution into a single Solana-native flow.
              Sign in with Apple or Google through Privy, catch rotating runners, and jump straight into a live trade page.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={APPLE_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Download iPhone app
              </a>
              <a
                href={PLAY_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Download Android app
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Token spotlight", value: spotlight.symbol },
                { label: "24h volume", value: formatCompactCurrency(spotlight.volume24h) },
                { label: "Liquidity", value: formatCompactCurrency(spotlight.liquidity) },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.6rem] border border-black/10 bg-white/70 p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-black/40">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="preview" className="relative">
            <div className="absolute -left-4 top-8 h-32 w-32 rounded-full bg-[#ff7a00]/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#ffd166]/30 blur-3xl" />
            <div className="relative rounded-[2.2rem] border border-black/10 bg-[#111111] p-5 text-white shadow-[0_40px_100px_rgba(17,17,17,0.2)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Chad signal</div>
                  <div className="mt-2 text-3xl font-black">{spotlight.symbol}</div>
                </div>
                <Link
                  href={`/trade/${spotlight.address}`}
                  className="rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open trade
                </Link>
              </div>

              <div className="mt-6 rounded-[1.8rem] bg-[#1d1d1d] p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/38">Price</p>
                    <p className="mt-2 text-3xl font-semibold">{formatCurrency(spotlight.price, 6)}</p>
                  </div>
                  <div className={isPositive(spotlight.priceChange24h) ? "text-[#8ef0bc]" : "text-[#ff998f]"}>
                    {formatPercent(spotlight.priceChange24h)}
                  </div>
                </div>

                <div className="mt-5 h-40 rounded-[1.4rem] bg-gradient-to-b from-[#ff7a00]/30 to-transparent p-4">
                  <div className="flex h-full items-end gap-2">
                    {[34, 28, 38, 52, 47, 55, 66, 58, 72, 74, 78, 84].map((height) => (
                      <div
                        key={height}
                        className="flex-1 rounded-full bg-[#ffd166]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {tokens.slice(0, 4).map((token) => (
                  <Link
                    key={token.address}
                    href={`/trade/${token.address}`}
                    className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{token.symbol}</span>
                      <ArrowRight className="h-4 w-4 text-white/45" />
                    </div>
                    <p className="mt-3 text-sm text-white/52">{formatCurrency(token.price, 6)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 py-8 md:grid-cols-3">
          {[
            {
              icon: CandlestickChart,
              title: "Rotating market heat",
              description: "Top and bottom banners stay alive with trending Solana tokens and deep-link straight into the trade screen.",
            },
            {
              icon: Users,
              title: "Social signal built in",
              description: "Trending lists, holder concentration, and recent trade flow give the page the social-reading edge the mobile app promises.",
            },
            {
              icon: ShieldCheck,
              title: "Privy-based access",
              description: "Apple and Google auth are wired through Privy, with Solana embedded-wallet support ready as soon as the app keys are added.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-black/10 bg-white/72 p-6 shadow-[0_20px_60px_rgba(17,17,17,0.06)]">
              <feature.icon className="h-6 w-6 text-[#ff7a00]" />
              <h2 className="mt-5 text-2xl font-semibold text-black">{feature.title}</h2>
              <p className="mt-3 text-base leading-7 text-black/63">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 rounded-[2.4rem] bg-black px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/45">Bonus trading page</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">The landing page opens right into the market.</h2>
              <p className="mt-4 text-base leading-7 text-white/65">
                No dead-end hero. Every token chip and spotlight CTA routes into `/trade/[token]` where the user gets the chart, holders, live trades,
                quote preview, and position surface.
              </p>
            </div>

            <Link
              href={`/trade/${spotlight.address}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ea6f00]"
            >
              Open live preview
              <Download className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <TokenMarquee tokens={tokens} reverse />
    </div>
  );
}
