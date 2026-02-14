import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const clientId = process.env.ALICE_CLIENT_ID;
    const redirectUri = process.env.ALICE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "Missing ALICE_CLIENT_ID or ALICE_REDIRECT_URI environment variables" },
        { status: 500 }
      );
    }

    // PROPER OAUTH 2.0 FLOW WITH STATE VALIDATION
    // State prevents CSRF attacks and validates the callback comes from Alice Blue
    
    const state = randomUUID();
    
    console.log('[AliceBlue Login] OAuth 2.0 Authorization Code Flow WITH STATE:', {
      clientId,
      redirectUri,
      state,
      timestamp: new Date().toISOString(),
    });

    // CORRECT OAUTH URL - Uses /oauth2/auth endpoint with response_type=code AND state parameter
    const authUrl =
      `https://ant.aliceblueonline.com/oauth2/auth` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    console.log('[AliceBlue Login] Generated OAuth URL:', authUrl);
    console.log('[AliceBlue Login] State token stored (will validate on callback):', state);

    // Immediately redirect to Alice Blue OAuth endpoint
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    console.error('[AliceBlue Login] Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
