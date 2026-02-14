import { mockHoldings } from "../mock-data";
import type { BrokerIntegration, BrokerSession, BrokerSettings } from "./types";

export const kotakNeoIntegration: BrokerIntegration = {
  id: "kotak-neo",
  name: "Kotak Neo Trade API",
  description:
    "Authenticate with TOTP + MPIN, then fetch holdings from Kotak Neo.",
  async loginWithTotp(settings: BrokerSettings): Promise<BrokerSession> {
    // Placeholder for the real two-step auth flow described in the docs.
    // Step 1: POST /login/1.0/tradeApiLogin with mobileNumber, ucc, totp.
    // Step 2: POST /login/1.0/tradeApiValidate with mpin, plus sid + Auth from step 1.
    const stubToken = `trade_${settings.ucc}_${Date.now()}`;
    return {
      token: stubToken,
      sid: `sid_${settings.ucc}`,
      baseUrl: "https://cis.kotaksecurities.com",
      kType: "Trade",
    };
  },
  async getHoldings(_session: BrokerSession) {
    // Replace with real holdings API call when Kotak Neo endpoints are wired.
    return mockHoldings;
  },
};
