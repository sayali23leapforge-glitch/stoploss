import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/holdings", label: "Holdings" },
  { href: "/aliceblue", label: "Alice Blue" },
  { href: "/integrations", label: "Integrations" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col gap-6 border-r border-white/10 bg-slate-950/60 px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400" />
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Stop</p>
          <p className="text-lg font-semibold">LossSolution</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-100">Alice Blue Integration</p>
        <p className="mt-2">EMA-based stop-loss orders with holdings & positions.</p>
      </div>
    </aside>
  );
}
