export type TokenSummary = {
  address: string;
  symbol: string;
  name: string;
  logo?: string;
  price: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  marketCap: number;
  holders?: number;
  rank?: number;
  fdv?: number;
};

export type TokenHolder = {
  owner: string;
  amount: number;
  percentage: number;
  valueUsd?: number;
};

export type TokenTrade = {
  signature: string;
  side: "buy" | "sell";
  owner: string;
  amountUsd: number;
  tokenAmount: number;
  price: number;
  timestamp: number;
};

export type ChartPoint = {
  time: number;
  value: number;
};

export type JupiterQuote = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct?: string;
  routePlan?: unknown[];
};

export type TokenDetailBundle = {
  summary: TokenSummary;
  holders: TokenHolder[];
  trades: TokenTrade[];
  chart: ChartPoint[];
};
