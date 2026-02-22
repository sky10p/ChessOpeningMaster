# Dashboard Spaced Repetition Insights

This document describes the dashboard `Path Insights` tab and its spaced-repetition metrics.

## Purpose

The `Path Insights` tab answers:

- What is due now and in the short term?
- How heavy is the next 14-day review load?
- Which variants and openings are likely to appear next?
- How is recent review quality distributed (`again`, `hard`, `good`, `easy`)?

The main `Dashboard` tab stays focused on general repertoire KPIs, while `Path Insights` is the planning-focused view.

## Frontend Entry Points

- Tab section:
  - `packages/frontend/src/pages/DashboardPage/sections/PathInsightsSection.tsx`
- Insights panel:
  - `packages/frontend/src/pages/DashboardPage/sections/DashboardSection/components/SpacedRepetitionInsightsPanel.tsx`
- Data hook:
  - `packages/frontend/src/pages/DashboardPage/sections/DashboardSection/hooks/usePathInsights.ts`
- Dashboard page tab wiring:
  - `packages/frontend/src/pages/DashboardPage/DashboardPage.tsx`

## Openings Board Preview

- Opening cards compute a preview position with `getOpeningFen` from:
  - `packages/frontend/src/utils/getOpeningFen.ts`
- The utility traverses the repertoire move tree by SAN moves and returns the FEN for the matching `variantName`.
- If no matching opening is found or board-state resolution fails, cards use the initial chess start FEN as fallback.

## Backend/API Dependencies

The tab reuses path-insight APIs:

- `GET /paths/plan`
- `GET /paths/analytics`

Repository client:

- `packages/frontend/src/repository/paths/paths.ts`

Default hook behavior:

- orientation filter (`all` / `white` / `black`) is propagated,
- analytics date range defaults to last 30 days,
- `New/Day` default cap is `5` (`DEFAULT_DAILY_NEW_LIMIT`).

## Metrics and Definitions

Summary cards include inline info tooltips:

- `Overdue`: variants whose due date already passed and are still pending.
- `Due today`: variants scheduled exactly for today.
- `Due next 7d`: total due load for the first 7 forecast days (including today).
- `Suggested new`: recommended number of brand-new variants to add today after due-load and `New/Day` cap are considered.
- `New/Day`: maximum number of new variants the planner can introduce per day for the current view.

## Visuals

The panel renders:

1. Summary cards with tooltips.
2. Upcoming due-load chart (14 days).
3. Likely next variants queue list.
4. Rating distribution chart (`again/hard/good/easy`).
5. Openings entering queue ranked list with progress bars (long-name friendly on mobile and desktop).

## UX Notes

- `Open Path` CTA links to `/path` for full planning and action workflow.
- Mobile layout stacks cards/lists/charts vertically.
- Desktop layout uses multi-column grouping for quick scan.

## Testing

- Dashboard tests mock `usePathInsights`:
  - `packages/frontend/src/pages/DashboardPage/DashboardPage.test.tsx`

This keeps tests deterministic and avoids async fetch side effects.
