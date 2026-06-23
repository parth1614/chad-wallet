# ChadWallet Web Screen

Next.js build for the ChadWallet founding-engineer screen.

## Includes

- FOMO-style landing page with ChadWallet-inspired branding
- Rotating token banners that deep-link into `/trade/[token]`
- Bonus trading page with trending list, token detail, chart, holders, recent trades, quote panel, and position panel
- Privy auth shell for Apple / Google login
- BirdEye-backed market data adapters with seeded fallback data
- Jupiter quote preview route
- Alchemy-backed Solana wallet balance route
- Supabase-ready schema and server-only helpers

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Required env vars

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
PRIVY_APP_ID=
PRIVY_CLIENT_ID=
JUPITER_API_KEY=
BIRDEYE_API_KEY=
ALCHEMY_RPC_URL=
```

The app still renders without keys so the UI can be reviewed before final service access is added.

## Build modes

- `npm run build:next` builds the plain Next.js app
- `npm run build` builds the OpenNext Cloudflare worker and packages a Sites-ready `dist/` directory

## Supabase

Apply [schema.sql](/Users/root-parth/Documents/ChadWallet/supabase/schema.sql) to create the starter `profiles`, `watchlists`, and `positions` tables.

Helpers:

- [server.ts](/Users/root-parth/Documents/ChadWallet/src/lib/supabase/server.ts)

## Official docs used

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Privy React setup](https://docs.privy.io/basics/react/setup)
- [Privy Solana recipe](https://docs.privy.io/recipes/solana/getting-started-with-privy-and-solana)
- [BirdEye docs](https://docs.birdeye.so/)
- [BirdEye trending tokens](https://docs.birdeye.so/docs/trending-tokens)
- [BirdEye token overview](https://docs.birdeye.so/reference/get-defi-token_overview)
- [BirdEye token holders](https://docs.birdeye.so/reference/get-defi-v3-token-holder)
- [BirdEye OHLCV v3](https://docs.birdeye.so/reference/get-defi-v3-ohlcv)
- [BirdEye endpoint availability](https://docs.birdeye.so/docs/data-accessibility-by-packages)
- [Jupiter swap docs](https://dev.jup.ag/docs/swap)
- [Jupiter migration examples](https://dev.jup.ag/docs/swap/migration/metis-to-meta-aggregator)
- [Alchemy Solana quickstart](https://www.alchemy.com/docs/reference/solana-api-quickstart)
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
