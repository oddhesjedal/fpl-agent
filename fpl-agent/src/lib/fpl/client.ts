// Thin wrappers around `fpl-api` with a small in-memory cache.
// Server-only: the FPL API blocks browser CORS, so these run in API routes.
//
// If your installed `fpl-api` version names these exports differently, this is
// the one place to adjust. As of fpl-api v1.x the named exports below exist.
import { fetchBootstrap, fetchFixtures, fetchEntryEventPicks } from "fpl-api";

import type { Bootstrap, Fixture, EntryPicks } from "./types";

type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 5 * 60 * 1000; // FPL bootstrap changes at most a few times a day.

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loader();
  cache.set(key, { value, expires: Date.now() + TTL_MS });
  return value;
}

export async function getBootstrap(): Promise<Bootstrap> {
  return cached("bootstrap", async () => {
    const data = (await fetchBootstrap()) as unknown as Bootstrap;
    return data;
  });
}

export async function getFixtures(): Promise<Fixture[]> {
  return cached("fixtures", async () => {
    const data = (await fetchFixtures()) as unknown as Fixture[];
    return data;
  });
}

// Picks for a manager's squad in a given gameweek. Only resolves once the
// season is live and the manager has saved a team for that gameweek.
export async function getEntryPicks(
  entryId: number,
  eventId: number
): Promise<EntryPicks> {
  // Not cached per-entry to avoid unbounded cache growth; FPL is fast here.
  const data = (await fetchEntryEventPicks(entryId, eventId)) as unknown as EntryPicks;
  return data;
}

// Convenience: current gameweek id, or the next upcoming one in the pre-season gap.
export function resolveCurrentEventId(bootstrap: Bootstrap): number {
  const current = bootstrap.events.find((e) => e.is_current);
  if (current) return current.id;
  const next = bootstrap.events.find((e) => e.is_next);
  if (next) return next.id;
  // Pre-season: nothing current/next yet -> GW1.
  return bootstrap.events[0]?.id ?? 1;
}
