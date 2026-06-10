"use client";

import { useEffect, useMemo, useState } from "react";
import { FixtureRun } from "@/components/FixtureGrid";
import type { BootstrapResponse, ScoredPlayer } from "@/lib/api-types";

const THRESHOLDS = [3, 5, 10, 15];
const POSITIONS = [
  { id: 0, label: "All" },
  { id: 1, label: "GKP" },
  { id: 2, label: "DEF" },
  { id: 3, label: "MID" },
  { id: 4, label: "FWD" },
];

export default function DifferentialsPage() {
  const [boot, setBoot] = useState<BootstrapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxOwnership, setMaxOwnership] = useState(10);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const b = await fetch("/api/bootstrap").then((r) => r.json());
        if (b.error) throw new Error(b.error);
        setBoot(b);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  const rows: ScoredPlayer[] = useMemo(() => {
    if (!boot) return [];
    return boot.players
      .filter(
        (p) =>
          p.availability > 0 &&
          p.selectedByPercent <= maxOwnership &&
          (position === 0 || p.position === position)
      )
      .sort((a, b) => b.projected - a.projected)
      .slice(0, 40);
  }, [boot, maxOwnership, position]);

  if (error) return <div className="card text-sm text-red-600">{error}</div>;
  if (!boot) return <div className="card animate-pulse text-slate-400">Finding differentials…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Differentials</h1>
        <p className="text-sm text-slate-500">
          High projected points, low ownership — picks that can separate you from the pack.
        </p>
      </div>

      <div className="card flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Max ownership</span>
          <div className="flex gap-1">
            {THRESHOLDS.map((t) => (
              <button
                key={t}
                onClick={() => setMaxOwnership(t)}
                className={`pill ${
                  maxOwnership === t ? "bg-pitch text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                ≤ {t}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Position</span>
          <div className="flex gap-1">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPosition(p.id)}
                className={`pill ${
                  position === p.id ? "bg-pitch text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Pos</th>
              <th className="px-3 py-2 text-right">£m</th>
              <th className="px-3 py-2 text-right">Proj</th>
              <th className="px-3 py-2 text-right">Form</th>
              <th className="px-3 py-2 text-right">Own%</th>
              <th className="px-3 py-2">Next fixtures</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                  No players match this filter — try a higher ownership threshold.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.teamShort}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{p.positionShort}</td>
                  <td className="px-3 py-2 text-right">{p.cost.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{p.projected.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{p.form.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-pitch">{p.selectedByPercent.toFixed(1)}</td>
                  <td className="px-3 py-2">
                    <FixtureRun fixtures={p.fixtures.slice(0, 4)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
