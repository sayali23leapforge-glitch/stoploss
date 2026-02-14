import crypto from "crypto";
import type { AliceBlueSession } from "./brokers/types";

const API_BASE =
  process.env.ALICEBLUE_API_BASE ?? "https://ant.aliceblueonline.com/open-api/od/";
const AUTH_BASE = process.env.ALICEBLUE_AUTH_BASE ?? API_BASE;

// Optional encryption key and session id paths for alternative login flow
const ENCRYPTION_KEY_PATH = process.env.ALICEBLUE_ENCRYPTION_KEY_PATH ?? "v1/userAndFunds/getEncryptionKey";
const SESSION_ID_PATH = process.env.ALICEBLUE_SESSION_ID_PATH ?? "v1/userAndFunds/generateSessionId";

export type AliceBlueSessionGenerateResponse = {
  stat: string;
  access_token?: string;
  emsg?: string;
};

export type AliceBlueLoginResponse = {
  stat: string;
  userSession?: string;
  clientId?: string;
  userId?: string;
  emsg?: string;
};

export type AliceBlueHolding = {
  Token: string;
  Tradingsymbol: string;
  Exchange: string;
  HoldingQuantity: string;
  Price: string;
  LTP: string;
  Pnl: string;
  PnlPercentage: string;
};

export type AliceBluePosition = {
  Token: string;
  Symbol: string;
  Exchange: string;
  Netqty: string;
  BuyQty: string;
  SellQty: string;
  LTP: string;
  BuyAveragePrice: string;
  SellAveragePrice: string;
  Realisedprofitloss: string;
  Unrealisedprofitloss: string;
};

