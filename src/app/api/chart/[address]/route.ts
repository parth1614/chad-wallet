import { NextRequest, NextResponse } from "next/server";
import { getTokenChart } from "@/lib/market";
import type { ChartInterval } from "@/lib/types";

const ALLOWED_INTERVALS = new Set<ChartInterval>(["15m", "1H", "4H", "1D"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  const requestedInterval = request.nextUrl.searchParams.get("interval");
  const interval = ALLOWED_INTERVALS.has(requestedInterval as ChartInterval)
    ? (requestedInterval as ChartInterval)
    : "1H";

  const chart = await getTokenChart(address, interval);

  return NextResponse.json({ chart, interval });
}
