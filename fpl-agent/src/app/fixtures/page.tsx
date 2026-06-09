"use client";

import { useEffect, useMemo, useState } from "react";
import { FixtureRun } from "@/components/FixtureGrid";
import type { BootstrapResponse } from "@/lib/api-types";

export default function FixturesPage() {
  const [boot, setBoot] = useState<BootstrapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const ranked = useMemo(() => {
    if (!boot) return [];
    return [...boot.teams]
      .map((t) => {
        const fx = t.fixtures;
        const avg = fx.length ? fx.reduce((s, f) => s + f.difficulty, 0) / fx.length : 3;
        return { ...t, avg };
      })
      .sort((a, b) => a.avg - b.avg);
  }, [boot]);

  if (error) return <div className="card text-sm text-red-600">{error}</div>;
  if (!boot) return <div className="card animate-pulse text-slate-400">Loading fixtures…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Fixture difficulty</h1>
        <p className="text-sm text-slate-500">
          Next {boot.teams[0]?.fixtures.length ?? 5} gameweeks, easiest run first. Green = easy,
          red = hard.
        </p>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2 text-right">Avg FDR</th>
              <th className="px-3 py-2">Upcoming</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{t.name}</td>
                <td className="px-3 py-2 text-right font-semibold">{t.avg.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <FixtureRun fixtures={t.fixtures} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
