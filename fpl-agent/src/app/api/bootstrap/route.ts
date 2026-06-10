import { NextResponse } from "next/server";
import { loadScored } from "@/lib/data";
import { buildTeamFixtures } from "@/lib/engine/fixtures";

export const dynamic = "force-dynamic";

// Scored players + lightweight metadata for the dashboard, players, and
// fixtures pages.
export async function GET() {
  try {
    const { bootstrap, fixtures, scored, currentEventId } = await loadScored();
    const teamFixtures = buildTeamFixtures(bootstrap, fixtures);

    return NextResponse.json({
      currentEventId,
      events: bootstrap.events.map((e) => ({
        id: e.id,
        name: e.name,
        deadline_time: e.deadline_time,
        is_current: e.is_current,
        is_next: e.is_next,
        finished: e.finished,
      })),
      teams: bootstrap.teams.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        short_name: t.short_name,
        fixtures: teamFixtures.get(t.id) ?? [],
      })),
      players: scored,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to load FPL data." },
      { status: 502 }
    );
  }
}
