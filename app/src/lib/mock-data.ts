import type { Holding } from "./brokers/types";

export const mockHoldings: Holding[] = [
  {
    symbol: "RELIANCE",
    exchange: "NSE",
    quantity: 32,
    avgPrice: 2510.4,
    lastTradedPrice: 2621.8,
    dayChangePct: 1.6,
    priceHistory: [
      2441, 2468, 2492, 2481, 2502, 2524, 2538, 2556, 2548, 2562, 2588, 2605,
      2599, 2612, 2621,
    ],
  },
  {
    symbol: "HDFCBANK",
    exchange: "NSE",
    quantity: 45,
    avgPrice: 1465.2,
    lastTradedPrice: 1512.7,
    dayChangePct: 0.8,
    priceHistory: [
      1418, 1429, 1441, 1454, 1462, 1478, 1486, 1499, 1503, 1495, 1508, 1519,
      1515, 1509, 1512,
    ],
  },
  {
    symbol: "TCS",
    exchange: "NSE",
    quantity: 18,
    avgPrice: 3560.1,
    lastTradedPrice: 3724.5,
    dayChangePct: 2.1,
    priceHistory: [
      3468, 3491, 3512, 3528, 3544, 3569, 3582, 3601, 3614, 3633, 3662, 3698,
      3710, 3720, 3724,
    ],
  },
];

export const mockHoldingsRiskNotes = [
  "EMA-based suggestions are informational only.",
  "Final stop-loss levels should match your risk tolerance and broker rules.",
];
