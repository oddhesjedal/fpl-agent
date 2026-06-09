import type { ScoredPlayer } from "@/lib/engine/scoring";
import type { StartingXI } from "@/lib/engine/captain";

function Chip({
  p,
  badge,
}: {
  p: ScoredPlayer;
  badge?: "C" | "V";
}) {
  return (
    <div className="flex w-20 flex-col items-center rounded-md bg-white/95 px-1 py-1 text-center shadow">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-ink">
        <span className="truncate max-w-[64px]">{p.name}</span>
        {badge ? (
          <span className="rounded bg-ink px-1 text-[9px] font-bold text-white">{badge}</span>
        ) : null}
      </div>
      <div className="text-[10px] text-slate-500">
        {p.teamShort} · £{p.cost.toFixed(1)}
      </div>
      <div className="text-[10px] font-bold text-pitch">{p.projected.toFixed(1)} pts</div>
    </div>
  );
}

function Row({ players, xi }: { players: ScoredPlayer[]; xi: StartingXI }) {
  return (
    <div className="flex justify-center gap-2">
      {players.map((p) => (
        <Chip
          key={p.id}
          p={p}
          badge={p.id === xi.captain.id ? "C" : p.id === xi.viceCaptain.id ? "V" : undefined}
        />
      ))}
    </div>
  );
}

// Visual pitch layout of the starting XI grouped by position, plus a bench row.
export function SquadPitch({ xi }: { xi: StartingXI }) {
  const gk = xi.starters.filter((p) => p.position === 1);
  const def = xi.starters.filter((p) => p.position === 2);
  const mid = xi.starters.filter((p) => p.position === 3);
  const fwd = xi.starters.filter((p) => p.position === 4);

  return (
    <div>
      <div className="space-y-4 rounded-xl bg-gradient-to-b from-pitch to-pitchDark p-4">
        <Row players={gk} xi={xi} />
        <Row players={def} xi={xi} />
        <Row players={mid} xi={xi} />
        <Row players={fwd} xi={xi} />
      </div>
      <div className="mt-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bench (in order)
        </div>
        <div className="flex flex-wrap gap-2 rounded-md bg-slate-100 p-3">
          {xi.bench.map((p) => (
            <Chip key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
