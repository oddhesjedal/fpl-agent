"use client";

import { useEffect, useState } from "react";
import { HBarChart } from "@/components/Charts";
import type { ChipPlan } from "@/lib/api-types";

const CHIP_BLURB: Record<string, string> = {
  Wildcard: "Unlimited free transfers for one gameweek — rebuild your squad.",
  "Bench Boost": "Your 4 bench players also score that gameweek.",
  "Triple Captain": "Your captain scores 3× instead of 2× that gameweek.",
  "Free Hit": "A one-week temporary squad that reverts the week after.",
};

const CONF_CLASS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-600",
};

export default function ChipsPage() {
  const [plan, setPlan] = useState<ChipPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/chips").then((r) => r.json());
        if (p.error) throw new Error(p.error);
        setPlan(p);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  if (error) return <div className="card text-sm text-red-600">{error}</div>;
  if (!plan) return <div className="card animate-pulse text-slate-400">Analyzing chip timing…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Chip strategy planner</h1>
        <p className="text-sm text-slate-500">
          When to play each chip, based on upcoming fixtures, double and blank gameweeks.
        </p>
      </div>

      {!plan.hasSpecialGameweeks ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          No double or blank gameweeks are confirmed yet — these only appear mid-season once
          cup fixtures force reschedules. For now, suggestions lean on fixture difficulty and
          are marked low/medium confidence. Re-check this page through the season.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {plan.recommendations.map((r) => (
          <div key={r.chip} className="card">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{r.chip}</h2>
              <span className={`pill ${CONF_CLASS[r.confidence]}`}>{r.confidence} confidence</span>
            </div>
            <div className="mt-0.5 text-xs text-slate-400">{CHIP_BLURB[r.chip]}</div>
            <div className="mt-2 text-2xl font-bold text-pitch">
              {r.suggestedEvent ? `GW ${r.suggestedEvent}` : "Hold for now"}
            </div>
            <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Fixture difficulty by gameweek</h2>
        <div className="card">
          <HBarChart
            labelWidth="w-16"
            data={plan.gameweeks.map((g) => ({
              label: `GW ${g.event}`,
              value: g.avgDifficulty,
              barClass: `fdr-${Math.min(5, Math.max(1, Math.round(g.avgDifficulty)))}`,
              display: g.avgDifficulty.toFixed(2),
            }))}
          />
          <p className="mt-2 text-xs text-slate-400">
            Lower is easier. Shorter green bars are the best weeks to attack.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Upcoming gameweeks</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">GW</th>
                <th className="px-3 py-2 text-right">Fixtures</th>
                <th className="px-3 py-2 text-right">Avg FDR</th>
                <th className="px-3 py-2">Doubles</th>
                <th className="px-3 py-2">Blanks</th>
              </tr>
            </thead>
            <tbody>
              {plan.gameweeks.map((g) => (
                <tr key={g.event} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{g.event}</td>
                  <td className="px-3 py-2 text-right">{g.fixtureCount}</td>
                  <td className="px-3 py-2 text-right">{g.avgDifficulty}</td>
                  <td className="px-3 py-2 text-xs text-emerald-700">
                    {g.doubleTeams.length ? g.doubleTeams.join(", ") : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-red-700">
                    {g.blankTeams.length ? g.blankTeams.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
