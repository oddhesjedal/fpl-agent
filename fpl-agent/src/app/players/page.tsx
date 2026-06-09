"use client";

import { useEffect, useState } from "react";
import { PlayerTable } from "@/components/PlayerTable";
import type { BootstrapResponse } from "@/lib/api-types";

export default function PlayersPage() {
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

  if (error) return <div className="card text-sm text-red-600">{error}</div>;
  if (!boot) return <div className="card animate-pulse text-slate-400">Loading players…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Player explorer</h1>
        <p className="text-sm text-slate-500">
          {boot.players.length} players · sort by projected points, value, form, and more.
        </p>
      </div>
      <PlayerTable players={boot.players} />
    </div>
  );
}
