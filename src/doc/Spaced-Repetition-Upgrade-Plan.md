# Spaced Repetition Upgrade Plan

This plan upgrades the current `errors + lastDate` scheduling into a stronger rating-driven system that supports:

- no same-day repeats,
- post-review rating (`Again`, `Hard`, `Good`, `Easy`),
- auto-suggested rating from training quality,
- Path Page planning + analytics,
- chess-opening specific reinforcement workflows.

## Current Baseline

- Training completion supports explicit review ratings via `POST /repertoires/:id/variant-reviews`.
- Scheduler fields (`dueAt`, `lastReviewedDayKey`, `intervalDays`, `ease`, etc.) are persisted in `variantsInfo`.
- Path selection is deterministic due-first (`errors -> due -> new -> old -> study`) and excludes same-day repeats.
- Path planning/analytics endpoints are available (`GET /paths/plan`, `GET /paths/analytics`).
- Dashboard and PathPage consume plan/analytics data for forecast and quality views.

## Target Principles

1. Scheduling is due-date driven, not random-threshold driven.
2. Reviews are atomic events with rating + outcome metrics.
3. Daily experience is quota-based (new/day, reviews/day) with strict no same-day repeats.
4. Analytics are based on immutable review history, not only latest snapshot state.
5. All queries remain user-scoped and index-backed.

## Data Model Changes

## `variantsInfo` (extend existing document)

Add fields:

- `dueAt: Date`
- `lastReviewedAt: Date`
- `lastReviewedDayKey: string` (`YYYY-MM-DD` in user timezone)
- `state: "new" | "learning" | "review"`
- `stability: number`
- `difficulty: number`
- `reps: number`
- `lapses: number`
- `intervalDays: number`
- `ease: number`
- `lastRating: "again" | "hard" | "good" | "easy" | null`
- `suspendedUntil?: Date`

Keep legacy fields for compatibility:

- `errors`
- `lastDate`

## `variantReviewHistory` (new collection)

One document per completed review:

- `userId`
- `repertoireId`
- `variantName`
- `reviewedAt`
- `reviewedDayKey`
- `rating`
- `suggestedRating`
- `acceptedSuggested: boolean`
- `wrongMoves`
- `ignoredWrongMoves`
- `hintsUsed`
- `timeSpentSec`
- `startingFen`
- `openingName`
- `orientation`
- `dueBeforeReviewAt`
- `nextDueAt`
- `schedulerVersion`

This collection powers trend analytics and algorithm tuning.

## Indexing

Update `ensureDatabaseIndexes`:

- `variantsInfo`: `{ userId: 1, repertoireId: 1, variantName: 1 }` unique
- `variantsInfo`: `{ userId: 1, dueAt: 1 }`
- `variantsInfo`: `{ userId: 1, lastReviewedDayKey: 1 }`
- `variantReviewHistory`: `{ userId: 1, reviewedAt: -1 }`
- `variantReviewHistory`: `{ userId: 1, reviewedDayKey: 1 }`
- `variantReviewHistory`: `{ userId: 1, openingName: 1, orientation: 1 }`

## Scheduling Algorithm

Use a rating-based scheduler (SM-2-compatible first, FSRS migration-ready later).

## Rating scale

- `again` = failed recall
- `hard` = recalled with high effort/errors
- `good` = normal recall
- `easy` = effortless recall

## No same-day repeats rule (hard requirement)

After every review:

- `intervalDays = max(1, computedIntervalDays)`
- `dueAt` must be at least next local day boundary in user timezone.
- Candidate selection must exclude variants where `lastReviewedDayKey === todayDayKey`.

## Suggested update logic (v1)

- `again`:
  - `reps = 0`
  - `lapses += 1`
  - `intervalDays = 1`
  - `ease = max(1.3, ease - 0.2)`
- `hard`:
  - `reps += 1`
  - `intervalDays = max(1, round(prevIntervalDays * 1.2))`
  - `ease = max(1.3, ease - 0.15)`
- `good`:
  - `reps += 1`
  - `intervalDays = reps <= 2 ? [1, 3][reps - 1] : round(prevIntervalDays * ease)`
- `easy`:
  - `reps += 1`
  - `intervalDays = max(4, round(prevIntervalDays * ease * 1.3))`
  - `ease = min(2.8, ease + 0.15)`

