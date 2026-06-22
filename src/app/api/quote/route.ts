import { NextRequest, NextResponse } from "next/server";
import { getJupiterQuote } from "@/lib/market";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const quote = await getJupiterQuote({
    inputMint: searchParams.get("inputMint") ?? undefined,
    outputMint: searchParams.get("outputMint") ?? "",
    amount: searchParams.get("amount") ?? "1",
    taker: searchParams.get("taker") ?? undefined,
  });

  return NextResponse.json({ quote });
}
