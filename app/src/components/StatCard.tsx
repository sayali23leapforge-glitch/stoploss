import { ReactNode } from "react";

export function StatCard({
  title,
  value,
  change,
  footer,
}: {
  title: string;
  value: string;
  change?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          {title}
        </p>
        {change ? (
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            {change}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-100">{value}</p>
      {footer ? <div className="mt-4 text-xs text-slate-400">{footer}</div> : null}
    </div>
  );
}
