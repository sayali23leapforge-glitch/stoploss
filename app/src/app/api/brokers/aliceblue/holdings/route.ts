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

    const holdings = await aliceBlueIntegration.getHoldings(session);
    
    return NextResponse.json({
      status: "ok",
      holdings,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch holdings";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
