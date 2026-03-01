# Train Error Reinforcement Mode

## Goals

This mode extends repertoire training with an error-focused loop:

1. Finish a variant as usual.
2. Review variant results and mastery impact.
3. Reinforce only mistake positions until solved in-session.
4. Replay the full variant to confirm recall quality.

It preserves existing variant training while adding targeted correction.

## Phase Flow

1. `Standard training`  
   User trains selected variants on `/repertoire/train/:id`.

2. `Variant result`  
   After a variant finishes, a result modal shows:
   - mistakes (`wrongMoves`, `ignoredWrongMoves`),
   - hints used,
   - time spent,
   - projected mastery delta.

3. `Mistake reinforcement`  
   If mistakes exist, user can start `Fix mistakes now`:
   - the app replays moves toward each mistake target in sequence,
   - user must play the expected move,
   - user rates each solved mistake (`again/hard/good/easy`),
   - failed attempts requeue to the end.

4. `Full-run confirm`  
   After queue exhaustion, user replays the full variant.  
   A completion panel confirms whether the run was perfect.

## Review-Only Mistake Training (Opening Page CTAs)

From `/train/repertoire/:repertoireId/opening/:openingName`:

- `Train Mistakes Only` starts a reinforcement queue built only from mistake keys that are currently due for that opening.
- `Train This Mistake` starts the same flow but with one mistake key.

Behavior contract:

- replay is mistake-targeted only (no full variant confirm phase),
- replay always starts from line beginning (`ply 0`) for each reviewed variant context,
- selected mistakes are processed in deterministic line order (`variantName`, then `mistakePly`),
- board replay still advances step-by-step to each mistake parent before user input,
- when reviewing a single variant, after solving the last queued mistake, replay continues automatically to the end of that variant line,
- the CTA is disabled when the opening has no due mistakes, even if scheduled mistakes still exist,
- solved mistakes are handled in-session only,
- no `variant-reviews` save is triggered,
- no mastery update is triggered,
- no `mistake-reviews` rating write is triggered.

This mode is strictly for recall review and does not mutate stored progress/scheduling state.

## Focus Mode Lifecycle

`mode=mistakes` for focus training follows a strict 3-phase loop:

1. `Variant phase`  
   Play the variant and collect mistakes for the current session.
2. `Mistakes phase`  
   Replay only queued mistakes. Failed mistakes requeue and are retried until solved in-session.
3. `Variant confirm phase`  
   Replay the full variant.
   - if new mistakes appear, return to `Mistakes phase` with those errors,
   - if clean, finish the loop and show the final review modal.

In focus mode, the main variant review is persisted only once at the end of a clean confirm phase.
The training session is considered finished only after the full 3-phase loop completes.

### Focus Progress Semantics

- Progress dots represent only player-color moves for the focused variant, starting from move 1.
- Failed states map by real mistake ply (`mistakePly`) to that player-move timeline.
- Color semantics:
  - green = completed with no error on that move,
  - red = known error on a move not yet solved in the current pass,
  - orange = move had an error and is now solved in mistakes/full-run confirm (kept as reminder),
  - ring = current move according to board position.
- In the initial variant phase, failed moves stay red even if the user later plays the correct move in that same run.
- During auto-replay in mistakes phase, the current ring follows board progression step-by-step.
- After auto-replay reaches the parent of expected move, the current ring lands on the next required player move.

### Focus Assist Policy

- In focus mode, helps are hidden at the start (no always-on hints).
- After the first mistake in the active focus session, helps unlock.
- Unlocked state is kept through mistakes/full-run confirm to support correction.
- Locked and unlocked states must be consistent on desktop and mobile panels.
- Focus Assist is rendered inline in the right training panel as a dedicated card below `Your turn`.
- Focus Assist card content is tabbed (`Comments`, `Candidate lines`).
- When no errors exist, the card shows a locked/waiting state.
- When errors exist, tabs show contextual comments and candidate variants without opening a separate overlay.
- In normal mode, the standard persistent side-panel help/comment layout remains unchanged.

## Daily Snapshot Rule (Monotonic Same-Day)

For `variantsInfo` daily error snapshots:

- Same UTC day:
  - incoming mistakes merge into existing snapshot,
  - snapshot count can stay same or increase,
  - snapshot count cannot decrease.
- New UTC day:
  - prior day snapshot is replaced by the new day snapshot.

This protects daily learning records from same-day overwrites.

## Mistake SRS Lifecycle

Mistake SRS items (`variantMistakes`) are seeded from variant review snapshots and then scheduled independently:

- first creation stores mistake identity + replay metadata (`mistakeKey`, `positionFen`, `variantStartFen`, `mistakePly`, expected move),
- rating updates scheduling fields (`dueAt`, `intervalDays`, `ease`, `reps`, `lapses`, state),
- same-day re-review is blocked via `lastReviewedDayKey` checks in due queries.

`variantMistakes` updates do not mutate the same-day locked variant daily snapshot.

## Replay Algorithm

For each mistake item:

1. Resolve target variant by `variantName`.
2. Resolve expected node by `mistakePly` + `expectedMoveLan`.
   - if stored `mistakePly` is stale, resolve by `expectedMoveLan` on the variant line after replay start.
3. Resolve effective replay start context for the current mistake.
4. If next mistake is ahead of current board position, continue replay forward.
5. If next mistake is behind (requeued), reset to replay start and replay forward.
6. Stop on the parent ply of expected move and restrict allowed move to expected move.
   - parent targeting is position-based (`mistakePly - 1`) and does not depend on runtime node parent links.
7. On failure, requeue item.
8. On success:
   - normal reinforcement: request rating and schedule item,
   - review-only mistake session: mark solved in-memory only (no persistence).

If expected node cannot be resolved (stale path), the item is skipped in-session.

## Full-Run Confirm

After mistakes are solved:

- phase switches to `fullRunConfirm`,
- board resets to the beginning (`ply 0`),
- user replays the line end-to-end.

UI marks perfect/non-perfect completion and shows mastery effect summary.

## Failure Handling

- Variant review save failure: keep modal open and show error.
- Mistake rating failure: keep current mistake pending and show retry path.
- Reinforcement queue state persists in-memory during the page session.
- UTC day keys are used for both snapshot and due-boundary decisions.
