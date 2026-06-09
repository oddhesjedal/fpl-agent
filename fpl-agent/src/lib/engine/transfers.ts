import { RULES } from "./config";
import type { ScoredPlayer } from "./scoring";

export interface TransferSuggestion {
  out: ScoredPlayer;
  in: ScoredPlayer;
  projectedGain: number; // in.projected - out.projected
  costChangeTenths: number; // in.cost - out.cost (negative frees money)
}

export interface TransferPlan {
  single: TransferSuggestion[]; // ranked best single moves
  double: TransferSuggestion[] | null; // best legal 2-move combo, if it beats top single
}

function clubCounts(squad: ScoredPlayer[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const p of squad) m.set(p.teamId, (m.get(p.teamId) ?? 0) + 1);
  return m;
}

// Rank single-transfer swaps that keep the squad legal (budget + max 3/club),
// swapping like-for-like by position. `candidates` is the full scored pool.
export function rankSingleTransfers(
  squad: ScoredPlayer[],
  candidates: ScoredPlayer[],
  bankTenths: number,
  limit = 12
): TransferSuggestion[] {
  const owned = new Set(squad.map((p) => p.id));
  const counts = clubCounts(squad);
  const suggestions: TransferSuggestion[] = [];

  for (const out of squad) {
    const sameType = candidates.filter(
      (c) => c.position === out.position && !owned.has(c.id) && c.availability > 0
    );
    for (const inc of sameType) {
      const budgetOk = inc.costTenths <= out.costTenths + bankTenths;
      if (!budgetOk) continue;
      // Club limit after removing `out` and adding `inc`.
      const afterOut = (counts.get(inc.teamId) ?? 0) - (out.teamId === inc.teamId ? 1 : 0);
      if (afterOut + 1 > RULES.maxPerClub) continue;

      const gain = inc.projected - out.projected;
      if (gain <= 0) continue;
      suggestions.push({
        out,
        in: inc,
        projectedGain: Number(gain.toFixed(3)),
        costChangeTenths: inc.costTenths - out.costTenths,
      });
    }
  }

  suggestions.sort((a, b) => b.projectedGain - a.projectedGain);
  // Keep the best suggestion per outgoing player to avoid a list dominated by
  // many upgrades of the same weak slot.
  const seenOut = new Set<number>();
  const deduped: TransferSuggestion[] = [];
  for (const s of suggestions) {
    if (seenOut.has(s.out.id)) continue;
    seenOut.add(s.out.id);
    deduped.push(s);
    if (deduped.length >= limit) break;
  }
  return deduped;
}

// Best legal pair of transfers, searched over the top single candidates so the
// combined cost stays within bank. Returns null if no pair beats the best single.
export function bestDoubleTransfer(
  squad: ScoredPlayer[],
  candidates: ScoredPlayer[],
  bankTenths: number
): TransferSuggestion[] | null {
  const singles = rankSingleTransfers(squad, candidates, bankTenths, 24);
  if (singles.length < 2) return null;

  let best: { combo: TransferSuggestion[]; gain: number } | null = null;
  for (let i = 0; i < singles.length; i++) {
    for (let j = i + 1; j < singles.length; j++) {
      const a = singles[i];
      const b = singles[j];
      if (a.out.id === b.out.id || a.in.id === b.in.id) continue;
      const cost = a.costChangeTenths + b.costChangeTenths;
      if (cost > bankTenths) continue;
      const gain = a.projectedGain + b.projectedGain;
      if (!best || gain > best.gain) best = { combo: [a, b], gain };
    }
  }
  if (!best) return null;
  const topSingle = singles[0]?.projectedGain ?? 0;
  return best.gain > topSingle ? best.combo : null;
}

export function buildTransferPlan(
  squad: ScoredPlayer[],
  candidates: ScoredPlayer[],
  bankTenths: number
): TransferPlan {
  return {
    single: rankSingleTransfers(squad, candidates, bankTenths),
    double: bestDoubleTransfer(squad, candidates, bankTenths),
  };
}
