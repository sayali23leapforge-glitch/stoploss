import { StatCard } from "@/components/StatCard";
import { mockHoldingsRiskNotes } from "@/lib/mock-data";
import { fetchHoldings } from "@/lib/kotak-client";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSession, getKotakSettings } from "@/lib/store";

export default async function OverviewPage() {
  let totalValue = 0;
  let holdingsCount = 0;
  let statusNote = "Connect Kotak to see live holdings.";

  try {
    const userId = await requireUserId();
    const settings = getKotakSettings(userId);
    const session = getKotakSession(userId);
    if (settings && session) {
      const response = await fetchHoldings(session.baseUrl, session);
      const holdings = response.data ?? [];
      holdingsCount = holdings.length;
      totalValue = holdings.reduce((sum: number, holding: any) => {
        const value = Number(
          holding.mktValue ??
            (holding.closingPrice ?? 0) * (holding.quantity ?? 0)
        );
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
      statusNote = "Live holdings snapshot.";
    }
  } catch {
    statusNote = "Unable to load holdings right now.";
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Value"
          value={`Rs ${totalValue.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          footer={statusNote}
        />
        <StatCard
          title="Active Brokers"
          value="Kotak Neo"
          footer="Additional brokers can be added later."
        />
        <StatCard
          title="Holdings"
          value={`${holdingsCount}`}
          footer="Live count from portfolio API."
        />
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold">Todays Focus</p>
          <h2 className="font-display mt-4 text-2xl">
            Tighten trailing stops for momentum winners.
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            EMA suggestions begin once enough price history is collected. Review
            each holding before enabling automated execution.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Signal cadence
              </p>
              <p className="mt-2 text-lg font-semibold">Every 15 minutes</p>
              <p className="text-xs text-slate-400">
                Configurable in the next milestone.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Execution mode
              </p>
              <p className="mt-2 text-lg font-semibold">Suggestion only</p>
              <p className="text-xs text-slate-400">No orders placed yet.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold">Risk notes</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {mockHoldingsRiskNotes.map((note) => (
              <li key={note} className="rounded-xl border border-white/10 p-3">
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-slate-400">
            This dashboard is for educational purposes only.
          </p>
        </div>
      </section>
    </div>
  );
}
