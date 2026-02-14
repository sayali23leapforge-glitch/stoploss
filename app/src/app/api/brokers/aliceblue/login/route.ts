import { NextResponse } from "next/server";
import { getAliceBlueSettings } from "@/lib/store";
import { requireUserId } from "@/lib/request-auth";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const settings = getAliceBlueSettings(userId) as any;

    if (!settings || !settings.apiKey || !settings.apiSecret) {
      return NextResponse.json(
        { error: "Alice Blue settings not found. Please configure your credentials first." },
        { status: 400 }
      );
    }

    // PROPER OAUTH 2.0 FLOW WITH STATE VALIDATION
    // State prevents CSRF attacks and validates the callback comes from Alice Blue
    
    const clientId = settings.apiKey as string; // Client ID from Alice Blue app settings
    
    // CRITICAL: Determine correct redirect URI to use
    // Must match EXACTLY what's configured in Alice Blue OAuth settings
    let redirectUri: string;
    
    if (process.env.ALICEBLUE_OAUTH_REDIRECT_URI) {
      // Use explicit configured URI (production)
      redirectUri = process.env.ALICEBLUE_OAUTH_REDIRECT_URI;
    } else if (process.env.NEXT_PUBLIC_ALICE_REDIRECT_URI) {
      // Use public environment variable
      redirectUri = process.env.NEXT_PUBLIC_ALICE_REDIRECT_URI;
    } else {
      // Default to localhost for development
      redirectUri = "http://localhost:3000/api/brokers/aliceblue/callback";
    }

    // Generate CSRF state token
    const state = randomUUID();
    
    console.log('[AliceBlue Login] OAuth 2.0 Authorization Code Flow WITH STATE:', {
      clientId,
      redirectUri,
      state,
      timestamp: new Date().toISOString(),
    });

    // CORRECT OAUTH URL - Uses /oauth2/auth endpoint with response_type=code AND state parameter
    const oauthUrl = new URL("https://ant.aliceblueonline.com/oauth2/auth");
    oauthUrl.searchParams.append("response_type", "code");
    oauthUrl.searchParams.append("client_id", clientId);
    oauthUrl.searchParams.append("redirect_uri", redirectUri);
    oauthUrl.searchParams.append("state", state);

    console.log('[AliceBlue Login] Generated OAuth URL:', oauthUrl.toString());
    console.log('[AliceBlue Login] State token stored (will validate on callback):', state);

    // Show instruction page before redirecting to Alice Blue
    const instructionHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Alice Blue OAuth Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
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
            text-align: center;
          }
          
          h1 { 
            color: #f59e0b; 
            margin-top: 0;
            font-size: 32px;
          }
          
          .subtitle {
            color: #cbd5e1;
            font-size: 16px;
            margin-bottom: 30px;
          }
          
          .info-section {
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          
          .info-section h3 {
            color: #10b981;
            margin-top: 0;
            font-size: 18px;
          }
          
          .info-section ol {
            color: #cbd5e1;
            padding-left: 20px;
            line-height: 1.8;
          }
          
          .info-section li {
            margin-bottom: 10px;
          }
          
          .highlight {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #bfdbfe;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
            justify-content: center;
          }
          
          button {
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .btn-primary {
            background: #10b981;
            color: #fff;
          }
          
          .btn-primary:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
          }
          
          .btn-secondary {
            background: rgba(71, 85, 105, 0.3);
            color: #cbd5e1;
            border: 1px solid rgba(71, 85, 105, 0.5);
          }
          
          .btn-secondary:hover {
            background: rgba(71, 85, 105, 0.5);
          }
          
          .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-left: 4px solid #ef4444;
            color: #fca5a5;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Alice Blue Login</h1>
          <p class="subtitle">OAuth 2.0 Authorization</p>
          
          <div class="highlight">
            ✓ <strong>Real OAuth Flow:</strong> You will have PLENTY of time to type your credentials. The redirect only happens AFTER you successfully login on Alice Blue.
          </div>
          
          <div class="info-section">
            <h3>📋 What happens:</h3>
            <ol>
              <li><strong>Click "Authorize with Alice Blue"</strong></li>
              <li><strong>Alice Blue login page stays open</strong> (not popup)</li>
              <li><strong>Type your Client ID</strong> (take your time)</li>
              <li><strong>Type your password</strong> (no rush)</li>
              <li><strong>Enter 2FA</strong> (Year of birth or TOTP code)</li>
              <li><strong>Click "Login"</strong> on Alice Blue</li>
              <li><strong>Automatic redirect back</strong> with authorization code</li>
              <li><strong>Backend exchanges code for access token</strong></li>
              <li><strong>Fetch REAL holdings and show countdown</strong></li>
              <li><strong>Dashboard loads</strong> with your actual data</li>
            </ol>
          </div>
          
          <div class="warning">
            ⚠️ <strong>IMPORTANT:</strong> You have unlimited time to type your credentials on Alice Blue. There is NO timeout or auto-close. Type at your own pace!
          </div>
          
          <div class="button-group">
            <button class="btn-primary" onclick="startOAuth()">
              Authorize with Alice Blue →
            </button>
            <button class="btn-secondary" onclick="cancelLogin()">
              Cancel
            </button>
          </div>
        </div>

        <script>
          const OAUTH_URL = '${oauthUrl.toString()}';
          const STATE_TOKEN = '${state}';
          
          function startOAuth() {
            console.log('[AliceBlue OAuth] Starting OAuth 2.0 Authorization Code Flow');
            console.log('[AliceBlue OAuth] OAuth URL:', OAUTH_URL);
            console.log('[AliceBlue OAuth] State token for CSRF validation:', STATE_TOKEN);
            
            // Store state token in sessionStorage for validation on callback
            sessionStorage.setItem('alice_oauth_state', STATE_TOKEN);
            
            // Full page redirect - user stays on main page throughout OAuth flow
            // This is NOT a popup - the entire page navigates to Alice Blue
            window.location.href = OAUTH_URL;
          }
          
          function cancelLogin() {
            console.log('[AliceBlue OAuth] User cancelled');
            window.location.href = '/integrations';
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(instructionHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
