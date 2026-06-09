// Tunable strategy knobs. Change these to shift how the agent values players.
// Nothing here is "correct" — these are starting points you can experiment with.

export const RULES = {
  budgetTenths: 1000, // £100.0m, stored in tenths like the API
  squadSize: 15,
  // Required squad counts keyed by element_type (1 GK, 2 DEF, 3 MID, 4 FWD).
  squadByType: { 1: 2, 2: 5, 3: 5, 4: 3 } as Record<number, number>,
  maxPerClub: 3,
  startingXI: 11,
  // Legal starting-formation bounds per element_type (excludes the single GK).
  formationBounds: {
    2: { min: 3, max: 5 }, // DEF
    3: { min: 2, max: 5 }, // MID
    4: { min: 1, max: 3 }, // FWD
  } as Record<number, { min: number; max: number }>,
};

export const SCORING = {
  // How many upcoming gameweeks to weigh for fixture difficulty.
  fixtureHorizon: 5,
  // Relative weights for the base score (need not sum to 1; they're normalized).
  weights: {
    form: 0.45, // recent form (last ~30 days)
    pointsPerGame: 0.35, // season-long consistency
    ict: 0.2, // underlying involvement (influence/creativity/threat)
  },
  // Fixture multiplier strength. avgFdr 3 is neutral; lower = easier = boost.
  // multiplier = 1 + (3 - avgFdr) * fixtureSwing, clamped to [min,max].
  fixtureSwing: 0.08,
  fixtureMultiplierClamp: { min: 0.7, max: 1.3 },
  // Minutes floor: ignore players with very few minutes unless pre-season.
  minMinutesForForm: 0,
};
