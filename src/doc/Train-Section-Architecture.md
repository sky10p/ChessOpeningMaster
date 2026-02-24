# Train Section Architecture

## Routes

Frontend:

- `/train`
- `/train/repertoire/:repertoireId/opening/:openingName`
- existing `/repertoire/train/:id` remains the execution page for board training

Backend:

- `GET /train/overview`
- `GET /train/repertoires/:id/openings/:openingName`
- `GET /repertoires/:id/mistakes`
- `POST /repertoires/:id/mistake-reviews`
- `POST /repertoires/:id/variant-reviews` (extended with `mistakes`)

## UI Data Flow

1. Train overview page (`/train`)
   - loads `GET /train/overview`,
   - renders repertoire-grouped opening cards,
   - displays mastery + due variants + due mistakes per opening.

2. Train opening page (`/train/repertoire/:repertoireId/opening/:openingName`)
   - loads `GET /train/repertoires/:id/openings/:openingName`,
   - renders opening stats, variants list, mistake summary, and action CTAs.

3. Training execution (`/repertoire/train/:id`)
   - receives query mode:
     - `mode=standard`
     - `mode=mistakes`
   - optional filters:
     - `openingName`
     - `variantName`
     - `variantNames` (pipe-separated)
     - `mistakeKey`
     - `mistakeKeys` (pipe-separated)

Execution UI composition:

- `TrainRepertoireViewContainer` orchestrates train state and modals.
- `TrainRepertoireStandardWorkspace` renders normal-mode persistent side panels.
- `TrainRepertoireFocusWorkspace` renders focus-mode contextual assistance as inline panel content.
- `TrainRepertoireFocusWorkspace` also exposes a dedicated back action to return to the opening training page.

## Focus Mode State Machine (`mode=mistakes`)

Execution on `/repertoire/train/:id?mode=mistakes` uses:

1. `variant phase` (`trainingPhase=standard`)
2. `mistakes phase` (`trainingPhase=reinforcement`)
3. `variant confirm phase` (`trainingPhase=fullRunConfirm`)

Transitions:

- variant phase with mistakes -> mistakes phase
- mistakes phase queue exhausted -> variant confirm phase
- variant confirm phase with mistakes -> mistakes phase
- variant confirm phase clean -> finish cycle and return to standard with final review modal

Variant confirm start position:

- full-run confirm always starts from beginning (`ply 0`), not from an opening/variant start offset.
- focus training is not considered complete while any focus-phase state is active (`reinforcement`, `fullRunConfirm`, or pending focus review).

Mistakes requeue semantics:

- wrong move in reinforcement requeues the current mistake at queue tail,
- if requeued item is behind current board state, replay resets to effective start before continuing.

Focus progress timeline semantics:

- timeline is the full variant player-move sequence (user color only), not mixed plies,
- failed/current/success states map against that player-move timeline,
- red marks unresolved errors,
- orange marks solved errors only in mistakes/full-run confirm,
- initial variant phase does not convert red to orange inside the same pass,
- current marker advances with board replay during reinforcement auto-moves.

Focus assist UX semantics:

- focus mode starts with assists locked,
- assists unlock after first mistake in current focus session,
- unlocked assists stay available during correction and confirm phases.
- in focus mode, comments + variant guidance are rendered in an inline `Focus Assist` card below `Your turn` inside the training info panel.
- focus assist card content uses tabs (`Comments`, `Candidate lines`).
- the card stays in waiting state until the first error, then switches to active guidance content.
- persistent comment/help panels are reserved for normal mode.

Direct mistake review semantics (`mode=mistakes` + `mistakeKey(s)`):

- starts directly in reinforcement queue mode using the selected mistake keys,
- queue order is deterministic (`variantName`, then `mistakePly`, then `mistakeKey`),
- replays only mistake targets (no variant phase and no full-run confirm),
- replay baseline for this mode is line start (`ply 0`) so move progress stays aligned from move 1,
- if the session targets a single variant, once the last mistake is solved the board auto-replays remaining moves to that variant end before closing the session,
- does not persist variant review, mastery changes, or mistake-review ratings,
- ends in-session without starting a new variant run.

## API Contract Notes

### `POST /repertoires/:id/variant-reviews`

Request now optionally accepts:

- `mistakes: MistakeSnapshotItem[]`

Backend behavior:

- saves review history event,
- applies monotonic same-day daily snapshot merge,
- updates mastery/perfect streak fields,
- seeds/upserts mistake SRS items.

Persistence timing in focus mode:

- no initial `variant-reviews` save when entering mistakes phase,
- one final `variant-reviews` save after clean variant confirm completion.

### `GET /train/overview`

Returns repertoires with opening summaries:

- mastery score,
- due variants count,
- due mistakes count,
- total variants count.

### `GET /train/repertoires/:id/openings/:openingName`

Returns opening detail:

- opening stats,
- variant rows (due, mastery, streak, daily errors),
- mistake SRS items.

## Mastery Metrics

Variant update formula (on review):

- `sessionScore = max(0, 100 - 22*wrongMoves - 8*ignoredWrongMoves - 6*hintsUsed)`
- `ratingBonus = again:-12 | hard:-4 | good:+4 | easy:+10`
- `perfectBonus = +8` if no mistakes and no hints
- `nextMastery = clamp(round(0.75*prev + 0.25*sessionScore + ratingBonus + perfectBonus), 0, 100)`

Opening mastery:

- weighted average of variant mastery, weight = variant move length.

UI surfaces:

- variant result mastery before/after,
- opening mastery summary,
- 7-day mistakes reduced value.

## Due Count Definitions

Due variant:

- `dueAt <= now` (or missing `dueAt`) and
- `lastReviewedDayKey !== todayUtcDayKey`

Due mistake:

- `dueAt <= now` and
- `lastReviewedDayKey !== todayUtcDayKey` and
- not archived.

## Boundaries and Invariants

- All train domain queries are user-scoped.
- Daily snapshot logic uses UTC day keys.
- Mistake SRS is independent from daily snapshot mutability.
- Opening detail is repertoire-scoped by route and service contract.
