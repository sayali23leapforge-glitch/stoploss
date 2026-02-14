export type BrokerId = "kotak-neo" | "alice-blue";

export type BrokerSession = {
  token: string;
  sid: string;
  baseUrl: string;
  kType: "View" | "Trade";
};

export type BrokerSettings = {
  accessToken: string;
  mobileNumber: string;
  ucc: string;
  mpin: string;
  totp: string;
};

export type AliceBlueSession = {
  accessToken: string;
  userId: string;
};

export type AliceBlueSettings = {
  userId: string;
  apiKey: string;
  apiSecret: string;
};

export type Holding = {
  symbol: string;
  exchange: string;
  quantity: number;
  avgPrice: number;
  lastTradedPrice: number;
  dayChangePct: number;
  priceHistory: number[];
  token?: string;
};

export type Position = {
  symbol: string;
  exchange: string;
  netQty: number;
  buyQty: number;
  sellQty: number;
  lastTradedPrice: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  priceHistory: number[];
  token?: string;
};

export type BrokerIntegration = {
  id: BrokerId;
  name: string;
  description: string;
  loginWithTotp: (settings: BrokerSettings) => Promise<BrokerSession>;
  getHoldings: (session: BrokerSession) => Promise<Holding[]>;
};
