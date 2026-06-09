import type { Bootstrap, Fixture } from "@/lib/fpl/types";
import { SCORING } from "./config";

export interface TeamFixture {
  event: number;
  opponentId: number;
  opponentShort: string;
  isHome: boolean;
  difficulty: number; // 1 easy .. 5 hard, from the team's perspective
}

// Build, for each team id, the list of its upcoming (unfinished) fixtures
// ordered by gameweek, capped at the scoring horizon.
export function buildTeamFixtures(
  bootstrap: Bootstrap,
  fixtures: Fixture[],
  horizon: number = SCORING.fixtureHorizon
): Map<number, TeamFixture[]> {
  const shortById = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
  const byTeam = new Map<number, TeamFixture[]>();
  for (const t of bootstrap.teams) byTeam.set(t.id, []);

  const upcoming = fixtures
    .filter((f) => !f.finished && f.event != null)
    .sort((a, b) => (a.event ?? 0) - (b.event ?? 0));

  for (const f of upcoming) {
    const ev = f.event as number;
    byTeam.get(f.team_h)?.push({
      event: ev,
      opponentId: f.team_a,
      opponentShort: shortById.get(f.team_a) ?? "?",
      isHome: true,
      difficulty: f.team_h_difficulty,
    });
    byTeam.get(f.team_a)?.push({
      event: ev,
      opponentId: f.team_h,
      opponentShort: shortById.get(f.team_h) ?? "?",
      isHome: false,
      difficulty: f.team_a_difficulty,
    });
  }

  for (const [teamId, list] of byTeam) {
    list.sort((a, b) => a.event - b.event);
    byTeam.set(teamId, list.slice(0, horizon));
  }
  return byTeam;
}

// Average fixture difficulty over the horizon for a team. Neutral 3 if unknown.
export function averageFdr(teamFixtures: TeamFixture[] | undefined): number {
  if (!teamFixtures || teamFixtures.length === 0) return 3;
  const sum = teamFixtures.reduce((s, f) => s + f.difficulty, 0);
  return sum / teamFixtures.length;
}
