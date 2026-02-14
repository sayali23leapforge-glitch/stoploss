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
        { 
          error: "No active Alice Blue session. Please complete login on Alice Blue first.",
          needsLogin: true,
        },
        { status: 401 }
      );
    }

    console.log('[AliceBlue Sync] Fetching holdings and positions...');

    // Fetch both holdings and positions in parallel
    const [holdings, positions] = await Promise.all([
      aliceBlueIntegration.getHoldings(session),
      aliceBlueIntegration.getPositions(session),
    ]);

    console.log('[AliceBlue Sync] Successfully fetched data:', {
      holdingsCount: holdings.length,
      positionsCount: positions.length,
    });

    return NextResponse.json({
      status: "ok",
      holdings,
      positions,
      syncTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AliceBlue Sync] Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sync data";
    
    // Check if it's a session expiration error
    const isSessionError = errorMessage.toLowerCase().includes('session') ||
                          errorMessage.toLowerCase().includes('token') ||
                          errorMessage.toLowerCase().includes('unauthorized');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        needsLogin: isSessionError,
      },
      { status: isSessionError ? 401 : 500 }
    );
  }
}
