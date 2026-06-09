# FPL Agent

An **advisory** assistant for Fantasy Premier League. It pulls live data from the public
FPL API, scores every player, and recommends an optimal squad, captain, and transfers —
all in a local web dashboard. You make the actual moves in the FPL app; nothing logs into
your account.

Built for the **2026/27** season (and every season after).

## What it does

- **Dashboard** — next deadline, recommended captain, best-value picks at a glance.
- **Optimal Squad** — the best legal 15 within £100m (2/5/5/3, max 3 per club), shown on a
  pitch with the suggested starting XI, formation, captain (C) and vice (V).
- **My Team** — enter your manager/entry id to get a recommended XI, captain, and ranked
  transfer suggestions (single moves + the best 2-move combo) against your real squad.
- **Differentials** — high-projection, low-ownership picks (tunable ownership threshold and
  position filter) to gain ground on rivals.
- **Chips** — when to play each chip (Wildcard, Bench Boost, Triple Captain, Free Hit),
  detecting double/blank gameweeks and the best upcoming fixture runs.
- **Fixtures** — every club ranked by upcoming fixture difficulty (green = easy, red = hard).
- **Players** — sortable, filterable explorer for all ~600 players.
- **Explain this** — optional plain-English rationale for any recommendation, powered by
  Claude when an API key is set (falls back to a built-in summary otherwise).

## How the recommendations work

Each player gets a **projected points** score for the upcoming gameweek:

```
projected = base × fixtureMultiplier × availability
```

- **base** blends recent **form**, season **points-per-game**, and normalized **ICT index**
  (underlying involvement).
- **fixtureMultiplier** rewards easier upcoming fixtures, using FDR over the next N gameweeks.
- **availability** scales by `chance_of_playing_next_round` (injured/suspended ≈ 0).

The squad optimizer then solves a binary integer program to maximize total projected points
under the budget, position, and per-club rules. All weights live in
[`src/lib/engine/config.ts`](src/lib/engine/config.ts) — tune them to match your strategy.

> These are heuristics, not predictions. Treat the output as a strong starting point and
> apply your own judgement.

## Getting started

Requires Node 18.18+ (or 20+).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Optional: LLM explanations + default team

```bash
cp .env.example .env.local
```

Then set either/both:

- `ANTHROPIC_API_KEY` — enables Claude-generated explanations.
- `DEFAULT_ENTRY_ID` — pre-fills the My Team page with your manager id (the number in
  `fantasy.premierleague.com/entry/<id>/event/1`).

Restart `npm run dev` after editing env vars.

## Seasonal note

Outside the season (or before you've built your 26/27 squad) the **My Team** page can't load
live picks — the optimizer, fixtures, and player explorer still work against current data.
My Team activates as soon as the new season's data is published and you've saved a squad.

## Project layout

```
src/
  app/                 # Next.js App Router pages + API routes
    api/               # bootstrap, optimize, my-team, explain
  components/          # SquadPitch, PlayerTable, FixtureGrid, ...
  lib/
    fpl/               # fpl-api wrappers + types
    engine/            # scoring, fixtures, optimizer, transfers, captain, config
    llm/               # optional Claude explanation layer
```

## Tech

Next.js 14 · TypeScript · Tailwind · [`fpl-api`](https://www.npmjs.com/package/fpl-api) ·
[`javascript-lp-solver`](https://www.npmjs.com/package/javascript-lp-solver) ·
optional `@anthropic-ai/sdk`.

## Notes / troubleshooting

- The FPL API blocks browser CORS, so all data is fetched server-side in API routes.
- If `fpl-api` changes its export names in a future version, adjust the imports in
  [`src/lib/fpl/client.ts`](src/lib/fpl/client.ts) — that's the only place they're used.
- Data is cached in-memory for 5 minutes to stay friendly to the FPL servers.
