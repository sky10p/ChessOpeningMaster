# PathPage and Next Lesson Logic

This document describes how `/path` works and how backend services compute next-lesson and path-forecast data.

## Scope and Entry Points

- Frontend page: `packages/frontend/src/pages/PathPage/PathPage.tsx`
- Frontend hook: `packages/frontend/src/hooks/usePaths.tsx`
- Frontend repository: `packages/frontend/src/repository/paths/paths.ts`
- Backend route/controller: `packages/backend/src/routes/paths.ts`, `packages/backend/src/controllers/pathsController.ts`
- Backend service: `packages/backend/src/services/pathService.ts`
- Variant source: `packages/backend/src/services/variantsService.ts`

## Runtime Behavior (`/path`)

`PathPage` is now split into two views:

1. `Next lesson`
2. `Path forecast`

The page loads data from:

- `GET /paths` (next lesson)
- `GET /paths/plan` (due/load forecast)
- `GET /paths/analytics` (review-quality analytics)

All calls are re-executed when scope filters change.

## Frontend Filters

`PathPage` supports these filters (shared across endpoints):

- `category` (`variantsWithErrors`, `newVariants`, `oldVariants`, `studyToReview`)
- `orientation` (`white`, `black`)
- `openingName`
- `fen`
- `dateFrom`, `dateTo` (analytics range)
- `dailyNewLimit`

## Next Lesson Response Types

`GET /paths` returns one of:

- `type: "variant"` (`StudiedVariantPath`)
- `type: "newVariant"` (`NewVariantPath`)
- `type: "study"` (`StudyPath`)
- empty message (`EmptyPath`)

CTA behavior:

- `variant`/`newVariant`: `Start Review`, `Start Training`
- `study`: `Go to Study`
- `variant` additionally supports `Remove this variant from path`

## Core Selection Rules (`determineBestPath`)

### Eligibility

A studied variant is eligible only if:

- it is due (`dueAt <= now` or no `dueAt`),
- it was not reviewed today (`lastReviewedDayKey !== today`),
- it matches active filters (`orientation`, `openingName`, `fen`).

### Buckets

Eligible content is bucketed into:

1. `variantsWithErrors`
2. `dueVariants` (due, no errors)
3. `newVariants`
4. `oldVariants` (older than 3 months, no errors)
5. `studyToReview` (only when no variant filters are active)

### No-Category Selection (deterministic)

If `category` is not provided, backend uses deterministic priority:

1. highest-priority error variant
2. earliest due variant
3. weighted new variant
4. oldest old variant
5. study-to-review (only if no variant filters)
6. empty path

No probabilistic threshold logic is used anymore.

### Category Selection (deterministic)

If `category` is provided, backend selects only within that bucket.
If no candidate exists in that category, backend returns `EmptyPath`.

## New Variant Selection

`newVariants` still use weighted selection:

1. group by `repertoireId`
2. choose repertoire with weight `1 / variantCount`
3. choose variant inside repertoire weighted by `min(name.length / 10, 2)`

## Plan Endpoint (`GET /paths/plan`)

Returns `PathPlanSummary`, including:

- summary counts (`overdueCount`, `dueTodayCount`, `reviewDueCount`, etc)
- `upcoming` (14-day due-count timeline)
- `forecastDays` (day-by-day opening + representative variant forecast)
- `nextVariants` (likely near-term queue)
- `upcomingOpenings` (openings entering the short-term queue)

## Analytics Endpoint (`GET /paths/analytics`)

Returns `PathAnalyticsSummary`, including:

- date range (`rangeStart`, `rangeEnd`)
- `ratingBreakdown` (`again`, `hard`, `good`, `easy`)
- `dailyReviews`
- `topOpenings`
- `topFens`

Source of truth is `variantReviewHistory`, filtered by user + scope filters.

## Testing

- Frontend path behavior: `packages/frontend/src/pages/PathPage/PathPage.test.tsx`
- Backend path service: `packages/backend/src/services/test/pathService.spec.ts`

When changing path behavior, update tests for both next-lesson logic and plan/analytics shape.
