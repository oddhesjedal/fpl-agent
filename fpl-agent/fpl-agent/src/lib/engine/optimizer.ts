import solver from "javascript-lp-solver";
import { RULES } from "./config";
import type { ScoredPlayer } from "./scoring";
import { pickBestXI, type StartingXI } from "./captain";

export interface OptimizedSquad {
  squad: ScoredPlayer[]; // 15 players
  xi: StartingXI; // starting 11 + captain/vice + bench
  totalCostTenths: number;
  totalCost: number; // £m
  projectedStartingPoints: number; // sum of XI projected (captain doubled)
}

// Reduce the ~600-player pool to a tractable candidate set for the ILP while
// keeping both high-value picks and cheap enablers needed to balance the budget.
function buildCandidatePool(players: ScoredPlayer[]): ScoredPlayer[] {
  const available = players.filter((p) => p.availability > 0);
  const pool = new Map<number, ScoredPlayer>();
  for (const type of [1, 2, 3, 4]) {
    const ofType = available.filter((p) => p.position === type);
    const byProjected = [...ofType].sort((a, b) => b.projected - a.projected).slice(0, 35);
    const byValue = [...ofType].sort((a, b) => b.valueScore - a.valueScore).slice(0, 20);
    const cheapest = [...ofType].sort((a, b) => a.costTenths - b.costTenths).slice(0, 15);
    for (const p of [...byProjected, ...byValue, ...cheapest]) pool.set(p.id, p);
  }
  return [...pool.values()];
}

const TYPE_KEY: Record<number, string> = { 1: "gk", 2: "def", 3: "mid", 4: "fwd" };

// Select the optimal 15-man squad maximizing projected points under the FPL
// budget, position, and per-club constraints via a binary integer program.
export function optimizeSquad(players: ScoredPlayer[]): OptimizedSquad {
  const pool = buildCandidatePool(players);

  const constraints: Record<string, { equal?: number; max?: number }> = {
    budget: { max: RULES.budgetTenths },
    total: { equal: RULES.squadSize },
    gk: { equal: RULES.squadByType[1] },
    def: { equal: RULES.squadByType[2] },
    mid: { equal: RULES.squadByType[3] },
    fwd: { equal: RULES.squadByType[4] },
  };

  const variables: Record<string, Record<string, number>> = {};
  const binaries: Record<string, number> = {};
  const clubKeys = new Set<string>();

  for (const p of pool) {
    const key = `p${p.id}`;
    const clubKey = `club_${p.teamId}`;
    clubKeys.add(clubKey);
    variables[key] = {
      projected: p.projected,
      budget: p.costTenths,
      total: 1,
      [TYPE_KEY[p.position]]: 1,
      [clubKey]: 1,
    };
    binaries[key] = 1;
  }
  for (const ck of clubKeys) constraints[ck] = { max: RULES.maxPerClub };

  const model = {
    optimize: "projected",
    opType: "max",
    constraints,
    variables,
    binaries,
  };

  const result = solver.Solve(model) as unknown as Record<string, number> & {
    feasible: boolean;
  };

  if (!result.feasible) {
    throw new Error("No feasible squad found within the budget and constraints.");
  }

  const byId = new Map(pool.map((p) => [p.id, p]));
  const squad: ScoredPlayer[] = [];
  for (const k of Object.keys(result)) {
    if (k.startsWith("p") && result[k] === 1) {
      const id = Number(k.slice(1));
      const p = byId.get(id);
      if (p) squad.push(p);
    }
  }

  const xi = pickBestXI(squad);
  const totalCostTenths = squad.reduce((s, p) => s + p.costTenths, 0);

  return {
    squad,
    xi,
    totalCostTenths,
    totalCost: Number((totalCostTenths / 10).toFixed(1)),
    projectedStartingPoints: xi.projectedPoints,
  };
}
