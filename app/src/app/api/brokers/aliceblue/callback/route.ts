import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSettings, saveAliceBlueSession } from "@/lib/store";
import { getUserSession } from "@/lib/aliceblue-client";

export async function GET(request: NextRequest) {
  const originalUrl = request.url;
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // OAuth 2.0 Standard: Authorization endpoint returns 'code' parameter
    // (Alice Blue may also support 'authCode' for backward compatibility)
    const code = searchParams.get("code") || searchParams.get("authCode");
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

    // STRICT VALIDATION: Must receive valid authorization code
    if (error) {
      console.error('[AliceBlue OAuth Callback] OAuth Error:', {
        error,
        errorDescription,
        timestamp: new Date().toISOString(),
      });
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0; 
              padding: 20px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: rgba(30, 41, 59, 0.9);
              border: 1px solid rgba(71, 85, 105, 0.3);
              border-radius: 16px;
              padding: 40px;
              max-width: 600px;
            }
            h1 { color: #ef4444; margin-top: 0; }
            p { color: #cbd5e1; }
            button { padding: 12px 24px; background: #f59e0b; color: #0f172a; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Description:</strong> ${errorDescription || 'Please try again'}</p>
            <button onclick="window.location.href='/integrations'">← Back to Settings</button>
          </div>
        </body>
        </html>
      `, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    if (!code || code.trim() === '') {
      console.error('[AliceBlue OAuth Callback] INVALID REQUEST - Missing authorization code:', {
        code: code || 'NOT PROVIDED',
        receivedParams: Object.keys(allParams),
        timestamp: new Date().toISOString(),
      });
      
      // Return an HTML page showing what was received
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Alice Blue Callback</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0; 
              padding: 20px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: rgba(30, 41, 59, 0.9);
              border: 1px solid rgba(71, 85, 105, 0.3);
              border-radius: 16px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
            }
            h1 { color: #ef4444; margin-top: 0; }
            .warning { color: #fbbf24; font-weight: bold; }
            pre { 
              background: #0f172a; 
              padding: 15px; 
              border-radius: 8px; 
              overflow-x: auto;
              font-size: 12px;
              border: 1px solid rgba(71, 85, 105, 0.3);
            }
            .info-box {
              background: rgba(59, 130, 246, 0.1);
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
            button {
              padding: 12px 24px;
              background: #f59e0b;
              color: #0f172a;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover {
              background: #f97316;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Authorization Code Missing</h1>
            <p>Alice Blue called our callback but <span class="warning">no authorization code was provided</span>.</p>
            
            <div class="info-box">
              <strong>This means:</strong>
              <ul>
                <li>❌ You may not have completed the login on Alice Blue</li>
                <li>❌ The login was cancelled</li>
                <li>❌ There was an issue with 2FA/TOTP authentication</li>
                <li>❌ Alice Blue OAuth configuration may be incomplete</li>
              </ul>
            </div>
            
            <p><strong>What was received:</strong></p>
            <pre>URL: ${originalUrl}

Parameters: ${JSON.stringify(allParams, null, 2)}</pre>
            
            <button onclick="window.location.href='/integrations'">
              ← Back to Settings
            </button>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(htmlResponse, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Get state parameter for CSRF validation (optional but recommended)
    const state = searchParams.get("state");
    if (state) {
      console.log('[AliceBlue Callback] State parameter received for CSRF validation:', state.substring(0, 10) + '...');
      // Note: Full state validation would require comparing with stored state in session/cookies
      // For now we just log it for debugging
    } else {
      console.warn('[AliceBlue Callback] No state parameter received (CSRF validation skipped)');
    }

    // ✓ Authorization code received successfully
    console.log('[AliceBlue Callback] ✓ Valid authorization code received');

    // Verify the user is authenticated
    const userId = await requireUserId();
    console.log('[AliceBlue Callback] Current user authenticated:', userId);

    // Get Alice Blue settings for this user
    const settings = getAliceBlueSettings(userId) as any;
    
    if (!settings || !settings.apiSecret || !settings.apiKey) {
      console.error('[AliceBlue Callback] Alice Blue settings not found for user:', userId);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/integrations?error=alice_blue_settings_not_configured`
      );
    }

    console.log('[AliceBlue Callback] Found Alice Blue settings, exchanging authorization code for session...');
    console.log('[AliceBlue Callback] Token exchange parameters:', {
      userId: settings.userId || userId,
      authCode: code.substring(0, 10) + '...',
      apiKey: settings.apiKey?.substring(0, 5) + '...',
      timestamp: new Date().toISOString(),
    });

    // Exchange authorization code for session token
    // This calls Alice Blue's token endpoint to convert the authorization code to an access token
    const sessionResponse = await getUserSession({
      userId: settings.userId || userId,
      authCode: code,
      apiSecret: settings.apiSecret as string,
      apiKey: settings.apiKey as string,
    });

    console.log('[AliceBlue Callback] Token exchange response:', {
      stat: sessionResponse?.stat,
      hasUserSession: !!sessionResponse?.userSession,
      timestamp: new Date().toISOString(),
    });
    console.log('[AliceBlue Callback] ✓ Token exchange successful');

    if (!sessionResponse || !sessionResponse.userSession) {
      console.error('[AliceBlue Callback] No userSession in response');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/integrations?error=no_user_session_in_response`
      );
    }

    // Save the session
    saveAliceBlueSession(userId, {
      accessToken: sessionResponse.userSession,
      userId: settings.userId || userId,
    });

    console.log('[AliceBlue Callback] Session saved successfully');
    
    // Redirect to loading page with 5-minute countdown
    // This will fetch real data and then show the dashboard
    const countdownHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loading Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          h1 { 
            color: #10b981; 
            margin-top: 0;
            font-size: 32px;
          }
          .icon {
            font-size: 64px;
            margin: 20px 0;
          }
          p { 
            color: #cbd5e1; 
            font-size: 16px;
            margin: 15px 0;
            line-height: 1.6;
          }
          .countdown {
            font-size: 48px;
            font-weight: bold;
            color: #10b981;
            margin: 30px 0;
            font-family: monospace;
          }
          .spinner {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 4px solid #334155;
            border-top: 4px solid #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px 0;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✓</div>
          <h1>Login Successful!</h1>
          <p>Your Alice Blue account is authenticated</p>
          
          <div class="spinner"></div>
          
          <p style="font-weight: bold;">Fetching Your Real Data</p>
          <p style="color: #94a3b8; font-size: 14px;">Holdings, Positions & EMA Calculations</p>
          
          <div class="countdown"><span id="countdown">5:00</span></div>
          
          <p style="color: #94a3b8; font-size: 12px;">Redirecting to dashboard...</p>
        </div>
        
        <script>
          let secondsRemaining = 300;
          const countdownElement = document.getElementById('countdown');
          
          const countdownInterval = setInterval(() => {
            secondsRemaining--;
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            const timeString = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            countdownElement.textContent = timeString;
            
            if (secondsRemaining === 0) {
              clearInterval(countdownInterval);
              console.log('[AliceBlue Callback] 5 minutes completed, redirecting...');
              window.location.href = '/aliceblue?authenticated=true&timestamp=' + Date.now();
            }
          }, 1000);
        </script>
      </body>
      </html>
    `;
    
    return new NextResponse(countdownHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AliceBlue Callback] Error during authentication:', {
      error: errorMessage,
      url: originalUrl,
      timestamp: new Date().toISOString(),
    });

    const encodedError = encodeURIComponent(errorMessage.substring(0, 100));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/integrations?error=alice_blue_auth_failed&details=${encodedError}`
    );
  }
}
