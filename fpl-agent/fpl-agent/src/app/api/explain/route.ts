import { NextRequest, NextResponse } from "next/server";
import { explain, type ExplainPayload } from "@/lib/llm/explain";

export const dynamic = "force-dynamic";

// Optional natural-language rationale. Works without an API key (templated).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplainPayload;
    if (!body?.kind || !body?.summary) {
      return NextResponse.json({ error: "kind and summary are required." }, { status: 400 });
    }
    const result = await explain(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Explanation failed." },
      { status: 500 }
    );
  }
}
