import { HoldingsTable } from "@/components/HoldingsTable";

export default function HoldingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Holdings
        </p>
        <h2 className="font-display mt-3 text-2xl">
          EMA-driven stop-loss suggestions
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Configure EMA periods and review the suggested stop-loss per holding.
        </p>
      </div>
      <HoldingsTable />
    </div>
  );
}
