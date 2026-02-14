"use client";

import { useState } from "react";

export function AliceBlueSettingsForm() {
  const [userId, setUserId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/brokers/aliceblue/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, apiKey, apiSecret }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleLoginToAliceBlue = () => {
    if (!userId || !apiKey || !apiSecret) {
      setMessage({ type: "error", text: "Please save API settings first" });
      return;
    }
    // Redirect to Alice Blue login
    window.location.href = "/api/brokers/aliceblue/login";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <p className="text-sm font-semibold">Alice Blue API Settings</p>
        <p className="mt-2 text-xs text-slate-400">
          Enter your API credentials, then click Login to authenticate with your Alice Blue account.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your Alice Blue User ID"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            App Code (API Key)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Alice Blue App Code / API Key"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            App Secret (API Secret)
          </label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="Enter your Alice Blue App Secret"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
        </div>

        <div className="grid gap-3 grid-cols-2">
          <button
            onClick={handleSave}
            disabled={saving || !userId || !apiKey || !apiSecret}
            className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button
            onClick={handleLoginToAliceBlue}
            disabled={!userId || !apiKey || !apiSecret}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Login to Alice Blue
          </button>
        </div>

        {message && (
          <div
            className={`rounded-xl border p-3 text-xs ${
              message.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/20 bg-red-500/10 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}


