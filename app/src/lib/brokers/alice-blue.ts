import type { AliceBlueSession, AliceBlueSettings, Holding, Position } from "./types";
import {
  fetchAliceBlueHoldings,
  fetchAliceBluePositions,
  fetchHistoricalData,
  type AliceBlueHolding,
  type AliceBluePosition,
} from "../aliceblue-client";

async function fetchPriceHistory(
  session: AliceBlueSession,
  exchange: string,
  token: string
): Promise<number[]> {
  try {
    const to = Date.now();
    const from = to - (30 * 24 * 60 * 60 * 1000); // 30 days ago in ms
    
    const response = await fetchHistoricalData(session, {
      exchange,
      token,
      resolution: "1D",
      from,
      to,
    });

    if (response.result && response.result.length > 0) {
      // Extract close prices from candles
      const closePrices = response.result.map((candle) => candle.close);
      return closePrices;
    }

    return [];
  } catch (error) {
    console.error(`[AliceBlue] Failed to fetch history for ${exchange}:${token}:`, error);
    return [];
  }
}

function parseAliceBlueHolding(raw: AliceBlueHolding): Holding {
  const quantity = parseInt(raw.HoldingQuantity || "0", 10);
  const avgPrice = parseFloat(raw.Price || "0");
  const ltp = parseFloat(raw.LTP || "0");
  const pnlPct = parseFloat(raw.PnlPercentage || "0");

  return {
    symbol: raw.Tradingsymbol,
    exchange: raw.Exchange,
    quantity,
    avgPrice,
    lastTradedPrice: ltp,
    dayChangePct: pnlPct,
    priceHistory: [],
    token: raw.Token,
  };
}

function parseAliceBluePosition(raw: AliceBluePosition): Position {
  const netQty = parseInt(raw.Netqty || "0", 10);
  const buyQty = parseInt(raw.BuyQty || "0", 10);
  const sellQty = parseInt(raw.SellQty || "0", 10);
  const ltp = parseFloat(raw.LTP || "0");
  const avgBuyPrice = parseFloat(raw.BuyAveragePrice || "0");
  const avgSellPrice = parseFloat(raw.SellAveragePrice || "0");
  const realizedPnl = parseFloat(raw.Realisedprofitloss || "0");
  const unrealizedPnl = parseFloat(raw.Unrealisedprofitloss || "0");

  return {
    symbol: raw.Symbol,
    exchange: raw.Exchange,
    netQty,
    buyQty,
    sellQty,
    lastTradedPrice: ltp,
    avgBuyPrice,
    avgSellPrice,
    realizedPnl,
    unrealizedPnl,
    priceHistory: [],
    token: raw.Token,
  };
}

export const aliceBlueIntegration = {
  id: "alice-blue" as const,
  name: "Alice Blue",
  description: "Authenticate with Alice Blue API and manage holdings, positions, and stop-loss orders.",

  // Login is handled by the API route - this method is not used
  async login(settings: AliceBlueSettings): Promise<AliceBlueSession> {
    throw new Error("Use POST /api/brokers/aliceblue/login instead.");
  },

  async getHoldings(session: AliceBlueSession): Promise<Holding[]> {
    const response = await fetchAliceBlueHoldings(session);
    if (!response.HoldingVal) {
      return [];
    }
    
    // Fetch holdings with historical data
    const holdingsWithHistory = await Promise.all(
      response.HoldingVal.map(async (raw) => {
        const holding = parseAliceBlueHolding(raw);
        // Fetch historical price data for EMA calculation
        const priceHistory = await fetchPriceHistory(session, holding.exchange, holding.token || "");
        holding.priceHistory = priceHistory;
        return holding;
      })
    );
    
    return holdingsWithHistory;
  },

  async getPositions(session: AliceBlueSession): Promise<Position[]> {
    const response = await fetchAliceBluePositions(session);
    if (!response.PositionDetail) {
      return [];
    }
    
    // Fetch positions with historical data
    const positionsWithHistory = await Promise.all(
      response.PositionDetail.map(async (raw) => {
        const position = parseAliceBluePosition(raw);
        // Fetch historical price data for EMA calculation
        const priceHistory = await fetchPriceHistory(session, position.exchange, position.token || "");
        position.priceHistory = priceHistory;
        return position;
      })
    );
    
    return positionsWithHistory;
  },
};

