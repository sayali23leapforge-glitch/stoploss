import type { BrokerSettings, AliceBlueSettings, AliceBlueSession } from "./brokers/types";

export type KotakSession = {
  token: string;
  sid: string;
  baseUrl: string;
  kType: "View" | "Trade";
};

type UserStore = {
  settings?: BrokerSettings;
  session?: KotakSession;
  aliceBlueSettings?: AliceBlueSettings;
  aliceBlueSession?: AliceBlueSession;
};

type StoreShape = {
  users: Record<string, UserStore>;
};

const globalStore = globalThis as typeof globalThis & {
  __stoploss_store__?: StoreShape;
};

if (!globalStore.__stoploss_store__) {
  globalStore.__stoploss_store__ = { users: {} };
}

function getUserBucket(userId: string) {
  const store = globalStore.__stoploss_store__!;
  if (!store.users[userId]) {
    store.users[userId] = {};
  }
  return store.users[userId]!;
}

export function saveKotakSettings(userId: string, settings: BrokerSettings) {
  getUserBucket(userId).settings = settings;
}

export function getKotakSettings(userId: string) {
  return getUserBucket(userId).settings;
}

export function saveKotakSession(userId: string, session: KotakSession) {
  getUserBucket(userId).session = session;
}

export function getKotakSession(userId: string) {
  return getUserBucket(userId).session;
}

export function clearKotakSession(userId: string) {
  getUserBucket(userId).session = undefined;
}

// Alice Blue store functions
export function saveAliceBlueSettings(userId: string, settings: AliceBlueSettings) {
  getUserBucket(userId).aliceBlueSettings = settings;
}

export function getAliceBlueSettings(userId?: string) {
  if (userId) {
    return getUserBucket(userId).aliceBlueSettings;
  }
  
  // Return all Alice Blue settings if no userId provided
  const store = globalStore.__stoploss_store__!;
  const allSettings: Record<string, AliceBlueSettings> = {};
  
  for (const [userId, userBucket] of Object.entries(store.users)) {
    if (userBucket.aliceBlueSettings) {
      allSettings[userId] = userBucket.aliceBlueSettings;
    }
  }
  
  return allSettings;
}

export function saveAliceBlueSession(userId: string, session: AliceBlueSession) {
  getUserBucket(userId).aliceBlueSession = session;
}

export function getAliceBlueSession(userId: string) {
  return getUserBucket(userId).aliceBlueSession;
}

export function clearAliceBlueSession(userId: string) {
  getUserBucket(userId).aliceBlueSession = undefined;
}