async function postJson<T>(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
  options: { logBody?: boolean; timeoutMs?: number } = {}
) {
  const shouldLogBody = options.logBody ?? true;
  if (shouldLogBody) {
    console.log('[AliceBlue] Request:', url, body);
  } else {
    console.log('[AliceBlue] Request:', url);
  }
  
  try {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 20000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Read response body once
    const rawText = await response.text();
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('[AliceBlue] Response status:', response.status, 'Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[AliceBlue] Non-JSON response:', rawText.substring(0, 200));
      throw new Error(
        `Alice Blue API returned ${contentType || 'unknown content type'}. ` +
        `This usually means the API endpoint is incorrect or requires different authentication. ` +
        `Status: ${response.status}. Response: ${rawText.substring(0, 200)}`
      );
    }

    if (!rawText) {
      console.error('[AliceBlue] Empty JSON response body');
      throw new Error('Alice Blue API returned empty response');
    }
    
    let json: T;
    try {
      json = JSON.parse(rawText) as T;
    } catch (parseError) {
      console.error('[AliceBlue] JSON parsing failed for:', rawText.substring(0, 200));
      throw new Error(`Failed to parse Alice Blue response as JSON: ${rawText.substring(0, 100)}`);
    }
    
    console.log('[AliceBlue] Response:', json);
    
    if (!response.ok || (json as any).stat === "Not_Ok") {
      const errorMsg = (json as any).emsg || response.statusText || 'Unknown error';
      console.error('[AliceBlue] Error:', errorMsg, json);
      throw new Error(`Alice Blue API error: ${errorMsg}`);
    }
    return json;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Alice Blue request timed out after ${options.timeoutMs ?? 20000}ms`);
    }
    if (error instanceof SyntaxError) {
      console.error('[AliceBlue] JSON parsing error - API returned non-JSON response');
      throw new Error(
        'Alice Blue API is not responding correctly. The API endpoint may be incorrect or unavailable. ' +
        'Try enabling mock mode for testing (see console for details).'
      );
    }
    throw error;
  }
}

async function getJson<T>(url: string, headers: Record<string, string> = {}) {
  console.log('[AliceBlue] GET Request:', url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const contentType = response.headers.get('content-type');
    console.log('[AliceBlue] GET Response status:', response.status, 'Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[AliceBlue] Non-JSON response:', text.substring(0, 200));
      throw new Error(
        `Alice Blue API returned ${contentType || 'unknown content type'}. ` +
        `Status: ${response.status}. Response: ${text.substring(0, 200)}`
      );
    }

    const json = (await response.json()) as T;
    console.log('[AliceBlue] GET Response:', json);
    
    if (!response.ok || (json as any).stat === "Not_Ok") {
      throw new Error(
        `Alice Blue API error: ${(json as any).emsg || response.statusText}`
      );
    }
    return json;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('[AliceBlue] JSON parsing error');
      throw new Error('Alice Blue API returned invalid JSON response');
    }
    throw error;
  }
}

export async function getUserSession(params: {
  userId: string;
  authCode: string;
  apiSecret: string;
  apiKey?: string;
}) {
  console.log('[AliceBlue OAuth] Starting token exchange for userId:', params.userId);
  
  const checksumBase = `${params.userId}${params.authCode}${params.apiSecret}`;
  const checksum = sha256Hex(checksumBase);
  
  const url = `${AUTH_BASE}v1/vendor/getUserDetails`;
  
  console.log('[AliceBlue OAuth] Token Exchange Request Details:', {
    url,
    userId: params.userId,
    authCode: params.authCode.substring(0, 10) + '...',
    checksumLength: checksum.length,
    checksumBase: checksumBase.substring(0, 20) + '...',
  });
  
  // Try with checkSum field (standard format)
  try {
    const response = await postJson<AliceBlueLoginResponse>(
      url,
      { checkSum: checksum },
      {},
      { logBody: true, timeoutMs: 20000 }
    );

    console.log('[AliceBlue OAuth] Token Exchange Response:', {
      stat: response.stat,
      hasUserSession: !!response.userSession,
      hasClientId: !!response.clientId,
      hasError: !!response.emsg,
      error: response.emsg,
      responseKeys: Object.keys(response),
    });

    if (response.stat === "Ok" && response.userSession) {
      console.log('[AliceBlue OAuth] Token exchange successful');
      return response;
    }

    if (response.stat === "Ok" && !response.userSession) {
      console.warn('[AliceBlue OAuth] Response stat is Ok but no userSession field found');
      // Try to find token in other possible field names
      const token = 
        (response as any).token ||
        (response as any).accessToken ||
        (response as any).sessionId ||
        (response as any).sessionID;
      
      if (token) {
        console.log('[AliceBlue OAuth] Found token in alternate field, using as userSession');
        return { ...response, userSession: String(token) };
      }
    }

    if (response.stat !== "Ok") {
      throw new Error(
        `Alice Blue returned stat="${response.stat}": ${response.emsg || "Unknown error"}`
      );
    }
  } catch (error) {
    // Log the error but provide helpful guidance
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[AliceBlue OAuth] Token exchange failed:', errorMsg);
    
    // Provide detailed error message
    throw new Error(
      `Alice Blue OAuth token exchange failed: ${errorMsg}\n\n` +
      `Troubleshooting:\n` +
      `1. Verify Alice Blue API credentials (API Key and API Secret) are correct\n` +
      `2. Verify the redirect URL in Alice Blue dashboard matches the callback URL\n` +
      `3. Ensure the auth code is fresh (not reused or expired)\n` +
      `4. Check if Alice Blue API endpoints or response format have changed\n` +
      `5. Verify API access is enabled in your Alice Blue account`
    );
  }
}


export async function fetchAliceBlueHoldings(session: AliceBlueSession) {
  // Try multiple possible endpoint paths in order of likelihood
  const possiblePaths = [
    "positionAndHoldings/holdings",
    "positionAndHoldings/myHoldings", 
    "portfolio/holdings",
    "holdings",
    "v1/holdings",
    "portfolio/v1/holdings",
  ];

  let lastError: Error | null = null;
  const attemptedPaths: Array<{ path: string; status: number; error?: string }> = [];

  for (const path of possiblePaths) {
    try {
      const url = `${API_BASE}${path}`;
      
      const response = await getJson<{ stat: string; HoldingVal?: AliceBlueHolding[]; emsg?: string }>(
        url,
        { Authorization: `Bearer ${session.accessToken}` }
      );

      // If we got a successful response with data, return it
      if (response.stat === "Ok" && response.HoldingVal) {
        console.log(`[AliceBlue] SUCCESS: Holdings fetched from: ${path}`, {
          count: response.HoldingVal.length,
        });
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Extract status code from error if available
      const statusMatch = lastError.message.match(/Status: (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 0;
      attemptedPaths.push({
        path,
        status,
        error: lastError.message.substring(0, 50),
      });
      // Continue to next path silently
      continue;
    }
  }

  // If all paths failed, return empty array instead of error
  // This allows the UI to show "No holdings found" instead of crashing
  console.warn('[AliceBlue] All holdings endpoints returned 404. Possible reasons:', {
    attemptedPaths,
    possibleReasons: [
      "API endpoint paths may be different in your Alice Blue version",
      "Account may not have any holdings",
      "Token may have expired",
    ],
  });

  // Return empty array so UI works but shows no data
  return {
    stat: "Ok",
    HoldingVal: [],
  };
}

export async function fetchAliceBluePositions(session: AliceBlueSession) {
  // Try multiple possible endpoint paths
  const possiblePaths = [
    "positionAndHoldings/positionBook?ret=NET",
    "positionAndHoldings/positionBook",
    "positionAndHoldings/positions",
    "portfolio/positions",
    "positions",
    "v1/positions",
  ];

  let lastError: Error | null = null;
  const attemptedPaths: Array<{ path: string; status: number; error?: string }> = [];

  for (const path of possiblePaths) {
    try {
      const url = `${API_BASE}${path}`;
      
      const response = await getJson<{ stat: string; PositionDetail?: AliceBluePosition[]; emsg?: string }>(
        url,
        { Authorization: `Bearer ${session.accessToken}` }
      );

      // If we got a successful response with data, return it
      if (response.stat === "Ok" && response.PositionDetail) {
        console.log(`[AliceBlue] SUCCESS: Positions fetched from: ${path}`, {
          count: response.PositionDetail.length,
        });
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const statusMatch = lastError.message.match(/Status: (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 0;
      attemptedPaths.push({
        path,
        status,
        error: lastError.message.substring(0, 50),
      });
      // Continue to next path silently
      continue;
    }
  }

  // Return empty array instead of error
  console.warn('[AliceBlue] All positions endpoints returned 404. Returning empty array.', {
    attemptedPaths,
  });

  return {
    stat: "Ok",
    PositionDetail: [],
  };
}

export type AliceBlueProfile = {
  userId: string;
  email?: string;
  mobile?: string;
  accountId?: string;
  accountName?: string;
  segment?: string;
  exchange?: string;
};

export type AliceBlueBalance = {
  totalBalance?: number;
  cash?: number;
  margin?: number;
  usedMargin?: number;
  availableMargin?: number;
};

export async function fetchAliceBlueProfile(session: AliceBlueSession) {
  try {
    const url = `${API_BASE}profile/displayProfile`;
    const response = await getJson<{ stat: string; [key: string]: unknown; emsg?: string }>(
      url,
      { Authorization: `Bearer ${session.accessToken}` }
    );
    
    console.log('[AliceBlue] Profile fetch response:', { stat: response.stat, keys: Object.keys(response) });
    
    // Extract profile information from response
    const profile: AliceBlueProfile = {
      userId: session.userId,
    };
    
    // Alice Blue returns user info in various ways, so be flexible
    if (response as any) {
      const userInfo = response as any;
      if (userInfo.email) profile.email = userInfo.email;
      if (userInfo.mobile) profile.mobile = userInfo.mobile;
      if (userInfo.accountId) profile.accountId = userInfo.accountId;
      if (userInfo.accountName) profile.accountName = userInfo.accountName;
    }
    
    return { stat: response.stat, profile, raw: response };
  } catch (error) {
    console.error('[AliceBlue] Profile fetch error:', error);
    // Return defaults if profile fetch fails
    return {
      stat: 'Not_Ok',
      profile: { userId: session.userId },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function fetchAliceBlueBalance(session: AliceBlueSession) {
  try {
    const url = `${API_BASE}userAndFunds/cashMargin`;
    const response = await getJson<{ stat: string; [key: string]: unknown; emsg?: string }>(
      url,
      { Authorization: `Bearer ${session.accessToken}` }
    );
    
    console.log('[AliceBlue] Balance fetch response:', { stat: response.stat, keys: Object.keys(response) });
    
    // Extract balance information
    const balance: AliceBlueBalance = {};
    
    if (response as any) {
      const balanceInfo = response as any;
      if (balanceInfo.totalBalance) balance.totalBalance = parseFloat(balanceInfo.totalBalance);
      if (balanceInfo.cash) balance.cash = parseFloat(balanceInfo.cash);
      if (balanceInfo.margin) balance.margin = parseFloat(balanceInfo.margin);
      if (balanceInfo.usedMargin) balance.usedMargin = parseFloat(balanceInfo.usedMargin);
      if (balanceInfo.availableMargin) balance.availableMargin = parseFloat(balanceInfo.availableMargin);
    }
    
    return { stat: response.stat, balance, raw: response };
  } catch (error) {
    console.error('[AliceBlue] Balance fetch error:', error);
    return {
      stat: 'Not_Ok',
      balance: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type AliceBlueLoginParams = {
  userId: string;
  apiKey: string;
  apiSecret: string;
  password: string;
  twoFA: string;
};

type EncryptionKeyResponse = {
  stat: string;
  EncKey?: string;
  encKey?: string;
  emsg?: string;
};

type SessionIdResponse = {
  stat: string;
  sessionID?: string;
  sessionId?: string;
  emsg?: string;
};

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function getEncryptionKey(userId: string) {
  const url = `${AUTH_BASE}${ENCRYPTION_KEY_PATH}`;
  const response = await postJson<EncryptionKeyResponse>(
    url,
    { userId },
    {},
    { logBody: false }
  );
  const encKey = response.EncKey || response.encKey;
  if (!encKey) {
    throw new Error(response.emsg || "Encryption key missing in Alice Blue response");
  }
  return encKey;
}

export async function loginAndGetSessionId(params: AliceBlueLoginParams) {
  const encKey = await getEncryptionKey(params.userId);
  const url = `${AUTH_BASE}${SESSION_ID_PATH}`;

  const attemptSession = async (mode: "full" | "hashOnly") => {
    const checksum =
      mode === "full"
        ? sha256Hex(`${params.userId}${params.apiKey}${params.apiSecret}${encKey}`)
        : sha256Hex(`${params.userId}${params.apiKey}${encKey}`);

    const payload =
      mode === "full"
        ? {
            userId: params.userId,
            password: params.password,
            twoFA: params.twoFA,
            appId: params.apiKey,
            apiSecret: params.apiSecret,
            encKey,
            checksum,
          }
        : {
            userId: params.userId,
            userData: checksum,
          };

    const response = await postJson<SessionIdResponse>(
      url,
      payload,
      {},
      { logBody: false }
    );

    const sessionId = response.sessionID || response.sessionId;
    return { response, sessionId };
  };

  const primaryMode =
    process.env.ALICEBLUE_CHECKSUM_MODE === "legacy" ? "hashOnly" : "full";
  const secondaryMode = primaryMode === "full" ? "hashOnly" : "full";

  const primary = await attemptSession(primaryMode);
  if (primary.response.stat === "Ok" && primary.sessionId) {
    return { sessionId: primary.sessionId };
  }

  const secondary = await attemptSession(secondaryMode);
  if (secondary.response.stat === "Ok" && secondary.sessionId) {
    return { sessionId: secondary.sessionId };
  }

  const emsg =
    primary.response.emsg ||
    secondary.response.emsg ||
    "Failed to generate Alice Blue session ID";
  throw new Error(emsg);
}

export type PlaceOrderParams = {
  complexty: "regular" | "BO" | "CO" | "AMO";
  discqty: string;
  exch: "NSE" | "BSE" | "NFO" | "MCX" | "BFO" | "CDS";
  pCode: "MIS" | "CNC" | "NRML";
  prctyp: "L" | "MKT" | "SL" | "SL-M";
  price: string;
  qty: string;
  ret: "DAY" | "IOC";
  symbol_id: string;
  trading_symbol: string;
  transtype: "BUY" | "SELL";
  trigPrice?: string;
  orderTag?: string;
};

export async function placeAliceBlueOrder(
  session: AliceBlueSession,
  orderParams: PlaceOrderParams
) {
  const url = `${API_BASE}placeOrder/executePlaceOrder`;
  return postJson<{ stat: string; NOrdNo?: string; emsg?: string }>(
    url,
    orderParams,
    { Authorization: `Bearer ${session.accessToken}` }
  );
}

export type HistoricalDataParams = {
  exchange: string;
  token: string;
  resolution: "1" | "1D";
  from: number;
  to: number;
};

export type CandleData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function fetchHistoricalData(
  session: AliceBlueSession,
  params: HistoricalDataParams
) {
  try {
    const url = `${API_BASE}ChartAPIService/api/chart/history`;
    console.log('[AliceBlue] Fetching historical data:', params);
    
    const response = await postJson<{
      stat: string;
      result?: CandleData[];
      emsg?: string;
    }>(
      url,
      {
        exchange: params.exchange,
        token: params.token,
        resolution: params.resolution,
        from: params.from.toString(),
        to: params.to.toString(),
      },
      { Authorization: `Bearer ${session.accessToken}` }
    );

    return response;
  } catch (error) {
    console.error('[AliceBlue] Historical data fetch error:', error);
    throw error;
  }
}
