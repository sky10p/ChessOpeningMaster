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
   - the app repositions to each mistake ply,
   - user must play the expected move,
   - user rates each solved mistake (`again/hard/good/easy`),
   - failed attempts requeue to the end.

4. `Full-run confirm`  
   After queue exhaustion, user replays the full variant.  
   A completion panel confirms whether the run was perfect.

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
3. Reposition board to the parent node of expected move.
4. Restrict allowed move to expected move.
5. On failure, requeue item.
6. On success, request rating and schedule item.

If expected node cannot be resolved (stale path), the item is skipped in-session.

## Full-Run Confirm

After mistakes are solved:

- phase switches to `fullRunConfirm`,
- board starts from variant start ply,
- user replays the line end-to-end.

UI marks perfect/non-perfect completion and shows mastery effect summary.

## Failure Handling

- Variant review save failure: keep modal open and show error.
- Mistake rating failure: keep current mistake pending and show retry path.
- Reinforcement queue state persists in-memory during the page session.
- UTC day keys are used for both snapshot and due-boundary decisions.
