import { AliceBlueStopLossPanel } from "@/components/AliceBlueStopLossPanel";

export default function AliceBluePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Alice Blue
        </p>
        <h2 className="font-display mt-3 text-2xl">EMA-Based Stop Loss</h2>
        <p className="mt-2 text-sm text-slate-300">
          View your holdings and positions with automatic EMA calculations (10 or 20 period). 
          Place stop-loss orders based on suggested prices derived from exponential moving averages.
        </p>
      </div>

      <AliceBlueStopLossPanel />
    </div>
  );
}
