"use client";

import { useEffect, useState } from "react";

type Holding = {
  symbol: string;
  exchange: string;
  quantity: number;
  avgPrice: number;
  lastTradedPrice: number;
  dayChangePct: number;
};

export function AliceBlueHoldingsDisplay() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/aliceblue/holdings");
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - this is normal, don't show error
            setLoading(false);
            return;
          }
          setError(data.error || "Failed to fetch holdings");
          return;
        }

        setHoldings(data.holdings || []);
        setUserId(data.userId || "");
      } catch (err) {
        console.error("Error fetching holdings:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-sm text-red-200">Failed to load holdings: {error}</p>
      </div>
    );
  }

  if (holdings.length === 0) {
    return null; // No holdings, don't show anything
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Alice Blue Holdings
        </p>
        <h3 className="font-display mt-2 text-xl">Connected as {userId}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-400 border-b border-white/10">
            <tr>
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Exchange</th>
              <th className="pb-3">Qty</th>
              <th className="pb-3">Avg Price</th>
              <th className="pb-3">LTP</th>
              <th className="pb-3">Change %</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, idx) => (
              <tr key={idx} className="border-t border-white/5">
                <td className="py-4 font-semibold text-slate-100">{holding.symbol}</td>
                <td className="py-4 text-slate-300">{holding.exchange}</td>
                <td className="py-4 text-slate-200">{holding.quantity}</td>
                <td className="py-4 text-slate-200">₹{holding.avgPrice.toFixed(2)}</td>
                <td className="py-4 text-slate-100">₹{holding.lastTradedPrice.toFixed(2)}</td>
                <td className={`py-4 ${holding.dayChangePct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {holding.dayChangePct >= 0 ? '+' : ''}{holding.dayChangePct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
