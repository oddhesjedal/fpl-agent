import { NextRequest, NextResponse } from "next/server";
import { loadScored } from "@/lib/data";
import { getEntryPicks } from "@/lib/fpl/client";
import { buildTransferPlan } from "@/lib/engine/transfers";
import { pickBestXI } from "@/lib/engine/captain";
import type { ScoredPlayer } from "@/lib/engine/scoring";

export const dynamic = "force-dynamic";

// Given an FPL entry (manager) id, return their current squad scored by our
// model, plus ranked transfer suggestions and a captain recommendation.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const entryId = Number(body?.entryId);
    if (!entryId || Number.isNaN(entryId)) {
      return NextResponse.json({ error: "A numeric entryId is required." }, { status: 400 });
    }

    const { scored, currentEventId } = await loadScored();
    const eventId = Number(body?.eventId) || currentEventId;

    let picks;
    try {
      picks = await getEntryPicks(entryId, eventId);
    } catch {
      return NextResponse.json(
        {
          error:
            "Couldn't load that team for this gameweek. This usually means the " +
            "season hasn't started yet, the entry id is wrong, or no squad is saved " +
            "for this gameweek.",
        },
        { status: 404 }
      );
    }

    const byId = new Map<number, ScoredPlayer>(scored.map((p) => [p.id, p]));
    const squad: ScoredPlayer[] = [];
    for (const pick of picks.picks) {
      const p = byId.get(pick.element);
      if (p) squad.push(p);
    }
    if (squad.length < 15) {
      return NextResponse.json(
        { error: "Could not match the full squad against current player data." },
        { status: 422 }
      );
    }

    const bankTenths = picks.entry_history?.bank ?? 0;
    const xi = pickBestXI(squad);
    const plan = buildTransferPlan(squad, scored, bankTenths);

    return NextResponse.json({
      entryId,
      eventId,
      bank: Number((bankTenths / 10).toFixed(1)),
      squad,
      recommendedXI: xi,
      transfers: plan,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to analyze team." },
      { status: 500 }
    );
  }
}
