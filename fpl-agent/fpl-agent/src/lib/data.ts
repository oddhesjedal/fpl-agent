// Server-side composite loader: fetch FPL data once and score every player.
import { getBootstrap, getFixtures, resolveCurrentEventId } from "./fpl/client";
import { scorePlayers, type ScoredPlayer } from "./engine/scoring";
import { buildTeamFixtures } from "./engine/fixtures";
import type { Bootstrap, Fixture } from "./fpl/types";

export interface LoadedData {
  bootstrap: Bootstrap;
  fixtures: Fixture[];
  scored: ScoredPlayer[];
  currentEventId: number;
}

export async function loadScored(): Promise<LoadedData> {
  const [bootstrap, fixtures] = await Promise.all([getBootstrap(), getFixtures()]);
  const scored = scorePlayers(bootstrap, fixtures);
  const currentEventId = resolveCurrentEventId(bootstrap);
  return { bootstrap, fixtures, scored, currentEventId };
}

export { buildTeamFixtures };
