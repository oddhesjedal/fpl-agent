import { NextResponse } from "next/server";
import { loadScored } from "@/lib/data";
import { optimizeSquad } from "@/lib/engine/optimizer";

export const dynamic = "force-dynamic";

// Optimal 15-man squad + starting XI + captain for the upcoming gameweek.
export async function GET() {
  try {
    const { scored } = await loadScored();
    const result = optimizeSquad(scored);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Optimization failed." },
      { status: 500 }
    );
  }
}
