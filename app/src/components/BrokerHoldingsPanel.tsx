"use client";

import { useState } from "react";

type Holding = {
  displaySymbol?: string;
  symbol?: string;
  exchangeSegment?: string;
  quantity?: number;
  averagePrice?: number;
  closingPrice?: number;
  mktValue?: number;
  sellableQuantity?: number;
};

type HoldingsResponse = {
  data?: Holding[];
  error?: string;
};

export function BrokerHoldingsPanel() {
  const [data, setData] = useState<HoldingsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/brokers/kotak/holdings");
      const payload = (await response.json()) as HoldingsResponse;
      setData(payload);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Broker holdings</p>
          <p className="mt-2 text-sm text-slate-300">
            Fetch holdings directly from Kotak once authenticated.
          </p>
        </div>
        <button
          onClick={fetchHoldings}
          disabled={loading}
          className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Fetching..." : "Fetch holdings"}
        </button>
      </div>

      {data ? (
        <div className="mt-5 space-y-3 text-xs text-slate-300">
          <p className="text-amber-200">
            {data.error ?? "Fetched live holdings."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(data.data ?? []).map((holding) => (
              <div
                key={`${holding.displaySymbol}-${holding.exchangeSegment}`}
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-sm font-semibold text-slate-100">
                  {holding.displaySymbol ?? holding.symbol}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {holding.exchangeSegment ?? "--"} · Qty {holding.quantity ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Avg {holding.averagePrice ?? 0} · Close {holding.closingPrice ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Mkt Value {holding.mktValue ?? 0} · Sellable {holding.sellableQuantity ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
