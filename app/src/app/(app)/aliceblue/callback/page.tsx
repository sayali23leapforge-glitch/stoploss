"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AliceBlueCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      const authCode = searchParams.get("authCode");
      const userId = searchParams.get("userId");

      if (!authCode || !userId) {
        setStatus("error");
        setErrorMessage("Missing auth code or user ID from Alice Blue.");
        return;
      }

      try {
        setStatus("processing");
        const response = await fetch(
          `/api/brokers/aliceblue/callback?authCode=${encodeURIComponent(
            authCode
          )}&userId=${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
          setStatus("error");
          const text = await response.text();
          setErrorMessage(text || "Failed to finalize authentication.");
          return;
        }

        router.push("/integrations?success=true");
      } catch (error) {
        setStatus("error");
        const message =
          error instanceof Error ? error.message : "Network error. Please try again.";
        setErrorMessage(message);
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
          <h1 className="text-xl font-semibold text-red-200">Authentication Failed</h1>
          <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
          <button
            onClick={() => router.push("/integrations")}
            className="mt-6 w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-95"
          >
            Return to Integrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-300"></div>
        <h1 className="text-xl font-semibold">Connecting to Alice Blue...</h1>
        <p className="mt-4 text-sm text-slate-400">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
