import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

export async function GET() {
  return NextResponse.json({ ok: true, methods: ["POST"], description: "Submit a signed Jupiter swap transaction." });
}

export async function POST(request: NextRequest) {
  const rpcUrl = process.env.ALCHEMY_RPC_URL;

  if (!rpcUrl) {
    return NextResponse.json({ error: "RPC endpoint not configured." }, { status: 500 });
  }

  const body = (await request.json()) as {
    signedTransaction?: string;
  };

  if (!body.signedTransaction) {
    return NextResponse.json({ error: "Missing signed transaction." }, { status: 400 });
  }

  try {
    const connection = new Connection(rpcUrl, "confirmed");
    const rawTransaction = Uint8Array.from(atob(body.signedTransaction), (char) => char.charCodeAt(0));
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      maxRetries: 2,
    });

    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to submit transaction.",
      },
      { status: 502 },
    );
  }
}
