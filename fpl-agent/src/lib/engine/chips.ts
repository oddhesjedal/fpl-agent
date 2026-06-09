import type { Bootstrap, Fixture } from "@/lib/fpl/types";

// Chip-timing analysis from the fixture list. Double/blank gameweeks are only
// confirmed mid-season (cup reschedules), so before then this leans on fixture
// difficulty and flags low confidence.

export type ChipName = "Wildcard" | "Bench Boost" | "Triple Captain" | "Free Hit";

export interface GameweekAnalysis {
  event: number;
  name: string;
  fixtureCount: number;
  doubleTeams: string[]; // clubs playing twice (DGW)
  blankTeams: string[]; // clubs not playing (BGW)
  avgDifficulty: number; // neutral fixture difficulty, lower = easier
}

export interface ChipRecommendation {
  chip: ChipName;
  suggestedEvent: number | null;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface ChipPlan {
  gameweeks: GameweekAnalysis[];
  recommendations: ChipRecommendation[];
  hasSpecialGameweeks: boolean;
}

const HORIZON = 15; // analyze up to 15 upcoming gameweeks

export function analyzeChips(
  bootstrap: Bootstrap,
  fixtures: Fixture[],
  currentEventId: number
): ChipPlan {
  const shortById = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
  const allTeamIds = bootstrap.teams.map((t) => t.id);

  const upcomingEvents = bootstrap.events
    .filter((e) => !e.finished && e.id >= currentEventId)
    .slice(0, HORIZON);

  const gameweeks: GameweekAnalysis[] = upcomingEvents.map((e) => {
    const evFixtures = fixtures.filter((f) => f.event === e.id && !f.finished);
    const counts = new Map<number, number>();
    for (const f of evFixtures) {
      counts.set(f.team_h, (counts.get(f.team_h) ?? 0) + 1);
      counts.set(f.team_a, (counts.get(f.team_a) ?? 0) + 1);
    }
    const doubleTeams = allTeamIds
      .filter((id) => (counts.get(id) ?? 0) >= 2)
      .map((id) => shortById.get(id) ?? "?");
    const blankTeams = allTeamIds
      .filter((id) => (counts.get(id) ?? 0) === 0)
      .map((id) => shortById.get(id) ?? "?");

    const diffs = evFixtures.flatMap((f) => [f.team_h_difficulty, f.team_a_difficulty]);
    const avgDifficulty = diffs.length
      ? diffs.reduce((s, d) => s + d, 0) / diffs.length
      : 3;

    return {
      event: e.id,
      name: e.name,
      fixtureCount: evFixtures.length,
      doubleTeams,
      blankTeams,
      avgDifficulty: Number(avgDifficulty.toFixed(2)),
    };
  });

  const recommendations = buildRecommendations(gameweeks);
  const hasSpecialGameweeks = gameweeks.some(
    (g) => g.doubleTeams.length > 0 || g.blankTeams.length > 0
  );

  return { gameweeks, recommendations, hasSpecialGameweeks };
}

function buildRecommendations(gws: GameweekAnalysis[]): ChipRecommendation[] {
  if (gws.length === 0) {
    return (["Wildcard", "Bench Boost", "Triple Captain", "Free Hit"] as ChipName[]).map(
      (chip) => ({
        chip,
        suggestedEvent: null,
        confidence: "low" as const,
        reason: "No upcoming fixtures available to analyze yet.",
      })
    );
  }

  const maxDouble = [...gws].sort(
    (a, b) => b.doubleTeams.length - a.doubleTeams.length || a.avgDifficulty - b.avgDifficulty
  )[0];
  const maxBlank = [...gws].sort((a, b) => b.blankTeams.length - a.blankTeams.length)[0];
  const easiest = [...gws].sort((a, b) => a.avgDifficulty - b.avgDifficulty)[0];

  // Best 3-GW run for a Wildcard: lowest mean difficulty over a forward window.
  let wildcardStart = gws[0];
  let bestWindow = Infinity;
  for (let i = 0; i < gws.length; i++) {
    const window = gws.slice(i, i + 3);
    const mean = window.reduce((s, g) => s + g.avgDifficulty, 0) / window.length;
    if (mean < bestWindow) {
      bestWindow = mean;
      wildcardStart = gws[i];
    }
  }

  const recs: ChipRecommendation[] = [];

  // Bench Boost — want all 15 to play, ideally in a double gameweek.
  if (maxDouble.doubleTeams.length >= 4) {
    recs.push({
      chip: "Bench Boost",
      suggestedEvent: maxDouble.event,
      confidence: maxDouble.doubleTeams.length >= 6 ? "high" : "medium",
      reason: `${maxDouble.doubleTeams.length} clubs play twice in ${maxDouble.name} (${maxDouble.doubleTeams.join(
        ", "
      )}) — load your bench with players from those teams.`,
    });
  } else {
    recs.push({
      chip: "Bench Boost",
      suggestedEvent: easiest.event,
      confidence: "low",
      reason: `No double gameweek confirmed yet. ${easiest.name} has the easiest overall fixtures (avg FDR ${easiest.avgDifficulty}); save the chip if a double appears later.`,
    });
  }

  // Triple Captain — want a premium asset with two games or a soft single.
  if (maxDouble.doubleTeams.length >= 1) {
    recs.push({
      chip: "Triple Captain",
      suggestedEvent: maxDouble.event,
      confidence: maxDouble.doubleTeams.length >= 3 ? "high" : "medium",
      reason: `Captain a premium from a doubling club in ${maxDouble.name} (${maxDouble.doubleTeams.join(
        ", "
      )}) for two scoring chances.`,
    });
  } else {
    recs.push({
      chip: "Triple Captain",
      suggestedEvent: easiest.event,
      confidence: "low",
      reason: `No double gameweek yet. Best single-week option is ${easiest.name} (easiest fixtures) — ideally on an in-form premium at home.`,
    });
  }

  // Free Hit — best on a big blank (navigate missing fixtures) or large double.
  if (maxBlank.blankTeams.length >= 4) {
    recs.push({
      chip: "Free Hit",
      suggestedEvent: maxBlank.event,
      confidence: maxBlank.blankTeams.length >= 8 ? "high" : "medium",
      reason: `${maxBlank.blankTeams.length} clubs blank in ${maxBlank.name} — Free Hit fields a full team of players who actually play.`,
    });
  } else {
    recs.push({
      chip: "Free Hit",
      suggestedEvent: null,
      confidence: "low",
      reason:
        "No blank gameweek confirmed yet. Hold Free Hit for a blank GW (many clubs idle) or an exceptional double later in the season.",
    });
  }

  // Wildcard — rebuild ahead of the best upcoming fixture run.
  recs.push({
    chip: "Wildcard",
    suggestedEvent: wildcardStart.event,
    confidence: "medium",
    reason: `The strongest fixture stretch starts around ${wildcardStart.name} (3-GW avg FDR ${bestWindow.toFixed(
      2
    )}). Wildcard just before it to stock up on teams with the best run.`,
  });

  return recs;
}
