import { NextResponse } from "next/server";
import { getBootstrap, getFixtures, resolveCurrentEventId } from "@/lib/fpl/client";
import { analyzeChips } from "@/lib/engine/chips";

export const dynamic = "force-dynamic";

// Chip-timing analysis (Wildcard / Bench Boost / Triple Captain / Free Hit).
export async function GET() {
  try {
    const [bootstrap, fixtures] = await Promise.all([getBootstrap(), getFixtures()]);
    const currentEventId = resolveCurrentEventId(bootstrap);
    const plan = analyzeChips(bootstrap, fixtures, currentEventId);
    return NextResponse.json(plan);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to analyze chip timing." },
      { status: 502 }
    );
  }
}
