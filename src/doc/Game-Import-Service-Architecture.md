# Game Import Service Architecture

## Scope

This document covers the backend domain that powers My Games (`/games`) under `packages/backend/src/services/games`.

The domain is responsible for:
- linked account lifecycle,
- provider/manual game ingestion,
- opening detection and repertoire mapping,
- stats aggregation and line-study signal generation,
- training-plan generation/persistence,
- automatic and manual synchronization orchestration.

## Route-to-Service Contract

Controllers in `packages/backend/src/controllers/gamesController.ts` call a stable façade from `gameImportService.ts`.

Route surface in `packages/backend/src/routes/games.ts`:
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

All controller entry points must resolve user identity with `getRequestUserId(req)` and pass user-scoped calls only.

## Module Boundaries

- `gameImportService.ts`
  - Public façade used by controllers and scheduler.
  - Keeps external API stable while internal modules evolve.
- `linkedAccountsService.ts`
  - Linked provider account persistence and status transitions.
  - Provider token save/load through encryption helpers.
- `gameImportOrchestratorService.ts`
  - End-to-end import pipeline orchestration.
  - Handles provider fetch/manual PGN parse, dedupe, detection, mapping, and persistence.
- `importedGamesService.ts`
  - List and delete imported games (single and filtered/all).
  - Supports user-scoped filters and sync-reset behavior when appropriate.
- `gameStatsAggregationService.ts`
  - Builds `GamesStatsSummary` from imported games + training signals.
  - Produces outcome breakdowns, lines-to-study, opening slices, and trend data.
- `gameStatsService.ts`
  - Filter builders and deterministic stats helpers (`buildStatsFilter`, `buildLinesToStudy`, outcomes).
- `trainingPlanService.ts`
  - Plan generation, hydration, persistence, and item done-state updates.
  - Keeps latest plan retrieval compatible with current filters.
- `trainingPlanScoringService.ts`
  - Priority scoring and weighting helpers used by plan generation.
- `autoSyncService.ts`
  - Due-account selection and per-account automatic sync execution.
- `autoSyncScheduler.ts`
  - Scheduler lifecycle and cadence trigger for automatic sync loop.
- `autoSyncConfig.ts`
  - Due threshold configuration (`GAMES_AUTO_SYNC_DUE_HOURS`, default 24).
- `openingDetectionService.ts`
  - Opening normalization, fallback line naming, and line key derivation support.
- `openingMappingService.ts`
  - Repertoire/variant mapping heuristics and confidence/manual-review outputs.
- `repertoireMetadataService.ts`
  - Cached user-scoped repertoire metadata to accelerate mapping.
- `gameTimeControlService.ts`
  - Time-control normalization (`bullet`, `blitz`, `rapid`, `classical`).
- `security.ts`
  - Encryption/decryption for provider secrets (`GAME_PROVIDER_TOKEN_SECRET`).

## Core Pipelines

### Import Pipeline

1. Resolve source (`lichess`, `chesscom`, `manual`) and validate request payload.
2. Acquire provider payloads or parse manual PGN input.
3. Normalize games into imported-game contract.
4. Deduplicate by `(userId, dedupeKey)`.
5. Detect opening and line metadata.
6. Map detected line/opening into saved repertoires/variants with confidence.
7. Persist imported game documents.
8. Update account sync status and timestamps.

### Recalculate Pipeline (force-sync / post-import)

1. Optionally trigger provider sync for linked accounts.
2. Rematch imported games against current repertoire metadata.
3. Regenerate training plan from refreshed signals.
4. Return structured summary (`providerSync`, `rematch`, `trainingPlan`).

### Stats Pipeline

1. Translate request filters to Mongo filter (`buildStatsFilter`).
2. Load user-scoped imported games.
3. Merge with variant training signals.
4. Compute summary metrics, line-study candidates, openings and source distributions.

### Training Plan Pipeline

1. Build candidate lines from stats-like signals.
2. Score lines with weighted components.
3. Persist plan items and metadata for the user.
4. Serve latest plan, with filter-aware hydration for Games UI usage.

## Filter Model

Shared imported-games filters:
- `source`, `color`, `mapped`, `timeControlBucket`, `dateFrom`, `dateTo`, `openingQuery`.

Stats additionally supports backend parameters:
- `ratedOnly`, `opponentRatingBand`, `tournamentGroup`.

Current frontend GamesPage uses the shared filter subset and does not expose those extra stats params in UI yet.

## Persistence and Indexing

Key collections:
- `linkedGameAccounts`
- `importedGames`
- `trainingPlans`

Expected indexing patterns (see `packages/backend/src/db/indexes.ts`):
- linked accounts unique by `(userId, provider)`.
- imported games unique by `(userId, dedupeKey)`.
- imported games query support indexes for date/source/color/rated/tournament/time-control/mapping.
- training plans indexed by `(userId, generatedAtDate)`.

## Security and Compliance Rules

- Provider tokens must never be stored in plaintext.
- `security.ts` uses encrypted-at-rest storage.
- Production requires `GAME_PROVIDER_TOKEN_SECRET`; startup should fail fast if missing.
- Controllers/services must avoid logging sensitive token material.

## User Scoping Rules

- Every DB read/write in this domain must include `userId` scope.
- New documents must persist `userId`.
- Any newly added index for this domain should include `userId` when data is user-partitioned.

## Operational Notes

- Startup auto-sync behavior in frontend can trigger import + rematch + plan regeneration once per page load for due accounts.
- Scheduler auto-sync behavior in backend runs on configured cadence and should preserve the same data consistency guarantees.
- Manual and provider imports should keep recomputation flow aligned so Insights and Training do not drift.

## Testing Guidance

- Keep façade-level tests stable to protect route/controller compatibility.
- Add orchestration tests for import/recalc flow summaries and state transitions.
- Keep helper tests deterministic for mapping, scoring, and filter builders.
- Include user-scope assertions in service/controller tests for all new games-domain features.
