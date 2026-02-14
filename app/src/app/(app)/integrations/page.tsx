import { KotakSettingsForm } from "@/components/KotakSettingsForm";
import { AliceBlueSettingsForm } from "@/components/AliceBlueSettingsForm";
import { AliceBlueHoldingsDisplay } from "@/components/AliceBlueHoldingsDisplay";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Integrations
        </p>
        <h2 className="font-display mt-3 text-2xl">Broker connections</h2>
        <p className="mt-2 text-sm text-slate-300">
          Connect Alice Blue or Kotak Neo to enable EMA-based stop-loss order placement.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Alice Blue</p>
            <p className="mt-2 text-sm text-slate-300">
              Full-featured broker integration with holdings, positions, and EMA-based stop-loss orders.
            </p>
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
            Ready for setup
          </span>
        </div>
        <div className="mt-6">
          <AliceBlueSettingsForm />
        </div>
      </div>

      <AliceBlueHoldingsDisplay />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Kotak Neo Trade API</p>
            <p className="mt-2 text-sm text-slate-300">
              Uses the two-step login flow (tradeApiLogin + tradeApiValidate)
              with TOTP and MPIN.
            </p>
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
            Ready for setup
          </span>
        </div>
        <div className="mt-6">
          <KotakSettingsForm />
        </div>
      </div>
    </div>
  );
}

