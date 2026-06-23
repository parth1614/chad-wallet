import type { ChartCandle, TokenDetailBundle, TokenSummary } from "@/lib/types";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export const sampleTrendingTokens: TokenSummary[] = [
  {
    address: "9Wxf7ssZdJfjr4ArFJ5pW9VkhkiSNkWv85FrhxbSBAGS",
    symbol: "ASTEROID",
    name: "Asteroid",
    logo: "https://ipfs.io/ipfs/bafybeicincod6gebb2wkef7mtlibmz6scduj25lxjlk75qv3o4mpxwdfau",
    price: 0.00284,
    priceChange24h: 38.45,
    liquidity: 540000,
    volume24h: 4100000,
    marketCap: 2840000,
    holders: 22871,
    rank: 1,
  },
  {
    address: "7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm",
    symbol: "ZERO",
    name: "Zero Day",
    logo: "https://desperate-moccasin-minnow.myfilebase.com/ipfs/QmWZUwFQEKzpmSbNTu7rUTiDoZRpXGzZHfCoNTzVSAPg2e",
    price: 0.00042,
    priceChange24h: -10.91,
    liquidity: 390000,
    volume24h: 1600000,
    marketCap: 1330000,
    holders: 12443,
    rank: 2,
  },
  {
    address: "6p6xgHyF7AeTwr2S2yBEtDh9nWqT7bk4P8GHWxirMRH9",
    symbol: "JOT",
    name: "Jotchua",
    logo: "https://thumbnails.padre.gg/SOLANA-9Wxf7ssZdJfjr4ArFJ5pW9VkhkiSNkWv85FrhxbSBAGS",
    price: 0.00651,
    priceChange24h: 43.52,
    liquidity: 850000,
    volume24h: 9800000,
    marketCap: 6510000,
    holders: 45602,
    rank: 3,
  },
  {
    address: "4W1ReeZrH8T7p6m6U6vVQxGk7tWW8L7NobXfrC8td4p6",
    symbol: "QAI",
    name: "Quantum AI",
    logo: "https://ipfs.io/ipfs/bafybeicwofjcasp6knvu6fywdc7gg4mnplm5w2gqeugybmf5gk26ku7mji",
    price: 0.0136,
    priceChange24h: 19.05,
    liquidity: 740000,
    volume24h: 7200000,
    marketCap: 13600000,
    holders: 39021,
    rank: 4,
  },
  {
    address: "6YMEjhB2F7VjNW22QK8YxKV9sF8aqkTawxjUY8ailqXF",
    symbol: "PUMP",
    name: "Pump King",
    logo: "https://ipfs.io/ipfs/bafkreidx4yolxcpsmrercofwydwat7rfoq6hik7tcg4m4ius5ut66z3d7e",
    price: 0.00118,
    priceChange24h: 11.28,
    liquidity: 460000,
    volume24h: 4300000,
    marketCap: 1180000,
    holders: 17500,
    rank: 5,
  },
  {
    address: "7QnTqfBXCMVvjJAnCmvYzu3PV6PvJEa3TBUnVJQGryuV",
    symbol: "KIRBY",
    name: "Kirby Coin",
    logo: "https://desperate-moccasin-minnow.myfilebase.com/ipfs/QmYbU16bnFL58k86K3hrWitLpTWq5JrzB88jkXafbhDEFs",
    price: 0.000084,
    priceChange24h: 10.89,
    liquidity: 255000,
    volume24h: 2800000,
    marketCap: 840000,
    holders: 9803,
    rank: 6,
  },
];

export function createFallbackTokenSummary(address: string): TokenSummary {
  const short = address.slice(0, 4).toUpperCase();

  return {
    address,
    symbol: short || "TOKEN",
    name: `Token ${short || "Fallback"}`,
    logo: "",
    price: 0.000001,
    priceChange24h: 0,
    liquidity: 0,
    volume24h: 0,
    marketCap: 0,
    holders: 0,
    rank: 0,
    fdv: 0,
  };
}

function createChart(basePrice: number): ChartCandle[] {
  return Array.from({ length: 24 }, (_, index) => {
    const drift = Math.sin(index / 3) * basePrice * 0.12;
    const move = (index - 12) * basePrice * 0.004;
    const open = Number((basePrice + drift + move).toFixed(6));
    const close = Number((open * (1 + Math.sin(index / 2.4) * 0.035)).toFixed(6));
    const high = Number((Math.max(open, close) * 1.045).toFixed(6));
    const low = Number((Math.min(open, close) * 0.955).toFixed(6));

    return {
      time: Math.floor(Date.now() / 1000) - (23 - index) * 3600,
      open,
      high,
      low,
      close,
      volume: Math.round(65000 + index * 3800 + Math.abs(Math.sin(index)) * 18000),
    };
  });
}

export function getSampleTokenBundle(address: string, summaryOverride?: TokenSummary): TokenDetailBundle {
  const summary =
    summaryOverride ??
    sampleTrendingTokens.find((token) => token.address === address) ??
    createFallbackTokenSummary(address);

  return {
    summary,
    chart: createChart(summary.price),
    holders: Array.from({ length: 8 }, (_, index) => ({
      owner: `${summary.address.slice(0, 8)}holder${index + 1}`,
      amount: 1200000 / (index + 1),
      percentage: Number((8.7 / (index + 1)).toFixed(2)),
      valueUsd: summary.price * (1200000 / (index + 1)),
    })),
    trades: Array.from({ length: 12 }, (_, index) => ({
      signature: `${summary.address.slice(0, 8)}trade${index}`,
      side: index % 3 === 0 ? "sell" : "buy",
      owner: `${summary.address.slice(0, 5)}trader${index}`,
      amountUsd: 500 + index * 380,
      tokenAmount: 90000 - index * 2400,
      price: summary.price * (1 + index * 0.003),
      timestamp: Math.floor(Date.now() / 1000) - index * 240,
    })),
  };
}
