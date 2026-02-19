# Game Import Service Architecture

## Scope

The game import domain is split into focused backend modules under `packages/backend/src/services/games`.

## Module boundaries

- `gameImportService.ts`
  - Public façade preserving controller-facing API.
  - Delegates implementation to specialized services.
- `linkedAccountsService.ts`
  - Linked account CRUD and token persistence handling.
- `gameImportOrchestratorService.ts`
  - Provider fetch flow, dedupe, opening detection/mapping, game persistence, sync status transitions.
- `importedGamesService.ts`
  - Imported games listing, deletion, filtered clearing, sync-cursor reset behavior.
- `gameStatsAggregationService.ts`
  - Stats orchestration and summary assembly from imported games and variants training signals.
- `trainingPlanService.ts`
  - Training plan generation, hydration, persistence, and done-state updates.
- `autoSyncService.ts`
  - Due-account selection and auto-sync execution loop per account.
- `gameStatsService.ts`
  - Pure stats/filter helpers and line study candidate calculations.
- `trainingPlanScoringService.ts`
  - Pure training scoring and filter translation helpers.
- `openingDetectionService.ts`
  - Opening normalization and fallback inference logic.
- `openingMappingService.ts`
  - Repertoire matching heuristics and mapping confidence strategy.
- `repertoireMetadataService.ts`
  - Repertoire variant extraction, metadata build, and scoped metadata cache loading.
- `gameTimeControlService.ts`
  - Time-control bucketing utility shared across import and stats paths.

## Naming conventions

- User-scoped async functions use `...ForUser` suffix.
- Internal orchestration entry points use `...Internal` suffix.
- Public API functions stay stable in `gameImportService.ts` and map 1:1 to existing controller usage.

## Dependency direction

- Façade modules depend on orchestration modules.
- Orchestration modules depend on helper modules.
- Pure helper modules do not depend on façade modules.
- Shared types are defined in `gameImportTypes.ts` and request filters in `gameImportFilters.ts`.

## Testing guidance

- Keep orchestration tests at service level for behavior contracts.
- Keep helper tests focused on deterministic logic in mapping, stats, and scoring modules.
- Preserve `gameImportService` API compatibility in tests to protect controller and scheduler integrations.
