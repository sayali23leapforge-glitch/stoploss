import { AuthUser } from "@/lib/auth";

export function Topbar({ user }: { user: AuthUser | null }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 pb-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Portfolio</p>
        <h1 className="font-display text-3xl">Adaptive Stop-Loss Desk</h1>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400" />
        <div>
          <p className="text-sm font-semibold">
            {user?.name ?? "Demo User"}
          </p>
          <p className="text-xs text-slate-400">{user?.email ?? "demo@stopsafe"}</p>
        </div>
      </div>
    </header>
  );
}
