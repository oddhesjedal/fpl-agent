import { RULES } from "./config";
import type { ScoredPlayer } from "./scoring";

export interface StartingXI {
  formation: string; // e.g. "3-4-3" (DEF-MID-FWD)
  starters: ScoredPlayer[]; // 11
  bench: ScoredPlayer[]; // 4, in suggested order (bench GK last)
  captain: ScoredPlayer;
  viceCaptain: ScoredPlayer;
  projectedPoints: number; // starters summed, captain doubled
}

const byProjectedDesc = (a: ScoredPlayer, b: ScoredPlayer) => b.projected - a.projected;

// Enumerate every legal outfield formation (DEF/MID/FWD counts) summing to 10.
function legalFormations(): Array<{ def: number; mid: number; fwd: number }> {
  const b = RULES.formationBounds;
  const out: Array<{ def: number; mid: number; fwd: number }> = [];
  for (let def = b[2].min; def <= b[2].max; def++) {
    for (let mid = b[3].min; mid <= b[3].max; mid++) {
      for (let fwd = b[4].min; fwd <= b[4].max; fwd++) {
        if (def + mid + fwd === RULES.startingXI - 1) out.push({ def, mid, fwd });
      }
    }
  }
  return out;
}

// Given a full 15-man squad, choose the starting XI that maximizes projected
// points across all legal formations, then captain/vice and bench order.
export function pickBestXI(squad: ScoredPlayer[]): StartingXI {
  const gks = squad.filter((p) => p.position === 1).sort(byProjectedDesc);
  const defs = squad.filter((p) => p.position === 2).sort(byProjectedDesc);
  const mids = squad.filter((p) => p.position === 3).sort(byProjectedDesc);
  const fwds = squad.filter((p) => p.position === 4).sort(byProjectedDesc);

  const startGk = gks[0];
  let best: {
    starters: ScoredPlayer[];
    formation: string;
    total: number;
  } | null = null;

  for (const f of legalFormations()) {
    if (defs.length < f.def || mids.length < f.mid || fwds.length < f.fwd) continue;
    const starters = [
      startGk,
      ...defs.slice(0, f.def),
      ...mids.slice(0, f.mid),
      ...fwds.slice(0, f.fwd),
    ];
    const total = starters.reduce((s, p) => s + p.projected, 0);
    if (!best || total > best.total) {
      best = { starters, formation: `${f.def}-${f.mid}-${f.fwd}`, total };
    }
  }

  if (!best) {
    // Fallback (should not happen with a valid 15): start the top 11.
    const starters = [...squad].sort(byProjectedDesc).slice(0, 11);
    best = { starters, formation: "n/a", total: starters.reduce((s, p) => s + p.projected, 0) };
  }

  const starterIds = new Set(best.starters.map((p) => p.id));
  const benchOutfield = squad
    .filter((p) => !starterIds.has(p.id) && p.position !== 1)
    .sort(byProjectedDesc);
  const benchGk = gks.slice(1); // spare keeper(s)
  const bench = [...benchOutfield, ...benchGk];

  const rankedStarters = [...best.starters].sort(byProjectedDesc);
  const captain = rankedStarters[0];
  const viceCaptain = rankedStarters[1] ?? rankedStarters[0];

  const projectedPoints =
    best.starters.reduce((s, p) => s + p.projected, 0) + captain.projected;

  return {
    formation: best.formation,
    starters: best.starters,
    bench,
    captain,
    viceCaptain,
    projectedPoints: Number(projectedPoints.toFixed(2)),
  };
}
