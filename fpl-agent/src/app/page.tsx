"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { FixtureRun } from "@/components/FixtureGrid";
import type { BootstrapResponse, OptimizeResponse } from "@/lib/api-types";

export default function Dashboard() {
  const [boot, setBoot] = useState<BootstrapResponse | null>(null);
  const [opt, setOpt] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, o] = await Promise.all([
          fetch("/api/bootstrap").then((r) => r.json()),
          fetch("/api/optimize").then((r) => r.json()),
        ]);
        if (b.error) throw new Error(b.error);
        setBoot(b);
        if (!o.error) setOpt(o);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="card text-sm text-red-600">
        Couldn’t load FPL data: {error}. Check your internet connection and refresh.
      </div>
    );
  }
  if (!boot) return <Loading />;

  const nextEvent =
    boot.events.find((e) => e.is_next) ??
    boot.events.find((e) => e.is_current) ??
    boot.events[0];
  const topValue = [...boot.players]
    .filter((p) => p.availability > 0)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 10);
  const captain = opt?.xi.captain;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Next gameweek"
          value={nextEvent ? nextEvent.name : "—"}
          sub={nextEvent ? `Deadline ${formatDate(nextEvent.deadline_time)}` : undefined}
        />
        <StatCard
          label="Recommended captain"
          value={captain ? captain.name : "—"}
          sub={captain ? `${captain.teamShort} · ${captain.projected.toFixed(1)} proj pts` : "Run optimizer"}
        />
        <StatCard
          label="Optimal squad value"
          value={opt ? `£${opt.totalCost}m` : "—"}
          sub={opt ? `${opt.xi.formation} · ${opt.projectedStartingPoints} proj pts` : undefined}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Best value picks right now</h2>
        <Link href="/players" className="text-sm text-pitch hover:underline">
          Full player explorer →
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Pos</th>
              <th className="px-3 py-2 text-right">£m</th>
              <th className="px-3 py-2 text-right">Proj</th>
              <th className="px-3 py-2 text-right">Value</th>
              <th className="px-3 py-2">Next</th>
            </tr>
          </thead>
          <tbody>
            {topValue.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-slate-500">{p.positionShort}</td>
                <td className="px-3 py-2 text-right">{p.cost.toFixed(1)}</td>
                <td className="px-3 py-2 text-right font-semibold">{p.projected.toFixed(1)}</td>
                <td className="px-3 py-2 text-right">{p.valueScore.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <FixtureRun fixtures={p.fixtures.slice(0, 3)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        Projections blend recent form, season points-per-game, underlying involvement, and
        upcoming fixture difficulty. Tune the weights in{" "}
        <code>src/lib/engine/config.ts</code>.
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="card animate-pulse text-sm text-slate-400">Loading live FPL data…</div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
