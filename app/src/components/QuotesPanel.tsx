"use client";

import { useState } from "react";

const filters = [
  "all",
  "52W",
  "scrip_details",
  "circuit_limits",
  "ohlc",
  "oi",
  "depth",
  "ltp",
];

type Quote = {
  exchange_token: string;
  display_symbol: string;
  exchange: string;
  lstup_time: string;
  ltp: string;
  per_change?: string;
  ohlc?: {
    open: string;
    high: string;
    low: string;
    close: string;
  };
};

type QuotesResponse = {
  status: string;
  filter: string;
  data: Quote[];
  error?: string;
};

export function QuotesPanel() {
  const [query, setQuery] = useState("nse_cm|Nifty 50,nse_cm|RELIANCE");
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState<QuotesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/brokers/kotak/quotes?query=${encodeURIComponent(
          query
        )}&filter=${filter}`
      );
      const payload = (await response.json()) as QuotesResponse;
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
          <p className="text-sm font-semibold">Live quotes preview</p>
          <p className="mt-2 text-sm text-slate-300">
            Query using exchange segment + pSymbol (or index name). Add filters
            for depth, OHLC, etc.
          </p>
        </div>
        <button
          onClick={fetchQuotes}
          disabled={loading}
          className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Fetching..." : "Fetch quotes"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Query string
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="nse_cm|Nifty 50,nse_cm|RELIANCE"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Filter
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
          >
            {filters.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {data ? (
        <div className="mt-5 space-y-4 text-xs text-slate-300">
          <p className="text-amber-200">
            {data.error ?? "Fetched live quotes."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(Array.isArray(data.data) ? data.data : []).map((quote) => (
              <div
                key={`${quote.exchange}-${quote.exchange_token}`}
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-sm font-semibold text-slate-100">
                  {quote.display_symbol}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {quote.exchange} · LTP {quote.ltp}
                </p>
                {quote.per_change ? (
                  <p className="mt-1 text-xs text-emerald-200">
                    {quote.per_change}%
                  </p>
                ) : null}
                {quote.ohlc ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <span>O: {quote.ohlc.open}</span>
                    <span>H: {quote.ohlc.high}</span>
                    <span>L: {quote.ohlc.low}</span>
                    <span>C: {quote.ohlc.close}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
