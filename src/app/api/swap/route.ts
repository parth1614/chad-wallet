import { NextRequest, NextResponse } from "next/server";
import { getJupiterQuote, getJupiterSwapTransaction } from "@/lib/market";
import { SOL_MINT } from "@/lib/sample-data";

export async function GET() {
  return NextResponse.json({ ok: true, methods: ["POST"], description: "Prepare a Jupiter swap transaction." });
}

function getRawAmount(amount: string, decimals: number) {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return String(Math.max(1, Math.floor(parsed * 10 ** decimals)));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    amount?: string;
    side?: "buy" | "sell";
    slippageBps?: number;
    tokenAddress?: string;
    tokenDecimals?: number;
    walletAddress?: string;
  };

  if (!body.side || !body.tokenAddress || !body.walletAddress || !body.amount) {
    return NextResponse.json({ error: "Missing swap parameters." }, { status: 400 });
  }

  const inputMint = body.side === "buy" ? SOL_MINT : body.tokenAddress;
  const outputMint = body.side === "buy" ? body.tokenAddress : SOL_MINT;
  const rawAmount = getRawAmount(body.amount, body.side === "buy" ? 9 : body.tokenDecimals ?? 9);

  if (!rawAmount) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const quote = await getJupiterQuote({
    inputMint,
    outputMint,
    amount: rawAmount,
    taker: body.walletAddress,
    slippageBps: body.slippageBps ?? 50,
  });

  if (!quote) {
    return NextResponse.json({ error: "Unable to fetch swap quote." }, { status: 502 });
  }

  const swap = await getJupiterSwapTransaction({
    quoteResponse: quote,
    userPublicKey: body.walletAddress,
  });

  if (!swap) {
    return NextResponse.json({ error: "Unable to build swap transaction.", quote }, { status: 502 });
  }

  return NextResponse.json({ quote, swap });
}