Set:

- `dueAt = startOfLocalDay(today + intervalDays)`
- `lastReviewedAt = now`
- `lastReviewedDayKey = todayDayKey`
- `lastRating = rating`

## Auto-suggest rating

Input metrics from train session:

- `wrongMoves`
- `ignoredWrongMoves`
- `hintsUsed`
- `timeSpentSec`

Suggested mapping:

- `again` if `wrongMoves >= 3` or repeated wrong lines.
- `hard` if `wrongMoves === 2` or `hintsUsed >= 2`.
- `good` if `wrongMoves <= 1` and completion time near baseline.
- `easy` if `wrongMoves === 0`, no hints, and fast completion.

UI shows suggested rating preselected, user can override.

## API Changes

## New review endpoint (recommended)

`POST /repertoires/:id/variant-reviews`

Request:

- `variantName`
- `rating`
- `suggestedRating`
- `acceptedSuggested`
- `wrongMoves`
- `ignoredWrongMoves`
- `hintsUsed`
- `timeSpentSec`
- `startingFen?`

Behavior:

- writes review history,
- updates scheduler fields in `variantsInfo`,
- updates legacy `errors`/`lastDate` for compatibility,
- returns updated scheduling snapshot (`dueAt`, `intervalDays`, `state`, etc).

## Path API evolution

- `GET /paths` returns next due item from due queue (no same-day repeats).
- Keep existing `category` query, but categories derive from due-state:
  - `overdue`,
  - `dueToday`,
  - `new`,
  - `later`.
- Add planning endpoint:
  - `GET /paths/plan?from=...&to=...&orientation=...&opening=...&fen=...`
- Add analytics endpoint:
  - `GET /paths/analytics?range=30d&groupBy=day|opening|orientation`

## Frontend Changes

## Training flow

In `TrainRepertoireContext`:

- track per-variant session metrics (`wrongMoves`, `hintsUsed`, `timeSpentSec`),
- when variant completes, open rating modal with suggested rating,
- submit to new review endpoint.

## Path Page upgrade

Sections:

1. `Next Due Variant` card.
2. `Today Plan`: due count, completed today, remaining, estimated time.
3. `Upcoming Load`: due forecast (7/14/30 days).
4. `Review Quality`: Again/Hard/Good/Easy distribution and streaks.
5. `Filters`: orientation/color, opening, repertoire, FEN, due status.

Controls:

- daily new limit,
- max review minutes,
- include/exclude specific repertoires/openings.

## Additional Reinforcement Features (Proven Methods)

1. Interleaving:
   - mix openings and sides in one session.
2. Retrieval before reveal:
   - hide move list by default; require attempt first.
3. Error-focused overlearning:
   - schedule immediate next-day follow-up for repeated tactical slips (still not same day).
4. Contextual variability:
   - drill same line from different entry positions/FEN checkpoints.
5. Generation effect:
   - ask "best move from this FEN" before showing candidate moves.
6. Mixed-direction recall:
   - train both as repertoire side and as opponent side.
7. Confidence tagging:
   - post-review confidence score to improve future scheduling weight.
8. Periodic cumulative tests:
   - weekly exam pulling from overdue + high-lapse variants.

## Rollout Plan

1. Phase 1: Data + endpoint foundation (completed)
   - new scheduler fields, review history collection, and indexes implemented.
2. Phase 2: Training UX (completed)
   - rating modal, auto-suggestion, and metrics capture implemented.
3. Phase 3: Scheduler switch (completed)
   - due-driven deterministic path selection with no same-day repeats implemented.
4. Phase 4: Path planning/analytics (completed)
   - `/paths/plan` and `/paths/analytics` APIs plus PathPage forecast UI implemented.
5. Phase 5: Dashboard integration (completed)
   - Dashboard tab now includes spaced-repetition insights charts based on plan/analytics.
6. Phase 6: Advanced reinforcement (pending)
   - interleaving, checkpoint FEN drills, weekly cumulative tests.

## Acceptance Criteria

1. Variant reviewed on a day never appears again the same day in Path or exam mode.
2. Every completed variant review records rating and metrics in history.
3. User can accept or override suggested rating.
4. Path next lesson is deterministic from due data, not random fallback.
5. Path analytics support filter by color/opening/FEN and show trends over time.
