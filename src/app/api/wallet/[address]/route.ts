import { NextResponse } from "next/server";
import { getWalletTokenBalances } from "@/lib/market";

export async function GET(
  _: Request,
  context: { params: Promise<{ address: string }> },
) {
  const { address } = await context.params;
  const balances = await getWalletTokenBalances(address);
  return NextResponse.json({ balances });
}
