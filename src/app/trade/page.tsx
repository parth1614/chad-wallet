import { redirect } from "next/navigation";
import { getTrendingTokens } from "@/lib/market";

export default async function TradeIndexPage() {
  const [firstToken] = await getTrendingTokens();
  redirect(`/trade/${firstToken.address}`);
}
