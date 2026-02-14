"use client";

import { useState } from "react";

type ScripResponse = {
  data?: {
    filesPaths: string[];
    baseFolder: string;
  };
  error?: string;
};

export function ScripMasterPanel() {
  const [data, setData] = useState<ScripResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/brokers/kotak/scrips");
      const payload = (await response.json()) as ScripResponse;
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
          <p className="text-sm font-semibold">Scrip master file paths</p>
          <p className="mt-2 text-sm text-slate-300">
            Fetch the latest master scrip CSV links after Kotak authentication.
          </p>
        </div>
        <button
          onClick={fetchPaths}
          disabled={loading}
          className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Fetching..." : "Fetch file paths"}
        </button>
      </div>

      {data ? (
        <div className="mt-5 space-y-3 text-xs text-slate-300">
          <p className="text-amber-200">
            {data.error ?? "Fetched live scrip master file paths."}
          </p>
          <p className="text-slate-400">
            Base folder: {data.data?.baseFolder ?? "--"}
          </p>
          <ul className="space-y-2">
            {(data.data?.filesPaths ?? []).map((path) => (
              <li key={path} className="rounded-xl border border-white/10 p-3">
                {path}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
