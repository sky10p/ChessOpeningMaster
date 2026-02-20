# My Games: Game Imports, Mapping, Insights, and Training Plan Spec

## Goals

- Provide a single `/games` workspace for game intelligence and training workflow.
- Support account linking and incremental provider sync for Lichess and Chess.com.
- Support manual PGN paste/upload imports.
- Detect opening + line signatures and map to saved repertoires.
- Build filter-aware stats and line-study signals.
- Persist and serve a prioritized training plan with done-state updates.
- Keep all operations user-scoped and auth-protected.

## User Stories

- As a user, I can connect/disconnect Lichess and Chess.com accounts from one page.
- As a user, I can sync a single provider or force-sync all linked providers.
- As a user, I can import PGN content via paste/upload and optional metadata.
- As a user, I can view game insights and line-level weaknesses.
- As a user, I can use a training queue and mark items done.
- As a user, I can browse imported games and delete one, filtered, or all imported games.

## UX and Information Architecture

Route: `/games`

Tabs:
- `Insights`
  - Stats summary, mapped/manual-review ratios, variant performance, off-book signals, monthly activity, ideas.
- `Training`
  - Actionable queue and focus lines from plan + live stats signals.
- `Sync`
  - Linked accounts, provider sync, force-sync-all, manual PGN import.
- `Data`
  - Imported games list, delete single/filtered/all actions.

Header actions:
- `Refresh`
- `Regenerate Plan`

Startup behavior:
- Initial load fetches accounts/imports/stats/latest plan.
- One startup due-account auto-sync pass may run (skips `running` accounts), then rematch + plan regeneration + full data refresh.

## Filters

### Shared filters used by Games page UI

- `source`: `lichess` | `chesscom` | `manual`
- `color`: `white` | `black`
- `mapped`: `mapped` | `unmapped` | `all`
- `timeControlBucket`: `bullet` | `blitz` | `rapid` | `classical`
- `dateFrom`, `dateTo`
- `openingQuery`

### Additional backend-supported stats params

- `ratedOnly`
- `opponentRatingBand`
- `tournamentGroup`

These are accepted by stats endpoints even if not currently exposed in the Games UI controls.

## Architecture

Unified ingestion/recalculation pipeline:
1. provider/manual ingest
2. normalize and dedupe
3. opening detection + line key
4. mapping to repertoire/variant
5. persistence and status updates
6. rematch when requested
7. stats aggregation
8. training plan generation/persistence

Primary backend modules live in `packages/backend/src/services/games` and are documented in `src/doc/Game-Import-Service-Architecture.md`.

## Data Model

- `linkedGameAccounts`
  - `userId`, `provider`, `username`, encrypted token, sync status/timestamps/error metadata.
- `importedGames`
  - `userId`, source/provider IDs, dedupe key, player/time/result metadata,
  - PGN/move data,
  - `openingDetection`, `openingMapping`, tags, tournament group.
- `trainingPlans`
  - `userId`, generated metadata, filters/weights context, ordered plan items.

Core index expectations:
- linked accounts unique `(userId, provider)`
- imported games unique `(userId, dedupeKey)`
- training plans indexed by `(userId, generatedAtDate)`

## API Contract (Current Implementation)

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

### Force Sync Summary

`POST /games/force-sync` returns summary sections:
- `providerSync` (`attempted`, `results`)
- `rematch` (`scannedCount`, `updatedCount`)
- `trainingPlan` (`generated`, `itemCount`, optional `planId`)

## Opening Detection and Mapping

- Opening detection prefers structured tags/metadata when available.
- Fallback uses normalized line signatures from early plies.
- Mapping emits repertoire/variant references, confidence, and manual-review flags.
- Mapping metadata is reused in stats, queue enrichment, and navigation targets.

## Stats and Line Study

Stats include:
- W/L/D and win-rate context,
- by-source/by-month slices,
- mapped vs manual-review signals,
- line-level candidates (`linesToStudy`) with risk/priority factors and suggested tasks.

Line candidates can remain visible even with low game volume when they carry urgent training signals (for example errors or due review state).

## Training Plan

- Plan generation uses weighted scoring over line-study signals.
- Plan items persist and include done-state.
- Marking item done updates stored plan state.
- Frontend enriches plan items with live signal context and path hints (`errors`, `due`, `map`, `new`, `study`).

## Error Handling and Safety

- Provider sync/import errors are surfaced per account/request.
- API responses include user-facing failure messages.
- Provider tokens are encrypted at rest.
- `GAME_PROVIDER_TOKEN_SECRET` is mandatory in production.
- Games endpoints operate behind auth middleware and user-scoped controllers/services.

## Known Divergences and Notes

- This spec follows current implementation as operational source of truth.
- If product direction changes (for example exposing backend-only stats filters in UI), update this spec and linked docs together to avoid drift.
- Naming convention in docs: use “My Games” as canonical user-facing term, with “Games Intelligence” alias where useful.

## Acceptance Criteria

- Users can connect/disconnect provider accounts.
- Users can run provider sync and force-sync-all.
- Users can manually import PGN via paste/upload.
- Imports deduplicate correctly per user.
- Opening detection/mapping metadata is persisted and queryable.
- Users can view insights, use training queue/focus lines, and mark plan items done.
- Users can delete single imported games or filtered/all sets.
- All operations remain user-scoped and auth-protected.
