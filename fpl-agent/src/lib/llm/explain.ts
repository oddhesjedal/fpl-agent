import Anthropic from "@anthropic-ai/sdk";

// Optional natural-language rationale for a recommendation.
// If ANTHROPIC_API_KEY is unset, we return a deterministic templated summary so
// the dashboard works fully without any LLM dependency.

export interface ExplainPayload {
  kind: "squad" | "captain" | "transfers";
  // A compact, already-computed summary the model should explain — never raw data.
  summary: Record<string, unknown>;
}

const MODEL = "claude-sonnet-4-6";

export async function explain(payload: ExplainPayload): Promise<{
  source: "llm" | "template";
  text: string;
}> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { source: "template", text: templateExplain(payload) };
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system:
        "You are an FPL assistant. Explain the provided, already-computed recommendation " +
        "in clear, concise English for a manager. Do not invent stats beyond the JSON. " +
        "Be specific about why (form, fixtures, value) and keep it under 180 words.",
      messages: [
        {
          role: "user",
          content:
            `Here is a ${payload.kind} recommendation as JSON. Explain the reasoning:\n\n` +
            JSON.stringify(payload.summary, null, 2),
        },
      ],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { source: "llm", text: text || templateExplain(payload) };
  } catch {
    // Network/key/quota issues should never break the dashboard.
    return { source: "template", text: templateExplain(payload) };
  }
}

function templateExplain(payload: ExplainPayload): string {
  const s = payload.summary as any;
  switch (payload.kind) {
    case "captain":
      return (
        `Recommended captain: ${s.captain} (projected ${s.captainProjected}). ` +
        `Vice: ${s.vice}. The pick maximizes projected points among your starters, ` +
        `factoring recent form and upcoming fixture difficulty.`
      );
    case "squad":
      return (
        `This 15-man squad maximizes projected points within the £100m budget ` +
        `(spent £${s.totalCost}m), respecting 2/5/5/3 positions and max 3 per club. ` +
        `Starting formation ${s.formation}, projected ${s.projectedStartingPoints} pts ` +
        `with the captain doubled.`
      );
    case "transfers":
      return (
        `Top suggested move: ${s.topOut} → ${s.topIn} for a projected gain of ` +
        `${s.topGain} pts. Suggestions keep your squad legal on budget and the ` +
        `max-3-per-club rule.`
      );
    default:
      return "No explanation available.";
  }
}
