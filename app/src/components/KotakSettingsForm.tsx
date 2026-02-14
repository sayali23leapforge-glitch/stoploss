"use client";

import { useState } from "react";

const emptyState = {
  accessToken: "",
  mobileNumber: "",
  ucc: "",
  mpin: "",
  totp: "",
};

export function KotakSettingsForm() {
  const [formState, setFormState] = useState(emptyState);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const updateField = (field: keyof typeof emptyState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/brokers/kotak/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!response.ok) {
        setStatus("Could not save settings.");
        return;
      }
      setStatus("Settings saved. Ready to authenticate.");
    } catch {
      setStatus("Could not save settings.");
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    setAuthLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/brokers/kotak/auth/login", {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus(payload.error ?? "Authentication failed.");
        return;
      }
      setStatus(`Authenticated. Base URL: ${payload.baseUrl}`);
    } catch {
      setStatus("Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Access token
          <input
            value={formState.accessToken}
            onChange={(event) => updateField("accessToken", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="NEO access token"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Mobile number
          <input
            value={formState.mobileNumber}
            onChange={(event) => updateField("mobileNumber", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="+91XXXXXXXXXX"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Client code (UCC)
          <input
            value={formState.ucc}
            onChange={(event) => updateField("ucc", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="ABC123"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          MPIN
          <input
            value={formState.mpin}
            onChange={(event) => updateField("mpin", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="******"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          TOTP
          <input
            value={formState.totp}
            onChange={(event) => updateField("totp", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            placeholder="123456"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save settings"}
        </button>
        <button
          type="button"
          onClick={authenticate}
          disabled={authLoading}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Authenticating..." : "Authenticate with Kotak"}
        </button>
      </div>
      {status ? <p className="text-sm text-amber-200">{status}</p> : null}
    </form>
  );
}
