"use client";

import { useState } from "react";
import { SquadPitch } from "./SquadPitch";
import { StatCard } from "./StatCard";
import { ExplainButton } from "./ExplainButton";
import type { MyTeamResponse, TransferPlan } from "@/lib/api-types";

export function TeamClient({ initialEntryId }: { initialEntryId: string }) {
  const [entryId, setEntryId] = useState(initialEntryId);
  const [data, setData] = useState<MyTeamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!entryId.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/my-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: Number(entryId) }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My team analysis</h1>
        <p className="text-sm text-slate-500">
          Enter your FPL manager (entry) id — find it in the site URL{" "}
          <code>/entry/&lt;id&gt;/event/1</code>. Available once the season is live.
        </p>
      </div>

      <div className="card flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <div className="mb-1 text-slate-500">Entry id</div>
          <input
            value={entryId}
            onChange={(e) => setEntryId(e.target.value)}
            placeholder="e.g. 1234567"
            className="w-48 rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          onClick={analyze}
          disabled={loading}
          className="rounded-md bg-pitch px-4 py-2 text-sm font-medium text-white hover:bg-pitchDark disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze my team"}
        </button>
      </div>

      {error ? <div className="card text-sm text-red-600">{error}</div> : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="In the bank" value={`£${data.bank}m`} />
            <StatCard
              label="Recommended captain"
              value={data.recommendedXI.captain.name}
              sub={`${data.recommendedXI.captain.projected.toFixed(1)} proj pts`}
            />
            <StatCard
              label="Recommended formation"
              value={data.recommendedXI.formation}
              sub={`${data.recommendedXI.projectedPoints} proj pts`}
            />
          </div>

          <div>
            <h2 className="mb-2 font-semibold">Recommended starting XI from your squad</h2>
            <SquadPitch xi={data.recommendedXI} />
          </div>

          <Transfers plan={data.transfers} />
        </>
      ) : null}
    </div>
  );
}

function Transfers({ plan }: { plan: TransferPlan }) {
  const top = plan.single[0];
  return (
    <div className="card">
      <h2 className="font-semibold">Transfer suggestions</h2>
      {plan.single.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No clearly positive single transfer right now — your squad looks well set.
        </p>
      ) : (
        <table className="mt-2 w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-1">Out</th>
              <th className="py-1">In</th>
              <th className="py-1 text-right">Proj gain</th>
              <th className="py-1 text-right">£ change</th>
            </tr>
          </thead>
          <tbody>
            {plan.single.map((s, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-1">
                  {s.out.name} <span className="text-xs text-slate-400">{s.out.teamShort}</span>
                </td>
                <td className="py-1">
                  {s.in.name} <span className="text-xs text-slate-400">{s.in.teamShort}</span>
                </td>
                <td className="py-1 text-right font-semibold text-pitch">
                  +{s.projectedGain.toFixed(1)}
                </td>
                <td className="py-1 text-right">
                  {(s.costChangeTenths / 10 >= 0 ? "+" : "") + (s.costChangeTenths / 10).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {plan.double ? (
        <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
          <div className="font-medium">Best 2-move combo (if you have 2 free transfers):</div>
          <ul className="mt-1 list-disc pl-5">
            {plan.double.map((s, i) => (
              <li key={i}>
                {s.out.name} → {s.in.name}{" "}
                <span className="text-pitch">(+{s.projectedGain.toFixed(1)})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {top ? (
        <ExplainButton
          payload={{
            kind: "transfers",
            summary: {
              topOut: top.out.name,
              topIn: top.in.name,
              topGain: top.projectedGain.toFixed(1),
              all: plan.single.map((s) => `${s.out.name} -> ${s.in.name} (+${s.projectedGain.toFixed(1)})`),
            },
          }}
        />
      ) : null}
    </div>
  );
}
