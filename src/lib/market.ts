import "server-only";

import type {
  ChartCandle,
  ChartInterval,
  JupiterQuote,
  JupiterSwapTransaction,
  TokenDetailBundle,
  TokenHolder,
  TokenSummary,
  TokenTrade,
} from "@/lib/types";
import { SOL_MINT, createFallbackTokenSummary, getSampleTokenBundle, sampleTrendingTokens } from "@/lib/sample-data";

const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";
const JUPITER_BASE_URL = "https://api.jup.ag";

function birdeyeHeaders() {
  const apiKey = process.env.BIRDEYE_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    accept: "application/json",
    "x-api-key": apiKey,
    "x-chain": "solana",
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function mapTokenSummary(item: Record<string, unknown>, fallbackRank?: number): TokenSummary {
  return {
    address: String(item.address ?? item.mint ?? ""),
    symbol: String(item.symbol ?? item.name ?? "TOKEN"),
    name: String(item.name ?? item.symbol ?? "Unknown token"),
    logo: String(item.logo_uri ?? item.logoURI ?? item.logo ?? ""),
    price: Number(item.price ?? item.value ?? 0),
    priceChange24h: Number(item.price24hChangePercent ?? item.price_change_24h_percent ?? item.priceChange24h ?? 0),
    liquidity: Number(item.liquidity ?? item.liquidityUsd ?? 0),
    volume24h: Number(item.v24hUSD ?? item.volume24hUSD ?? item.volume_24h_usd ?? item.volume24h ?? 0),
    marketCap: Number(item.mc ?? item.marketCap ?? item.marketcap ?? 0),
    decimals: Number(item.decimals ?? item.tokenDecimals ?? item.token_decimals ?? 9),
    holders: Number(item.holder ?? item.holders ?? 0),
    rank: Number(item.rank ?? fallbackRank ?? 0),
    fdv: Number(item.fdv ?? item.fdvUsd ?? item.marketCap ?? 0),
  };
}

function mapHolder(item: Record<string, unknown>): TokenHolder {
  return {
    owner: String(item.owner ?? item.address ?? ""),
    amount: Number(item.ui_amount ?? item.amount ?? 0),
    percentage: Number(item.percentage ?? item.share ?? 0),
    valueUsd: Number(item.value_usd ?? item.valueUsd ?? 0),
  };
}

function mapTrade(item: Record<string, unknown>): TokenTrade {
  return {
    signature: String(item.signature ?? item.txHash ?? item.tx_hash ?? crypto.randomUUID()),
    side: String(item.side ?? item.tx_type ?? "buy").toLowerCase() === "sell" ? "sell" : "buy",
    owner: String(item.owner ?? item.source_owner ?? item.wallet ?? ""),
    amountUsd: Number(item.volume_usd ?? item.amount_usd ?? item.amountUsd ?? 0),
    tokenAmount: Number(item.base_amount ?? item.tokenAmount ?? item.amount ?? 0),
    price: Number(item.price ?? 0),
    timestamp: Number(item.block_unix_time ?? item.unix_time ?? item.timestamp ?? Math.floor(Date.now() / 1000)),
  };
}

function getChartWindow(interval: ChartInterval) {
  const now = Math.floor(Date.now() / 1000);

  switch (interval) {
    case "15m":
      return { type: "15m", timeFrom: now - 60 * 60 * 12, timeTo: now };
    case "4H":
      return { type: "4H", timeFrom: now - 60 * 60 * 24 * 14, timeTo: now };
    case "1D":
      return { type: "1D", timeFrom: now - 60 * 60 * 24 * 90, timeTo: now };
    case "1H":
    default:
      return { type: "1H", timeFrom: now - 60 * 60 * 24 * 5, timeTo: now };
  }
}

function mapChartCandle(item: Record<string, unknown>): ChartCandle {
  return {
    time: Number(item.unixTime ?? item.time ?? item.unix_time ?? 0),
    open: Number(item.o ?? item.open ?? item.value ?? 0),
    high: Number(item.h ?? item.high ?? item.value ?? 0),
    low: Number(item.l ?? item.low ?? item.value ?? 0),
    close: Number(item.c ?? item.close ?? item.value ?? 0),
    volume: Number(item.v ?? item.volume ?? item.baseVolume ?? 0),
  };
}

export async function getTrendingTokens(): Promise<TokenSummary[]> {
  const headers = birdeyeHeaders();

  if (!headers) {
    return sampleTrendingTokens;
  }

  try {
    const data = await fetchJson<{ data?: { tokens?: Record<string, unknown>[] } }>(
      `${BIRDEYE_BASE_URL}/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=8`,
      { headers },
    );

    const tokens = data.data?.tokens ?? [];
    if (!tokens.length) {
      return sampleTrendingTokens;
    }

    return tokens.map((token, index) => mapTokenSummary(token, index + 1));
  } catch {
    return sampleTrendingTokens;
  }
}

export async function getTokenBundle(address: string): Promise<TokenDetailBundle> {
  const headers = birdeyeHeaders();
  const fallbackSummary = sampleTrendingTokens.find((token) => token.address === address) ?? createFallbackTokenSummary(address);

  if (!headers) {
    return getSampleTokenBundle(address, fallbackSummary);
  }

  try {
    const initialChart = getChartWindow("1H");
    const [overview, holders, trades, chart] = await Promise.all([
      fetchJson<{ data?: Record<string, unknown> }>(
        `${BIRDEYE_BASE_URL}/defi/token_overview?address=${address}`,
        { headers },
      ),
      fetchJson<{ data?: { items?: Record<string, unknown>[]; holders?: Record<string, unknown>[] } }>(
        `${BIRDEYE_BASE_URL}/defi/v3/token/holder?address=${address}&offset=0&limit=8`,
        { headers },
      ),
      fetchJson<{ data?: { items?: Record<string, unknown>[]; trades?: Record<string, unknown>[] } }>(
        `${BIRDEYE_BASE_URL}/defi/v3/token/txs?address=${address}&offset=0&limit=12`,
        { headers },
      ),
      fetchJson<{ data?: { items?: Record<string, unknown>[] } }>(
        `${BIRDEYE_BASE_URL}/defi/v3/ohlcv?address=${address}&type=${initialChart.type}&time_from=${initialChart.timeFrom}&time_to=${initialChart.timeTo}`,
        { headers },
      ),
    ]);

    const fallback = getSampleTokenBundle(address, fallbackSummary);
    const chartItems = chart.data?.items ?? [];

    const overviewSummary = mapTokenSummary(overview.data ?? {}, fallback.summary.rank);
    const summary = {
      ...fallback.summary,
      ...overviewSummary,
      address: overviewSummary.address || fallback.summary.address,
      symbol: overviewSummary.symbol || fallback.summary.symbol,
      name: overviewSummary.name || fallback.summary.name,
      price: overviewSummary.price || fallback.summary.price,
    };

    return {
      summary,
      holders: (holders.data?.items ?? holders.data?.holders ?? []).map(mapHolder),
      trades: (trades.data?.items ?? trades.data?.trades ?? []).map(mapTrade),
      chart: chartItems.length ? chartItems.map(mapChartCandle) : fallback.chart,
    };
  } catch {
    return getSampleTokenBundle(address, fallbackSummary);
  }
}

export async function getTokenChart(address: string, interval: ChartInterval = "1H"): Promise<ChartCandle[]> {
  const headers = birdeyeHeaders();
  const fallback = getSampleTokenBundle(address, sampleTrendingTokens.find((token) => token.address === address) ?? createFallbackTokenSummary(address)).chart;

  if (!headers) {
    return fallback;
  }

  const chartWindow = getChartWindow(interval);

  try {
    const chart = await fetchJson<{ data?: { items?: Record<string, unknown>[] } }>(
      `${BIRDEYE_BASE_URL}/defi/v3/ohlcv?address=${address}&type=${chartWindow.type}&time_from=${chartWindow.timeFrom}&time_to=${chartWindow.timeTo}`,
      { headers },
    );

    const chartItems = chart.data?.items ?? [];
    return chartItems.length ? chartItems.map(mapChartCandle) : fallback;
  } catch {
    return fallback;
  }
}

export async function getJupiterQuote(params: {
  inputMint?: string;
  outputMint: string;
  amount: string;
  taker?: string;
  slippageBps?: number;
}): Promise<JupiterQuote | null> {
  const apiKey = process.env.JUPITER_API_KEY;

  if (!apiKey) {
    return {
      inputMint: params.inputMint ?? SOL_MINT,
      outputMint: params.outputMint,
      inAmount: params.amount,
      outAmount: String(Math.floor(Number(params.amount) * 0.93)),
      priceImpactPct: "0.42",
      routePlan: [],
    };
  }

  const search = new URLSearchParams({
    inputMint: params.inputMint ?? SOL_MINT,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps ?? 50),
  });

  if (params.taker) {
    search.set("taker", params.taker);
  }

  try {
    return await fetchJson<JupiterQuote>(`${JUPITER_BASE_URL}/swap/v1/quote?${search}`, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    });
  } catch {
    return null;
  }
}

