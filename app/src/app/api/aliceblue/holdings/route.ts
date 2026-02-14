import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSession } from "@/lib/store";
import { aliceBlueIntegration } from "@/lib/brokers/alice-blue";

export async function GET() {
  try {
    const userId = await requireUserId();
    const session = getAliceBlueSession(userId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated. Please login with Alice Blue first." },
        { status: 401 }
      );
    }

    console.log('[AliceBlue Holdings] Fetching holdings for user...');

    const holdings = await aliceBlueIntegration.getHoldings(session);
    
    console.log('[AliceBlue Holdings] Successfully fetched', holdings.length, 'holdings');

    return NextResponse.json({
      status: "ok",
      holdings,
      userId: session.userId,
    });
  } catch (error) {
    console.error('[AliceBlue Holdings] Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch holdings";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
