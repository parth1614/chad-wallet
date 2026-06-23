import Image from "next/image";
import Link from "next/link";
import { CandlestickChart, Download, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AuthControls } from "@/components/auth/auth-controls";
import { TokenMarquee } from "@/components/market/token-marquee";
import { getTrendingTokens } from "@/lib/market";
import { formatCompactCurrency } from "@/lib/utils";

const APPLE_LINK = "https://apps.apple.com/us/app/chadwallet/id6757367474";
const PLAY_LINK = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

const appStoreAssets = [
  { src: "/brand/app-store/splash.png", alt: "ChadWallet splash screen" },
  { src: "/brand/app-store/discover.png", alt: "ChadWallet discover screen" },
  { src: "/brand/app-store/search.png", alt: "ChadWallet search screen" },
  { src: "/brand/app-store/token.png", alt: "ChadWallet token screen" },
  { src: "/brand/app-store/portfolio.png", alt: "ChadWallet portfolio screen" },
  { src: "/brand/app-store/deposit.png", alt: "ChadWallet deposit screen" },
  { src: "/brand/app-store/launch.png", alt: "ChadWallet launch screen" },
  { src: "/brand/app-store/kol.png", alt: "ChadWallet KOL screen" },
  { src: "/brand/app-store/x.png", alt: "ChadWallet X screen" },
];

const flowAssets = [
  { src: "/brand/flow/launch-4.png", alt: "ChadWallet launch campaign" },
  { src: "/brand/flow/memecoin-4.png", alt: "ChadWallet memecoin campaign" },
  { src: "/brand/flow/portfolio-4.png", alt: "ChadWallet portfolio campaign" },
  { src: "/brand/flow/buy-sell-4.png", alt: "ChadWallet buy sell campaign" },
  { src: "/brand/flow/kol-4.png", alt: "ChadWallet KOL campaign" },
  { src: "/brand/flow/relaunch-4.png", alt: "ChadWallet relaunch campaign" },
];

export default async function Home() {
  const tokens = await getTrendingTokens();
  const spotlight = tokens[0];

  return (
    <div className="flex flex-1 flex-col">
      <TokenMarquee tokens={tokens} />
      <main className="noise mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-[2.2rem] border border-black/10 bg-white/78 px-6 py-5 shadow-[0_24px_90px_rgba(17,17,17,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/chadwallet-dark.png"
              alt="ChadWallet"
              width={176}
              height={40}
              className="h-10 w-auto"
              priority
            />
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
              Sign in with Google through Privy, catch rotating runners, and jump straight into a live trade page.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={APPLE_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e96f00] hover:text-white"
              >
                Download iPhone app
              </a>
              <a
                href={PLAY_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0b65d8] bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#edf5ff] hover:text-black"
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
                <Image
                  src="/brand/chadwallet-light.png"
                  alt="ChadWallet"
                  width={176}
                  height={40}
                  className="h-9 w-auto"
                />
                <Link
                  href={`/trade/${spotlight.address}`}
                  className="rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open trade
                </Link>
              </div>

              <div className="mt-5 overflow-hidden rounded-[1.8rem] border border-white/10">
                <Image
                  src="/brand/flow/launch-4.png"
                  alt="ChadWallet launch screen"
                  width={3840}
                  height={2160}
                  className="h-auto w-full"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                  <Image
                    src="/brand/flow/memecoin-4.png"
                    alt="ChadWallet memecoin discovery screen"
                    width={3840}
                    height={2160}
                    className="h-auto w-full"
                  />
                </div>
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                  <Image
                    src="/brand/flow/portfolio-4.png"
                    alt="ChadWallet portfolio screen"
                    width={3840}
                    height={2160}
                    className="h-auto w-full"
                  />
                </div>
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
              description: "Google auth is wired through Privy, with Solana embedded-wallet support ready as soon as the app keys are added.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-black/10 bg-white/72 p-6 shadow-[0_20px_60px_rgba(17,17,17,0.06)]">
              <feature.icon className="h-6 w-6 text-[#ff7a00]" />
              <h2 className="mt-5 text-2xl font-semibold text-black">{feature.title}</h2>
              <p className="mt-3 text-base leading-7 text-black/63">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-[2.2rem] border border-black/10 bg-white/78 p-5 shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
            <div className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-black">
              <video
                autoPlay
                className="h-auto w-full"
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src="/brand/video/chadwallet.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">Official brand motion</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-black">Real ChadWallet product footage, not reconstructed mockups.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/62">
              The page now uses the actual launch video plus the exported App Store and growth-flow assets from the shared Drive folder, so the screen reads like ChadWallet rather than a generic crypto landing page.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">App Store set</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-black">Every product screen from the share pack.</h2>
            </div>
            <a
              href={APPLE_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#fff1dc] hover:text-black"
            >
              View iPhone listing
            </a>
          </div>

          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {appStoreAssets.map((asset) => (
              <div
                key={asset.src}
                className="min-w-[220px] overflow-hidden rounded-[2rem] border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(17,17,17,0.07)]"
              >
                <Image
                  src={asset.src}
                  alt={asset.alt}
                  width={1242}
                  height={2688}
                  className="h-[420px] w-auto rounded-[1.5rem]"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/45">Flow assets</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-black">Campaign-grade visuals for discovery, launches, and trading.</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {flowAssets.map((asset) => (
              <div
                key={asset.src}
                className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#111111] p-3 shadow-[0_20px_60px_rgba(17,17,17,0.12)]"
              >
                <Image
                  src={asset.src}
                  alt={asset.alt}
                  width={3840}
                  height={2160}
                  className="h-auto w-full rounded-[1.4rem]"
                />
              </div>
            ))}
          </div>
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

            <div className="flex flex-col items-start gap-4">
              <Image
                src="/brand/chadwallet-light.png"
                alt="ChadWallet"
                width={176}
                height={40}
                className="h-10 w-auto"
              />
              <Link
                href={`/trade/${spotlight.address}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ea6f00]"
              >
                Open live preview
                <Download className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <TokenMarquee tokens={tokens} reverse />
    </div>
  );
}
