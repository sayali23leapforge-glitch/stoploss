"use client";

import { useState, useEffect } from "react";
import { calculateEMA, suggestStopLoss } from "@/lib/stoploss";
import type { Holding, Position } from "@/lib/brokers/types";

type HoldingWithEMA = Holding & {
  ema10: number | null;
  ema20: number | null;
  suggestedStopLoss10: number | null;
  suggestedStopLoss20: number | null;
};

type PositionWithEMA = Position & {
  ema10: number | null;
  ema20: number | null;
  suggestedStopLoss10: number | null;
  suggestedStopLoss20: number | null;
};

export function AliceBlueStopLossPanel() {
  const [holdings, setHoldings] = useState<HoldingWithEMA[]>([]);
  const [positions, setPositions] = useState<PositionWithEMA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emaPeriod, setEmaPeriod] = useState<10 | 20>(10);
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<{ symbol: string; text: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use new sync endpoint that fetches everything in one call
      const response = await fetch("/api/brokers/aliceblue/sync");
      const data = await response.json();

      if (!response.ok) {
        if (data.needsLogin) {
          setError("No active session. Please complete login on Alice Blue first, then return here and try again.");
        } else {
          setError(data.error || "Failed to sync data");
        }
        return;
      }

      // Process holdings with EMA
      const holdingsWithEMA: HoldingWithEMA[] = (data.holdings || []).map((h: Holding) => {
        const prices = h.priceHistory.length > 0 ? h.priceHistory : [h.lastTradedPrice];
        const ema10 = prices.length >= 10 ? calculateEMA(prices, 10) : null;
        const ema20 = prices.length >= 20 ? calculateEMA(prices, 20) : null;
        const sl10 = ema10 ? suggestStopLoss(prices, 10, 0.6) : null;
        const sl20 = ema20 ? suggestStopLoss(prices, 20, 0.6) : null;

        return {
          ...h,
          ema10,
          ema20,
          suggestedStopLoss10: sl10,
          suggestedStopLoss20: sl20,
        };
      });

      // Process positions with EMA
      const positionsWithEMA: PositionWithEMA[] = (data.positions || []).map((p: Position) => {
        const prices = p.priceHistory.length > 0 ? p.priceHistory : [p.lastTradedPrice];
        const ema10 = prices.length >= 10 ? calculateEMA(prices, 10) : null;
        const ema20 = prices.length >= 20 ? calculateEMA(prices, 20) : null;
        const sl10 = ema10 ? suggestStopLoss(prices, 10, 0.6) : null;
        const sl20 = ema20 ? suggestStopLoss(prices, 20, 0.6) : null;

        return {
          ...p,
          ema10,
          ema20,
          suggestedStopLoss10: sl10,
          suggestedStopLoss20: sl20,
        };
      });

      setHoldings(holdingsWithEMA);
      setPositions(positionsWithEMA);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const placeStopLossOrder = async (
    symbol: string,
    token: string,
    exchange: string,
    qty: number,
    triggerPrice: number,
    transactionType: "BUY" | "SELL"
  ) => {
    setOrderLoading(symbol);
    setOrderMessage(null);

    try {
      const response = await fetch("/api/brokers/aliceblue/orders/place-stoploss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          token,
          exchange,
          qty,
          triggerPrice,
          productCode: "MIS",
          transactionType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderMessage({
          symbol,
          text: `Order placed successfully! Order ID: ${data.orderId}`,
          type: "success",
        });
      } else {
        setOrderMessage({
          symbol,
          text: data.error || "Failed to place order",
          type: "error",
        });
      }
    } catch {
      setOrderMessage({
        symbol,
        text: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setOrderLoading(null);
    }
  };

  // Remove auto-fetch on mount - user must manually sync after login
  useEffect(() => {
    // Check if we just authenticated
    const params = new URLSearchParams(window.location.search);
    const isAuthenticated = params.get('authenticated') === 'true';
    
    // Auto-fetch data after successful authentication
    if (isAuthenticated) {
      console.log('[AliceBlue] Auto-fetching data after authentication...');
      fetchData();
    }
  }, []);

  const currentSL = emaPeriod === 10 ? "suggestedStopLoss10" : "suggestedStopLoss20";
  const currentEMA = emaPeriod === 10 ? "ema10" : "ema20";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold">EMA-Based Stop Loss Orders</p>
            <p className="mt-2 text-xs text-slate-400">
              View your holdings and positions with calculated EMA values and place stop-loss orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEmaPeriod(10)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  emaPeriod === 10
                    ? "bg-amber-300 text-slate-900"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                EMA 10
              </button>
              <button
                onClick={() => setEmaPeriod(20)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  emaPeriod === 20
                    ? "bg-amber-300 text-slate-900"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                EMA 20
              </button>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Syncing..." : "Sync Holdings"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Holdings Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Holdings</h3>
          {loading ? (
            <p className="text-xs text-slate-400">Loading holdings...</p>
          ) : holdings.length === 0 ? (
            <p className="text-xs text-slate-400">No holdings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Avg Price</th>
                    <th className="pb-3">LTP</th>
                    <th className="pb-3">EMA {emaPeriod}</th>
                    <th className="pb-3">Suggested SL</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={`${holding.symbol}-${holding.exchange}`} className="border-t border-white/5">
                      <td className="py-4">
                        <div className="font-semibold text-slate-100">{holding.symbol}</div>
                        <div className="text-xs text-slate-400">{holding.exchange}</div>
                      </td>
                      <td className="py-4 text-slate-200">{holding.quantity}</td>
                      <td className="py-4 text-slate-200">₹{holding.avgPrice.toFixed(2)}</td>
                      <td className="py-4 text-slate-100">₹{holding.lastTradedPrice.toFixed(2)}</td>
                      <td className="py-4 text-slate-300">
                        {holding[currentEMA] ? `₹${holding[currentEMA]?.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-4 text-amber-200">
                        {holding[currentSL] ? `₹${holding[currentSL]?.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-4">
                        {holding[currentSL] && holding.token ? (
                          <button
                            onClick={() =>
                              placeStopLossOrder(
                                holding.symbol,
                                holding.token!,
                                holding.exchange,
                                holding.quantity,
                                holding[currentSL]!,
                                "SELL"
                              )
                            }
                            disabled={orderLoading === holding.symbol}
                            className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {orderLoading === holding.symbol ? "Placing..." : "Place SL"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Positions Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Positions</h3>
          {loading ? (
            <p className="text-xs text-slate-400">Loading positions...</p>
          ) : positions.length === 0 ? (
            <p className="text-xs text-slate-400">No positions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Net Qty</th>
                    <th className="pb-3">Avg Price</th>
                    <th className="pb-3">LTP</th>
                    <th className="pb-3">EMA {emaPeriod}</th>
                    <th className="pb-3">Suggested SL</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => {
                    const avgPrice = position.netQty > 0 ? position.avgBuyPrice : position.avgSellPrice;
                    const transType = position.netQty > 0 ? "SELL" : "BUY";
                    return (
                      <tr key={`${position.symbol}-${position.exchange}`} className="border-t border-white/5">
                        <td className="py-4">
                          <div className="font-semibold text-slate-100">{position.symbol}</div>
                          <div className="text-xs text-slate-400">{position.exchange}</div>
                        </td>
                        <td className="py-4">
                          <span className={position.netQty > 0 ? "text-emerald-200" : "text-red-200"}>
                            {position.netQty}
                          </span>
                        </td>
                        <td className="py-4 text-slate-200">₹{avgPrice.toFixed(2)}</td>
                        <td className="py-4 text-slate-100">₹{position.lastTradedPrice.toFixed(2)}</td>
                        <td className="py-4 text-slate-300">
                          {position[currentEMA] ? `₹${position[currentEMA]?.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-4 text-amber-200">
                          {position[currentSL] ? `₹${position[currentSL]?.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-4">
                          {position[currentSL] && position.token ? (
                            <button
                              onClick={() =>
                                placeStopLossOrder(
                                  position.symbol,
                                  position.token!,
                                  position.exchange,
                                  Math.abs(position.netQty),
                                  position[currentSL]!,
                                  transType
                                )
                              }
                              disabled={orderLoading === position.symbol}
                              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {orderLoading === position.symbol ? "Placing..." : "Place SL"}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {orderMessage && (
          <div
            className={`mt-6 rounded-xl border p-4 text-xs ${
              orderMessage.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/20 bg-red-500/10 text-red-200"
            }`}
          >
            <strong>{orderMessage.symbol}:</strong> {orderMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}
