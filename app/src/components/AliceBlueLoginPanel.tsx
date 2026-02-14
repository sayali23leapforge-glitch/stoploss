"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AliceBlueLoginPanel() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Full page redirect flow - no popup message handling needed

  const handleLogin = () => {
    setProcessing(true);
    setMessage(null);
    
    console.log("[AliceBlueLoginPanel] Redirecting to Alice Blue login...");
    
    // CRITICAL: Full page redirect to login.
    // DO NOT use popup - OAuth requires full page navigation.
    // Popup gets closed when Alice Blue tries to redirect back to callback.
    router.push("/api/brokers/aliceblue/login");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <p className="text-sm font-semibold">Alice Blue Authentication</p>
        <p className="mt-2 text-xs text-slate-400">
          Click below to login to your Alice Blue account. A popup window will open where you can enter your credentials.
        </p>
      </div>

      <button
        onClick={handleLogin}
        disabled={processing}
        className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {processing ? "Opening Alice Blue Login..." : "Login to Alice Blue"}
      </button>

      {message && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/20 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
