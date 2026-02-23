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

## API Contract Notes

### `POST /repertoires/:id/variant-reviews`

Request now optionally accepts:

- `mistakes: MistakeSnapshotItem[]`

Backend behavior:

- saves review history event,
- applies monotonic same-day daily snapshot merge,
- updates mastery/perfect streak fields,
- seeds/upserts mistake SRS items.

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
