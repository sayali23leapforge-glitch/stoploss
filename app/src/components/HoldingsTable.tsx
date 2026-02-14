"use client";

import { useEffect, useState } from "react";
import { EMA_PERIODS } from "@/lib/stoploss";

export type HoldingSuggestion = {
  symbol: string;
  exchange: string;
  quantity: number;
  avgPrice: number;
  lastTradedPrice: number;
  dayChangePct: number;
  ema: number | null;
  suggestedStopLoss: number | null;
};

export function HoldingsTable() {
  const [period, setPeriod] = useState<number>(10);
  const [data, setData] = useState<HoldingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    fetch(`/api/holdings?period=${period}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!isActive) return;
        if (payload.error) {
          setError(payload.error);
          setData([]);
          return;
        }
        setError(null);
        setData(payload.holdings ?? []);
      })
      .catch(() => {
        if (!isActive) return;
        setError("Unable to load holdings.");
        setData([]);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [period]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Holdings & suggested stop-loss</p>
          <p className="text-xs text-slate-400">
            EMA builds as price history accumulates; suggestions appear once
            enough data is collected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {EMA_PERIODS.map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                value === period
                  ? "bg-amber-300 text-slate-900"
                  : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              EMA {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Qty</th>
              <th className="pb-3">Avg Price</th>
              <th className="pb-3">LTP</th>
              <th className="pb-3">Day %</th>
              <th className="pb-3">EMA</th>
              <th className="pb-3">Suggested SL</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-slate-400" colSpan={7}>
                  Loading holdings...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="py-6 text-amber-200" colSpan={7}>
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="py-6 text-slate-400" colSpan={7}>
                  No holdings found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.symbol} className="border-t border-white/5">
                  <td className="py-4 font-semibold text-slate-100">
                    {row.symbol}
                    <span className="ml-2 text-xs text-slate-400">
                      {row.exchange}
                    </span>
                  </td>
                  <td className="py-4 text-slate-200">{row.quantity}</td>
                  <td className="py-4 text-slate-200">₹{row.avgPrice}</td>
                  <td className="py-4 text-slate-100">₹{row.lastTradedPrice}</td>
                  <td className="py-4 text-emerald-200">
                    {row.dayChangePct}%
                  </td>
                  <td className="py-4 text-slate-300">
                    {row.ema ? `₹${row.ema}` : "—"}
                  </td>
                  <td className="py-4 text-amber-200">
                    {row.suggestedStopLoss ? `₹${row.suggestedStopLoss}` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