export async function getJupiterSwapTransaction(params: {
  quoteResponse: JupiterQuote;
  userPublicKey: string;
}): Promise<JupiterSwapTransaction | null> {
  const apiKey = process.env.JUPITER_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    return await fetchJson<JupiterSwapTransaction>(`${JUPITER_BASE_URL}/swap/v1/swap`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        quoteResponse: params.quoteResponse,
        userPublicKey: params.userPublicKey,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1_000_000,
            priorityLevel: "veryHigh",
          },
        },
      }),
    });
  } catch {
    return null;
  }
}

export async function getWalletTokenBalances(walletAddress: string) {
  const rpcUrl = process.env.ALCHEMY_RPC_URL;

  if (!rpcUrl) {
    return [];
  }

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          walletAddress,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" },
        ],
      }),
      next: { revalidate: 15 },
    });

    const payload = (await response.json()) as {
      result?: {
        value?: Array<{
          pubkey: string;
          account?: {
            data?: {
              parsed?: {
                info?: {
                  mint?: string;
                  tokenAmount?: { uiAmount?: number };
                };
              };
            };
          };
        }>;
      };
    };

    return payload.result?.value?.map((item) => ({
      account: item.pubkey,
      mint: item.account?.data?.parsed?.info?.mint ?? "",
      balance: item.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0,
    })) ?? [];
  } catch {
    return [];
  }
}
