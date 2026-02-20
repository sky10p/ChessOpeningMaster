# Training Queue Guide

This guide describes how My Games → `Training` is built and how to interpret it when planning study work.

## Two Panels in Training

- `Training Queue`: ordered actionable items derived from plan + current signals.
- `Focus Lines`: broader line-signal diagnostics derived from stats.

Queue is for execution. Focus lines are for analysis.

## Data Sources and Assembly

1. Frontend loads:
   - `GET /games/stats`
   - `GET /games/training-plan`
2. Backend builds `linesToStudy` by grouping imported games by `openingDetection.lineKey` and blending variant training signals.
3. Backend stores/returns plan items with priorities and done-state.
4. Frontend (`useGamesInsights`) enriches plan items with live line context and computes actionable lists.

## Label and Target Resolution

Displayed opening/variant labels and navigation targets use this priority:
1. mapped variant (`openingMapping.variantName`)
2. mapped repertoire (`openingMapping.repertoireName`)
3. detected opening fallback (`openingDetection.openingName`)

When opening a repertoire/train page from a line, frontend tries to resolve `repertoireId` from imported games sharing that `lineKey`.

## Actionability Rules

Frontend keeps an item in `Training Queue` when at least one of these is true:
- mapped games exist,
- training errors exist,
- mapping-needed conditions are met,
- deviation rate is elevated,
- priority is above baseline threshold.

Mapping-needed (`pathHint = map`) is triggered when confidence/manual-review/mapping completeness indicates line-to-repertoire alignment work is needed.

Other path hints:
- `errors`: training errors present.
- `due`: training due time has passed.
- `new`: high-priority/high-frequency line.
- `study`: standard follow-up work.

## Focus Line Signals

Focus lines are sorted by highest immediate risk:
1. training errors,
2. deviation pressure,
3. other scoring factors.

Each line can include:
- games, wins/draws/losses,
- manual-review and mapped counts,
- confidence and repertoire-gap signals,
- suggested tasks,
- due/review timestamps when present.

## After-Action Behaviors

- Marking item done (`PATCH /games/training-plan/:planId/items/:lineKey`) refreshes both stats and plan.
- `Regenerate Plan` triggers rematch + plan regeneration via force-sync orchestration and reloads Games datasets.
- `Sync` (provider/manual) is followed by rematch + plan regeneration to avoid stale queue state.
- `Force sync all` triggers provider sync for all linked accounts and then runs the same rematch/regenerate pipeline.

## Practical Workflow

1. Prioritize `errors` and `due` items first.
2. Handle `map` items by aligning line-to-repertoire mapping before repetition-heavy drilling.
3. Regenerate plan after major imports or repertoire edits.
4. Use shared Games filters (`source`, `color`, `mapped`, `timeControlBucket`, `date range`, `openingQuery`) to run focused training passes.

## Why Queue and Focus May Differ

This is expected and useful:
- Focus lines show all relevant diagnostic pressure.
- Queue intentionally narrows to lines with actionable next steps.

If queue appears too short, verify:
- filter scope,
- recent imports availability,
- mapping confidence/manual-review load,
- plan regeneration after data changes.
