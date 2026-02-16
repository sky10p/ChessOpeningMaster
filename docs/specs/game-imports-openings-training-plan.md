# Game Imports, Opening Mapping, and Training Plan Spec

## Goals
- Link Lichess and Chess.com accounts.
- Import games with initial and incremental sync.
- Support manual PGN paste and `.pgn` upload with multi-game parsing.
- Detect openings and line signatures.
- Map detected lines to Saved Openings repertoires.
- Provide game statistics, lines-to-study candidates, and a prioritized training plan.

## User Stories
- As a user, I can connect/disconnect Lichess and Chess.com accounts from one place.
- As a user, I can run sync repeatedly and import only new games.
- As a user, I can paste a single PGN or a bulk PGN file and import all games.
- As a user, I can tag games and optionally assign a tournament/training group.
- As a user, I can see opening-level performance and line-level weaknesses.
- As a user, I can generate a ranked training plan and mark items done.

## UX and Information Architecture
- New page: `/games` as the central Insights area.
- Sections:
  - Linked Accounts (connect/disconnect/sync status)
  - Manual PGN Import (paste, upload, tags, tournament group)
  - Stats Summary (W/L/D, win rate, game count)
  - Training Plan (ordered items with reason and effort)

## Architecture
- One ingestion pipeline for all sources:
  - Provider fetch/parse
  - Normalize
  - Deduplicate
  - Detect opening + line key
  - Map to repertoire
  - Persist and aggregate stats
  - Generate training plan
- Provider layer:
  - `LichessProvider`
  - `ChessComProvider`
  - `ManualPgnProvider`

## Data Model
- `linkedGameAccounts`
  - `userId`, `provider`, `username`, `tokenEncrypted`, `connectedAt`, `lastSyncAt`, `status`, `lastError`
- `importedGames`
  - `userId`, `source`, `providerGameId`, `dedupeKey`, player/rating metadata, result, time control
  - `pgn`, `movesSan`, `openingDetection`, `openingMapping`, tags, tournament group
- `trainingPlans`
  - `userId`, generated metadata, weights, ordered items

## API
- `GET /games/accounts`
- `POST /games/accounts`
- `DELETE /games/accounts/:provider`
- `POST /games/imports`
- `GET /games/imports`
- `GET /games/stats`
- `POST /games/training-plan`
- `GET /games/training-plan`
- `PATCH /games/training-plan/:planId/items/:lineKey`

## Opening Detection
- Priority 1: provider PGN ECO/Openings tags.
- Priority 2: line signature from SAN moves up to 12 plies.
- Stable `lineKey` hash generated from normalized move line.
- Confidence score stored with fallback signature.

## Mapping to Saved Openings
- Heuristics:
  1. ECO exact
  2. Move-prefix overlap with repertoire main line
  3. Fuzzy opening name match
  4. Tag overlap
- Auto-map threshold: confidence `>= 0.75`.
- Lower confidence flags manual review.

## Statistics
- Filters:
  - Date range
  - Time control bucket
  - Rated-only
  - Color
  - Opponent rating band
  - Tournament group
- Metrics:
  - W/L/D
  - Win rate
  - Top openings
  - Lines to study candidates with sample games and suggested tasks

## Lines to Study
- Candidate line conditions:
  - Underperformance
  - Frequency
  - Recency
  - Deviation/manual-review rate
- Output includes tasks:
  - Review main line
  - Drill to ply N
  - Constrained practice games

## Training Plan Scoring
- Default formula:
  - `priority = w1*frequency + w2*problem + w3*recency + w4*repertoireGap + w5*deviationRate`
- Defaults:
  - `w1=0.25`, `w2=0.30`, `w3=0.15`, `w4=0.20`, `w5=0.10`
- Items include reasons, effort estimate, tasks, done-state.

## Error Handling and Safety
- Provider sync errors recorded per account status.
- API returns clear user-facing messages.
- Provider tokens encrypted at rest.
- No token or PGN logging in service/controller path.

## Tests
- Unit tests for PGN splitting/parsing, opening detection, and dedupe key stability.
- Service-level tests for training-plan generation and mapping can be expanded next iteration.

## Acceptance Criteria
- Users can connect accounts and run syncs.
- Users can manually import single/multi-game PGN via paste or upload.
- Imported games are deduplicated across sources.
- Opening detection and mapping metadata persist per game.
- Users can view summary stats, lines-to-study, and generate/track training plan items.
