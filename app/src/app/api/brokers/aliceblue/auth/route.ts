import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSettings, saveAliceBlueSession } from "@/lib/store";
import { loginAndGetSessionId } from "@/lib/aliceblue-client";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const settings = getAliceBlueSettings(userId) as any;

    if (!settings || !settings.apiKey || !settings.apiSecret) {
      return NextResponse.json(
        { error: "Alice Blue settings not found. Please configure your credentials first." },
        { status: 400 }
      );
    }

    // Get credentials from request body
    const body = await request.json() as any;
    const { userId: aliceBlueUserId, password, twoFA } = body;

    if (!aliceBlueUserId || !password || !twoFA) {
      return NextResponse.json(
        { error: "Missing credentials: userId, password, or twoFA" },
        { status: 400 }
      );
    }

    console.log('[AliceBlue Auth] Attempting authentication with credentials:', {
      userId: aliceBlueUserId,
      timestamp: new Date().toISOString(),
    });

    // Call Alice Blue authentication API
    // This will use the encryption key and session ID approach
    const sessionResult = await loginAndGetSessionId({
      userId: aliceBlueUserId,
      apiKey: settings.apiKey as string,
      apiSecret: settings.apiSecret as string,
      password,
      twoFA,
    });

    console.log('[AliceBlue Auth] Authentication successful:', {
      userId: aliceBlueUserId,
      sessionId: sessionResult.sessionId?.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });

    // Save the session for this user
    saveAliceBlueSession(userId, {
      accessToken: sessionResult.sessionId || '',
      userId: aliceBlueUserId,
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      sessionId: sessionResult.sessionId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    console.error('[AliceBlue Auth] Error:', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
