import type { ScoredPlayer } from "@/lib/engine/scoring";
import type { StartingXI } from "@/lib/engine/captain";
import { PlayerPhoto } from "./Badge";

function Chip({ p, badge }: { p: ScoredPlayer; badge?: "C" | "V" }) {
  return (
    <div className="relative flex w-[78px] flex-col items-center">
      {badge ? (
        <span className="absolute -right-1 -top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-fpl-green text-[10px] font-extrabold text-fpl-purple shadow">
          {badge}
        </span>
      ) : null}
      <PlayerPhoto photoId={p.photoId} teamCode={p.teamCode} size={48} />
      <div className="mt-1 w-full rounded-md bg-white/95 px-1 py-0.5 text-center shadow">
        <div className="truncate text-[11px] font-semibold text-fpl-purple">{p.name}</div>
        <div className="text-[10px] text-slate-500">
          {p.teamShort} · £{p.cost.toFixed(1)}
        </div>
        <div className="text-[10px] font-bold text-fpl-greenDark">{p.projected.toFixed(1)} pts</div>
      </div>
    </div>
  );
}

function Row({ players, xi }: { players: ScoredPlayer[]; xi: StartingXI }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
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
      <div className="space-y-5 rounded-2xl bg-fpl-pitch p-5 shadow-card ring-1 ring-black/5">
        <Row players={gk} xi={xi} />
        <Row players={def} xi={xi} />
        <Row players={mid} xi={xi} />
        <Row players={fwd} xi={xi} />
      </div>
      <div className="mt-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-fpl-purpleSoft">
          Bench (in order)
        </div>
        <div className="flex flex-wrap gap-3 rounded-2xl bg-fpl-purple/5 p-3">
          {xi.bench.map((p) => (
            <Chip key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
