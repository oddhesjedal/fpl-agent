// Shared response shapes for the client pages.
import type { ScoredPlayer } from "./engine/scoring";
import type { StartingXI } from "./engine/captain";
import type { OptimizedSquad } from "./engine/optimizer";
import type { TransferPlan } from "./engine/transfers";
import type { TeamFixture } from "./engine/fixtures";
import type { ChipPlan } from "./engine/chips";

export interface BootstrapResponse {
  currentEventId: number;
  events: {
    id: number;
    name: string;
    deadline_time: string;
    is_current: boolean;
    is_next: boolean;
    finished: boolean;
  }[];
  teams: {
    id: number;
    code: number;
    name: string;
    short_name: string;
    fixtures: TeamFixture[];
  }[];
  players: ScoredPlayer[];
}

export type OptimizeResponse = OptimizedSquad;

export interface MyTeamResponse {
  entryId: number;
  eventId: number;
  bank: number;
  squad: ScoredPlayer[];
  recommendedXI: StartingXI;
  transfers: TransferPlan;
}

export type { ScoredPlayer, StartingXI, OptimizedSquad, TransferPlan, TeamFixture, ChipPlan };
