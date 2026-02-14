import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originalUrl = request.url;
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // OAuth 2.0 Standard: Authorization endpoint returns 'code' parameter
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    // Log ALL parameters received
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });

    console.log('[AliceBlue OAuth Callback] Received from Alice Blue:', {
      fullUrl: originalUrl,
      code: code?.substring(0, 10) + '...',
      error,
      errorDescription,
      allParams,
      timestamp: new Date().toISOString(),
    });

    // STEP 1: Check for OAuth errors
    if (error) {
      console.error('[AliceBlue OAuth Callback] OAuth Error:', {
        error,
        errorDescription,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.redirect(
        new URL(`/?error=oauth_error&details=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // STEP 2: Validate authorization code
    if (!code) {
      console.error('[AliceBlue OAuth Callback] No authorization code received');
      return NextResponse.redirect(
        new URL('/?error=no_authorization_code', request.url)
      );
    }

    // STEP 3: Exchange authorization code for access token
    const clientId = process.env.ALICE_CLIENT_ID;
    const clientSecret = process.env.ALICE_CLIENT_SECRET;
    const redirectUri = process.env.ALICE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('[AliceBlue OAuth Callback] Missing environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log('[AliceBlue OAuth Callback] Exchanging code for token:', {
      clientId,
      code: code.substring(0, 10) + '...',
      redirectUri,
    });

    // Alice Blue token endpoint - exchange code for access token
    const tokenUrl = "https://ant.aliceblueonline.com/oauth2/token";
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    console.log('[AliceBlue OAuth Callback] Token exchange response:', {
      success: tokenResponse.ok,
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      error: tokenData.error,
      errorDescription: tokenData.error_description,
    });

    // STEP 4: Validate token response
    if (!tokenData.access_token) {
      console.error('[AliceBlue OAuth Callback] Token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL(`/?error=token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || 'Unknown error')}`, request.url)
      );
    }

    const accessToken = tokenData.access_token;

    console.log('[AliceBlue OAuth Callback] Successfully obtained access token');
    console.log('[AliceBlue OAuth Callback] Access token:', accessToken.substring(0, 20) + '...');

    // STEP 5: Fetch holdings data using access token
    console.log('[AliceBlue OAuth Callback] Fetching holdings data...');
    
    const holdingsUrl = "https://ant.aliceblueonline.com/open-api/od/v1/portfolio/getHoldings";
    const holdingsResponse = await fetch(holdingsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const holdingsData = await holdingsResponse.json();

    console.log('[AliceBlue OAuth Callback] Holdings fetch response:', {
      success: holdingsResponse.ok,
      status: holdingsResponse.status,
      hasData: !!holdingsData,
      dataKeys: holdingsData ? Object.keys(holdingsData) : [],
    });

    // STEP 6: Store token in session/secure storage (could use cookies, DB, etc)
    // For now, we'll pass it to the dashboard via URL (NOT SECURE - use secure method in production)
    const response = NextResponse.redirect(
      new URL('/aliceblue?login=success', request.url)
    );

    // Set secure HTTP-only cookie with access token
    response.cookies.set('alice_blue_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600,
      path: '/',
    });

    console.log('[AliceBlue OAuth Callback] Redirecting to dashboard with success');
    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Callback processing failed";
    console.error('[AliceBlue OAuth Callback] Exception:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.redirect(
      new URL(`/?error=callback_exception&details=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
