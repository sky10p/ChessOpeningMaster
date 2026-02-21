# My Games and Training Plan Guide

## Overview

My Games (Games Intelligence) is the `/games` workspace that combines game import, sync, mapping quality, performance insights, and training prioritization.

It is built around four tabs that share the same imported-games query context:
- `Insights`
- `Training`
- `Sync`
- `Data`

## Shared Filters and Scope

Current UI filters used across Games data views:
- `source`: `lichess`, `chesscom`, `manual`
- `color`: `white`, `black`
- `mapped`: `mapped`, `unmapped`, `all`
- `timeControlBucket`: `bullet`, `blitz`, `rapid`, `classical`
- `dateFrom`, `dateTo`
- `openingQuery`

Filters are applied through query params and reused for imports listing, stats, and training-plan reads.

## Startup Behavior

When `/games` loads:
1. Frontend requests linked accounts, imported games, stats, and latest training plan.
2. It checks linked accounts due for startup sync (accounts with old or missing `lastSyncAt`, skipping `running` accounts).
3. If due providers exist, it runs a one-time startup auto-sync pass for that page load:
   - provider import for each due account,
   - rematch imported games against repertoire mappings,
   - regenerate training plan,
   - reload all Games datasets.

Default due threshold is 24h and is configurable with `GAMES_AUTO_SYNC_DUE_HOURS`.

## Tab Responsibilities

### Insights

Shows health and trend views based on `GET /games/stats`:
- W/D/L outcomes and percentages.
- Mapped ratio and manual-review ratio.
- Variant performance ranking (strongest/weakest slices).
- Unmapped/off-book opening signals.
- Games-by-month trend.
- Auto-generated training ideas from weak signals.

### Training

Combines latest stored training plan with current line-study stats:
- `Training Queue`: ordered actionable items with priority and path hints (`errors`, `due`, `map`, `new`, `study`).
- `Focus Lines`: broader signal feed for line-level diagnosis.
- `Mark done` updates plan-item done-state and refreshes plan + stats.

Training tab intentionally includes mapping-needed lines when they carry meaningful signals.

### Sync

Operational actions for game ingestion:
- Link account: provider + username + optional token.
- Sync account: incremental import for one provider.
- Force sync all: sync all linked providers, rematch games, regenerate plan.
- Manual import: PGN paste or file upload, optional tags and tournament group.

Provider/manual imports are followed by rematch + plan regeneration flow to keep Insights and Training coherent.

### Data

Imported-games management:
- View imported games grouped by month context.
- Delete a single game.
- Delete all games in active filter.
- Delete all imported games.

Delete operations refresh stats and training plan so downstream tabs stay consistent.

## Opening Detection and Mapping

Import pipeline performs:
1. Opening detection from available tags or line signature fallback.
2. Stable `lineKey` generation for grouping.
3. Mapping heuristics into saved repertoires/variants with confidence and manual-review flags.

Mapping metadata drives:
- mapped/unmapped filters,
- manual-review metrics,
- repertoire/variant labels in Insights and Training.

## Training Plan Lifecycle

Training plan is persisted per user and can be refreshed by:
- explicit `Regenerate Plan`,
- sync actions that call force-sync orchestration,
- startup auto-sync pass.

Plan items include priority, line key, mapping context, and done-state, then are enriched in frontend with live signal context.

## API Surface Used by My Games

- `GET /games/accounts`
- `POST /games/accounts`
- `DELETE /games/accounts/:provider`
- `POST /games/imports`
- `GET /games/imports`
- `DELETE /games/imports`
- `DELETE /games/imports/:gameId`
- `GET /games/stats`
- `POST /games/training-plan`
- `GET /games/training-plan`
- `PATCH /games/training-plan/:planId/items/:lineKey`
- `POST /games/force-sync`

## Security and User Scoping

- All Games endpoints are protected by auth middleware.
- Controllers resolve user identity through `getRequestUserId(req)` and services are user-scoped.
- Linked provider secrets are encrypted at rest.
- `GAME_PROVIDER_TOKEN_SECRET` is required in production.

## Known Contract Notes

- Current UI exposes a focused filter set, while backend stats supports additional params (`ratedOnly`, `opponentRatingBand`, `tournamentGroup`).
- Keep docs and implementation aligned before adding new visible filters to avoid UX/API drift.
