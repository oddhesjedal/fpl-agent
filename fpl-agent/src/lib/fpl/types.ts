// Typed shapes for the subset of FPL bootstrap/fixtures/entry data we use.
// The live API returns many more fields; we narrow to what the engine needs.

export interface FplTeam {
  id: number;
  code: number; // used to build the club badge image URL
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FplElementType {
  id: number; // 1 GK, 2 DEF, 3 MID, 4 FWD
  singular_name: string;
  singular_name_short: string; // GKP, DEF, MID, FWD
}

export interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

// Players. FPL returns numeric stats as strings (e.g. "form": "5.2").
export interface FplElement {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  photo: string; // e.g. "118748.jpg" -> used to build the player photo URL
  team: number; // FplTeam.id
  element_type: number; // FplElementType.id
  now_cost: number; // price in tenths of a million (55 = £5.5m)
  status: string; // 'a' available, 'i' injured, 'd' doubtful, 's' suspended, 'u' unavailable, 'n' not in squad
  chance_of_playing_next_round: number | null;
  total_points: number;
  event_points: number;
  minutes: number;
  form: string;
  points_per_game: string;
  selected_by_percent: string;
  ict_index: string;
  expected_goal_involvements: string;
  news: string;
}

export interface Bootstrap {
  events: FplEvent[];
  teams: FplTeam[];
  elements: FplElement[];
  element_types: FplElementType[];
  total_players: number;
}

export interface Fixture {
  id: number;
  event: number | null; // gameweek id (null for unscheduled)
  team_h: number;
  team_a: number;
  team_h_difficulty: number; // 1 (easy) .. 5 (hard)
  team_a_difficulty: number;
  finished: boolean;
  kickoff_time: string | null;
}

export interface EntryPick {
  element: number; // FplElement.id
  position: number; // 1..15
  multiplier: number; // 0 bench, 1 starter, 2 captain, 3 triple-captain
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface EntryPicks {
  picks: EntryPick[];
  entry_history?: { bank: number; value: number };
}
