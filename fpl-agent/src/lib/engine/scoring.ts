import type { Bootstrap, FplElement, Fixture } from "@/lib/fpl/types";
import { SCORING } from "./config";
import { averageFdr, buildTeamFixtures, type TeamFixture } from "./fixtures";

export interface ScoredPlayer {
  id: number;
  name: string;
  teamId: number;
  teamCode: number; // for the club badge image
  teamShort: string;
  photoId: string; // for the player photo image (without extension)
  position: number; // element_type
  positionShort: string; // GKP/DEF/MID/FWD
  costTenths: number; // price in tenths
  cost: number; // price in £m
  form: number;
  pointsPerGame: number;
  ictIndex: number;
  totalPoints: number;
  selectedByPercent: number;
  availability: number; // 0..1
  status: string;
  news: string;
  avgFdr: number;
  fixtures: TeamFixture[];
  projected: number; // projected points for the next gameweek
  valueScore: number; // projected points per £m
}

const num = (s: string | number | null | undefined): number => {
  if (s === null || s === undefined) return 0;
  const n = typeof s === "number" ? s : parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

function availabilityFactor(p: FplElement): number {
  if (p.chance_of_playing_next_round !== null) {
    return Math.max(0, Math.min(1, p.chance_of_playing_next_round / 100));
  }
  switch (p.status) {
    case "a":
      return 1;
    case "d":
      return 0.75; // doubtful with no explicit %
    case "i":
    case "s":
    case "u":
    case "n":
      return 0;
    default:
      return 1;
  }
}

function normalizeMax(values: number[]): (v: number) => number {
  const max = Math.max(...values, 1e-9);
  return (v: number) => v / max;
}

// Score every player for the upcoming gameweek.
export function scorePlayers(
  bootstrap: Bootstrap,
  fixtures: Fixture[]
): ScoredPlayer[] {
  const teamFixtures = buildTeamFixtures(bootstrap, fixtures);
  const shortByTeam = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
  const codeByTeam = new Map(bootstrap.teams.map((t) => [t.id, t.code]));
  const typeShort = new Map(
    bootstrap.element_types.map((t) => [t.id, t.singular_name_short])
  );

  const elements = bootstrap.elements;
  // Normalize ICT across the whole pool so it sits on the same scale as form/ppg.
  const normIct = normalizeMax(elements.map((e) => num(e.ict_index)));
  const w = SCORING.weights;
  const wSum = w.form + w.pointsPerGame + w.ict || 1;

  const clamp = SCORING.fixtureMultiplierClamp;

  return elements.map((p) => {
    const form = num(p.form);
    const ppg = num(p.points_per_game);
    const ict = num(p.ict_index);
    const availability = availabilityFactor(p);

    const fx = teamFixtures.get(p.team);
    const avgFdr = averageFdr(fx);
    const fixtureMult = Math.max(
      clamp.min,
      Math.min(clamp.max, 1 + (3 - avgFdr) * SCORING.fixtureSwing)
    );

    // Base blends form, season consistency, and underlying involvement.
    const base =
      (w.form * form + w.pointsPerGame * ppg + w.ict * normIct(ict) * 10) / wSum;

    const projected = base * fixtureMult * availability;
    const cost = p.now_cost / 10;

    return {
      id: p.id,
      name: p.web_name,
      teamId: p.team,
      teamCode: codeByTeam.get(p.team) ?? 0,
      teamShort: shortByTeam.get(p.team) ?? "?",
      photoId: (p.photo ?? "").replace(/\.(jpg|png)$/i, ""),
      position: p.element_type,
      positionShort: typeShort.get(p.element_type) ?? "?",
      costTenths: p.now_cost,
      cost,
      form,
      pointsPerGame: ppg,
      ictIndex: ict,
      totalPoints: p.total_points,
      selectedByPercent: num(p.selected_by_percent),
      availability,
      status: p.status,
      news: p.news ?? "",
      avgFdr,
      fixtures: fx ?? [],
      projected: Number(projected.toFixed(3)),
      valueScore: cost > 0 ? Number((projected / cost).toFixed(3)) : 0,
    };
  });
}
