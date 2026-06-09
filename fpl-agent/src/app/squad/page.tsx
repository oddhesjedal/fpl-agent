"use client";

import { useEffect, useState } from "react";
import { SquadPitch } from "@/components/SquadPitch";
import { StatCard } from "@/components/StatCard";
import { ExplainButton } from "@/components/ExplainButton";
import type { OptimizeResponse } from "@/lib/api-types";

export default function SquadPage() {
  const [opt, setOpt] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const o = await fetch("/api/optimize").then((r) => r.json());
        if (o.error) throw new Error(o.error);
        setOpt(o);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  if (error) return <div className="card text-sm text-red-600">{error}</div>;
  if (!opt) return <div className="card animate-pulse text-slate-400">Optimizing squad…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Optimal squad for the upcoming gameweek</h1>
        <p className="text-sm text-slate-500">
          Maximizes projected points within £100m, 2/5/5/3 positions, and max 3 per club.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Squad cost" value={`£${opt.totalCost}m`} sub="of £100.0m budget" />
        <StatCard label="Formation" value={opt.xi.formation} sub={`Captain: ${opt.xi.captain.name}`} />
        <StatCard
          label="Projected starting points"
          value={opt.projectedStartingPoints}
          sub="captain doubled"
        />
      </div>

      <SquadPitch xi={opt.xi} />

      <div className="card">
        <h2 className="font-semibold">Why this squad?</h2>
        <ExplainButton
          payload={{
            kind: "squad",
            summary: {
              totalCost: opt.totalCost,
              formation: opt.xi.formation,
              projectedStartingPoints: opt.projectedStartingPoints,
              captain: opt.xi.captain.name,
              starters: opt.xi.starters.map((p) => `${p.name} (${p.positionShort}, ${p.projected.toFixed(1)})`),
            },
          }}
        />
      </div>
    </div>
  );
}
