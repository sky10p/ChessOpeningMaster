# Dashboard — Today Landing Page

This document describes the redesigned `DashboardPage`, which is now a single "Today" landing view rather than a multi-tab workspace.

## Purpose

The dashboard answers one focused question: **what should I do right now?** It surfaces:

- The next recommended lesson from the path queue.
- Today's review progress against the daily target.
- This week's due-load at a glance (`due today`, `overdue now`, `next 7 days`).
- Quick entry points to adjacent flows (Games, Library, Openings needing work).
- Compact repertoire-wide KPI strip (variants tracked, errors, mastery).

The full planning view (14-day forecast, variant queue, analytics) lives on `/path`.

## Architecture

### Page file

`packages/frontend/src/pages/DashboardPage/DashboardPage.tsx`

There are **no tabs**. The page is a single vertically-scrolling layout using the canonical `PageRoot + PageFrame + PageSurface + PageHeader + StatStrip` structure.

### Data hooks

| Hook | Source | Purpose |
|---|---|---|
| `useDashboard` | `hooks/useDashboard` | Loads repertoire list for KPI strip |
| `usePaths` | `hooks/usePaths` | Loads next path lesson and plan summary |
| `useDashboardData` | `DashboardSection/hooks/useDashboardData` | Derives variant counts and progress stats from repertoire list |

Both `loadPath()` and `loadInsights()` from `usePaths` are called on mount.

## Backend/API dependencies

| Endpoint | Used for |
|---|---|
| `GET /paths` | Next lesson (path) |
| `GET /paths/plan` | `plan` object: `dueTodayCount`, `overdueCount`, `forecastDays`, etc. |
| `GET /paths/analytics` | Available via `usePaths.analytics` but not shown on the today page |

## Layout

```
PageHeader      — title, primary CTA, meta badges
StatStrip       — variants tracked / errors / mastery / daily target
──────────────────────────────────────────────────────────────────────────
grid: [Next lesson card (1.6fr)]   [Sidebar (1fr)]
──────────────────────────────────────────────────────────────────────────
Next lesson card:
  • "Recommended next action" hero block with action label + description
  • Progress mini-grid: Reviews today / New learned / Plan message
Sidebar (desktop: This week first; mobile: Quick access first):
  • Due today, Overdue, Next 7 days
  • Quick access: Games, Library, Openings needing work
```

## Metrics displayed

| Metric | Source field | Where shown |
|---|---|---|
| Variants tracked | `totalVariants` | `StatStrip` |
| Reviewed with errors | `progressStats.reviewedWithErrors` | `StatStrip` |
| Reviewed cleanly | `progressStats.reviewedOK` | `StatStrip` |
| Daily target | `todayPlan.plannedTodayTarget` | `StatStrip` |
| Due today | `plan.dueTodayCount` | `PageHeader` meta + sidebar |
| Overdue | `plan.overdueCount` | `PageHeader` meta + sidebar |
| Next 7 days | forecast sum | sidebar |
| Reviews today | `todayPlan.completedReviewsToday / reviewTargetToday` | progress mini-grid |
| New learned | `todayPlan.completedNewToday / newTargetToday` | progress mini-grid |

## Next action label logic

| Path type | Label | Description |
|---|---|---|
| Loading | `"Loading next lesson"` | Preparing... |
| Empty / no path | `"Open forecast"` | All caught up; use forecast |
| `studyPath` | `"Open study"` | Study name |
| `studiedVariantPath` | `"Review due variant"` | Repertoire + variant name |
| `newVariantPath` | `"Start new variant"` | Repertoire + variant name |
| Fallback | `"Open queue"` | Open queue to continue |

Primary CTA navigates to `/path` for variants/queue or to `/studies?groupId=...&studyId=...` for study paths.

## What was removed

The previous DashboardPage had four tabs: `Dashboard`, `Overview`, `Path Insights`, and `Studies`. All tabs and subcomponents have been replaced by the single "Today" layout. Full path planning data is now accessed via `/path`.

Previously used components that are no longer part of the dashboard:
- `DashboardSection` — functionality absorbed directly into `DashboardPage`
- `PathInsightsSection` — full planning view relocated to `/path`
- `OverviewSection` — removed
- `StudiesSection` — removed from dashboard; `/studies` route still exists
- `usePathInsights` hook — replaced by `usePaths`
- `TodaysFocusCard`, `TrainingQueuePreview` — removed

## Testing

Dashboard tests mock `usePaths` (not `usePathInsights`):
- `packages/frontend/src/pages/DashboardPage/DashboardPage.test.tsx`

This keeps tests deterministic and avoids async fetch side effects.
