import { kotakNeoIntegration } from "./kotak-neo";
import { aliceBlueIntegration } from "./alice-blue";
import type { BrokerId } from "./types";

const BROKERS = {
  "kotak-neo": kotakNeoIntegration,
  "alice-blue": aliceBlueIntegration,
} as const;

export function listBrokers() {
  return Object.values(BROKERS);
}

export function getBroker(id: BrokerId) {
  return BROKERS[id];
}
