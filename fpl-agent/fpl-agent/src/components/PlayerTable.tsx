"use client";

import { useMemo, useState } from "react";
import type { ScoredPlayer } from "@/lib/engine/scoring";
import { FixtureRun } from "./FixtureGrid";

type SortKey = "projected" | "valueScore" | "form" | "totalPoints" | "cost" | "selectedByPercent";

const POSITIONS = [
  { id: 0, label: "All" },
  { id: 1, label: "GKP" },
  { id: 2, label: "DEF" },
  { id: 3, label: "MID" },
  { id: 4, label: "FWD" },
];

const COLS: { key: SortKey; label: string }[] = [
  { key: "projected", label: "Proj" },
  { key: "valueScore", label: "Value" },
  { key: "form", label: "Form" },
  { key: "totalPoints", label: "Pts" },
  { key: "cost", label: "£m" },
  { key: "selectedByPercent", label: "Own%" },
];

export function PlayerTable({
  players,
  initialLimit = 50,
}: {
  players: ScoredPlayer[];
  initialLimit?: number;
}) {
  const [position, setPosition] = useState(0);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("projected");
  const [limit, setLimit] = useState(initialLimit);

  const rows = useMemo(() => {
    let list = players;
    if (position) list = list.filter((p) => p.position === position);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.teamShort.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number)).slice(0, limit);
  }, [players, position, query, sortKey, limit]);

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
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
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search player or team…"
          className="ml-auto w-56 rounded-md border border-slate-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Pos</th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={`cursor-pointer px-3 py-2 text-right ${
                    sortKey === c.key ? "text-pitch" : ""
                  }`}
                  onClick={() => setSortKey(c.key)}
                >
                  {c.label} {sortKey === c.key ? "▼" : ""}
                </th>
              ))}
              <th className="px-3 py-2">Next fixtures</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.teamShort}</div>
                  {p.availability < 1 ? (
                    <div className="text-[11px] text-orange-600">
                      {Math.round(p.availability * 100)}% to play
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-slate-500">{p.positionShort}</td>
                <td className="px-3 py-2 text-right font-semibold">{p.projected.toFixed(1)}</td>
                <td className="px-3 py-2 text-right">{p.valueScore.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{p.form.toFixed(1)}</td>
                <td className="px-3 py-2 text-right">{p.totalPoints}</td>
                <td className="px-3 py-2 text-right">{p.cost.toFixed(1)}</td>
                <td className="px-3 py-2 text-right">{p.selectedByPercent.toFixed(1)}</td>
                <td className="px-3 py-2">
                  <FixtureRun fixtures={p.fixtures} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length >= limit ? (
        <div className="border-t border-slate-200 p-3 text-center">
          <button
            onClick={() => setLimit((l) => l + 50)}
            className="pill bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Show more
          </button>
        </div>
      ) : null}
    </div>
  );
}
