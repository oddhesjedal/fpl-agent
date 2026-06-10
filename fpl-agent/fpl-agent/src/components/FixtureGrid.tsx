import type { TeamFixture } from "@/lib/engine/fixtures";

const fdrClass = (d: number) => `fdr-${Math.min(5, Math.max(1, Math.round(d)))}`;

// A row of upcoming fixtures coloured by difficulty (green easy -> red hard).
export function FixtureRun({ fixtures }: { fixtures: TeamFixture[] }) {
  if (!fixtures.length) {
    return <span className="text-xs text-slate-400">no fixtures</span>;
  }
  return (
    <div className="flex gap-1">
      {fixtures.map((f) => (
        <span
          key={`${f.event}-${f.opponentId}`}
          className={`pill ${fdrClass(f.difficulty)}`}
          title={`GW${f.event} · FDR ${f.difficulty}`}
        >
          {f.opponentShort}
          {f.isHome ? " (H)" : " (A)"}
        </span>
      ))}
    </div>
  );
}
