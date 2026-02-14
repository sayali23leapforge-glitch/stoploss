import type { BrokerSettings } from "./brokers/types";
import type { KotakSession } from "./store";

const LOGIN_BASE = "https://mis.kotaksecurities.com";

export type KotakLoginResponse = {
  data?: {
    token: string;
    sid: string;
    rid?: string;
    baseUrl?: string;
    kType: "View" | "Trade";
    status: string;
  };
  status?: string;
  message?: string;
  errorCode?: string;
};

async function postJson<T>(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string>
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as T) : ({} as T);
  if (!response.ok) {
    const msg =
      typeof json === "object" && json && "message" in json
        ? (json as { message?: string }).message
        : undefined;
    throw new Error(`Kotak API error ${response.status}${msg ? `: ${msg}` : ""}`);
  }
  return json;
}

export async function tradeApiLogin(settings: BrokerSettings) {
  const url = `${LOGIN_BASE}/login/1.0/tradeApiLogin`;
  return postJson<KotakLoginResponse>(
    url,
    {
      mobileNumber: settings.mobileNumber,
      ucc: settings.ucc,
      totp: settings.totp,
    },
    {
      Authorization: settings.accessToken,
      "neo-fin-key": "neotradeapi",
    }
  );
}

export async function tradeApiValidate(
  settings: BrokerSettings,
  viewToken: string,
  viewSid: string
) {
  const url = `${LOGIN_BASE}/login/1.0/tradeApiValidate`;
  return postJson<KotakLoginResponse>(
    url,
    { mpin: settings.mpin },
    {
      Authorization: settings.accessToken,
      "neo-fin-key": "neotradeapi",
      sid: viewSid,
      Auth: viewToken,
    }
  );
}

export async function fetchScripPaths(baseUrl: string, accessToken: string) {
  const response = await fetch(
    `${baseUrl}/script-details/1.0/masterscrip/file-paths`,
    {
      headers: {
        Authorization: accessToken,
      },
    }
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json as { data?: { filesPaths: string[]; baseFolder: string } };
}

export async function fetchQuotes(
  baseUrl: string,
  accessToken: string,
  query: string,
  filter: string
) {
  const url = `${baseUrl}/script-details/1.0/quotes/neosymbol/${query}/${filter}`;
  const response = await fetch(url, {
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json;
}

export async function fetchHoldings(baseUrl: string, session: KotakSession) {
  const response = await fetch(`${baseUrl}/portfolio/v1/holdings`, {
    headers: {
      accept: "application/json",
      Sid: session.sid,
      Auth: session.token,
      "neo-fin-key": "neotradeapi",
    },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json;
}

export async function placeOrder(
  baseUrl: string,
  session: KotakSession,
  jData: Record<string, unknown>
) {
  const params = new URLSearchParams();
  params.set("jData", JSON.stringify(jData));
  const response = await fetch(`${baseUrl}/quick/order/rule/ms/place`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Sid: session.sid,
      Auth: session.token,
      "neo-fin-key": "neotradeapi",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json;
}

export async function modifyOrder(
  baseUrl: string,
  session: KotakSession,
  jData: Record<string, unknown>
) {
  const params = new URLSearchParams();
  params.set("jData", JSON.stringify(jData));
  const response = await fetch(`${baseUrl}/quick/order/vr/modify`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Sid: session.sid,
      Auth: session.token,
      "neo-fin-key": "neotradeapi",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json;
}

export async function cancelOrder(
  baseUrl: string,
  session: KotakSession,
  endpoint: string,
  jData: Record<string, unknown>
) {
  const params = new URLSearchParams();
  params.set("jData", JSON.stringify(jData));
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Sid: session.sid,
      Auth: session.token,
      "neo-fin-key": "neotradeapi",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Kotak API error ${response.status}`);
  }
  return json;
}
