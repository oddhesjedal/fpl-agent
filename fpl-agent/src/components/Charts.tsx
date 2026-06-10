import { TeamBadge } from "./Badge";

export interface BarDatum {
  label: string;
  value: number;
  badgeCode?: number;
  barClass?: string; // optional tailwind bg-* class to override the fill colour
  display?: string; // optional pre-formatted value label
}

// Lightweight horizontal bar chart — pure CSS, no chart library.
export function HBarChart({
  data,
  accent = "bg-fpl-green",
  labelWidth = "w-28",
}: {
  data: BarDatum[];
  accent?: string;
  labelWidth?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 0.0001);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`${labelWidth} flex shrink-0 items-center gap-1 truncate text-xs font-medium text-fpl-purple`}
          >
            {d.badgeCode ? <TeamBadge code={d.badgeCode} size={16} /> : null}
            <span className="truncate">{d.label}</span>
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-fpl-purple/5">
            <div
              className={`h-5 rounded ${d.barClass ?? accent}`}
              style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
            <span className="absolute right-2 top-0 leading-5 text-[11px] font-bold text-fpl-purple">
              {d.display ?? d.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
