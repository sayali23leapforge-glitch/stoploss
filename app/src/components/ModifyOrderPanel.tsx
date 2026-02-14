"use client";

import { useState } from "react";

const defaultJData = {
  tk: "11536",
  mp: "0",
  pc: "NRML",
  dd: "NA",
  dq: "0",
  vd: "DAY",
  ts: "TATAPOWER-EQ",
  tt: "B",
  pr: "3001",
  tp: "0",
  qt: "10",
  no: "220106000000185",
  es: "nse_cm",
  pt: "L",
};

export function ModifyOrderPanel() {
  const [payload, setPayload] = useState(JSON.stringify(defaultJData, null, 2));
  const [status, setStatus] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    setResponse(null);

    try {
      const parsed = JSON.parse(payload);
      const res = await fetch("/api/brokers/kotak/orders/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jData: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "Modify failed.");
      } else {
        setStatus("Modify request sent.");
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatus("Invalid JSON or request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Modify order</p>
          <p className="mt-2 text-sm text-slate-300">
            Modify an existing order before execution.
          </p>
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send modify"}
        </button>
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          jData payload
        </label>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={12}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 outline-none focus:border-amber-300"
        />
      </div>

      {status ? (
        <p className="mt-4 text-sm text-amber-200">{status}</p>
      ) : null}
      {response ? (
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-200">
          {response}
        </pre>
      ) : null}
    </div>
  );
}
