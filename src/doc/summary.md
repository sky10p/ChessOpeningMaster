# ChessKeep — Product Summary

## What this application is

ChessKeep is a web application to build, maintain, and train chess opening repertoires.
It combines:
- repertoire editing and training,
- study management,
- path-based next-lesson selection,
- games intelligence from imported/synced games,
- optional user authentication with per-user data isolation.

## High-level architecture

The project is a monorepo with 3 packages:

- `packages/frontend` — React + TypeScript UI
- `packages/backend` — Express + TypeScript API
- `packages/common` — shared types/utilities/chess helpers

Data is stored in MongoDB. Backend routes are protected by auth middleware except `/auth` endpoints.

## Core feature areas

### 1) Repertoires

- Create, duplicate, update, enable/disable, delete repertoires.
- Edit lines/positions and train lines.
- Track and update per-variant training/review info.
- Download/export repertoire data.

### 2) Studies

- Organize study groups.
- Create studies inside groups.
- Add/edit/remove study entries.
- Create/remove study sessions.

### 3) Path (Next Lesson + Forecast)

- Returns next actionable lesson from spaced-repetition-aware data.
- Supports deterministic category-based selection (`variantsWithErrors`, `newVariants`, `oldVariants`, `studyToReview`).
- Prevents same-day repeat selection.
- Provides planning/forecast and review analytics.

### 4) My Games (Games Intelligence)

- Link chess providers (Lichess/Chess.com) or import PGN manually.
- Sync/import games and rematch them to repertoire mappings.
- Generate and track a training plan from imported game signals.
- Review insights, training priorities, sync state, and imported data management.

### 5) Train (Opening-Focused Training)

- Dedicated train overview at `/train` grouped by repertoire/opening.
- Opening detail pages at `/train/repertoire/:repertoireId/opening/:openingName`.
- Reinforcement flow for variant mistakes, with in-session requeue until solved.
- Full-run confirmation stage after mistake reinforcement.

### 6) Authentication and user scope

- Optional auth mode (login/register/session/logout).
- Optional default-user local mode (when enabled by backend config).
- Domain data is user-scoped across repertoires, studies, path, positions, and games.

## Frontend pages and routes

- `/login` — user login (plus optional default-user login)
- `/register` — user registration
- `/dashboard` — overview and path insights dashboard
- `/create-repertoire` — create repertoire
- `/repertoire/:id` — edit repertoire
- `/repertoire/train/:id` — train repertoire
- `/train` — train overview (repertoire-grouped openings)
- `/train/repertoire/:repertoireId/opening/:openingName` — opening-level train detail
- `/studies` — study groups/studies workflow
- `/path` — next lesson + path forecast/analytics
- `/games` — 4-tab games intelligence workspace (`Insights`, `Training`, `Sync`, `Data`)

Notes:
- `/` redirects to `/dashboard`.
- When auth is enabled and user is not authenticated, app is gated to auth routes only.

## Main user flows

### A) Repertoire learning loop

1. Create or update repertoire lines.
2. Train lines from repertoire training pages.
3. Variant reviews update spaced-repetition-related variant info.
4. `/path` and dashboard insights use this information to suggest next lessons.

### B) Next lesson / path flow

1. User opens `/path`.
2. Frontend requests:
   - `GET /paths` (next lesson)
   - `GET /paths/plan` (forecast/load)
   - `GET /paths/analytics` (quality metrics)
3. Backend selects deterministic best candidate by rules and filters.
4. User executes CTA (`Start Review`, `Start Training`, or `Go to Study`).

### C) Games intelligence flow

1. User links provider account(s) and/or imports PGN manually.
2. Backend ingests games, detects openings/line keys, and maps to repertoire context.
3. Stats and training plan are generated/regenerated.
4. User works queue items in `Training`, tracks quality in `Insights`, and manages data in `Data`.

### D) Train reinforcement flow

1. User opens `/train` and selects an opening card.
2. User reviews opening-level due variants/mistakes on opening detail page.
3. User starts training in `/repertoire/train/:id` with query filters (`mode`, `openingName`, `variantName`, `variantNames`).
4. On variant completion:
   - results modal shows metrics + mastery delta,
   - user can enter mistake reinforcement loop,
   - user finishes with full-run confirmation.

## Backend route surface (by domain)

- Auth: `/auth/*`
- Repertoires: `/repertoires/*`
- Studies: `/studies/*`
- Path: `/paths`, `/paths/plan`, `/paths/analytics`
- Train: `/train/overview`, `/train/repertoires/:id/openings/:openingName`
- Position comments: `/positions/*`
- Games: `/games/*`

## How data and security are organized

- `/auth` routes are public.
- Other domains are behind auth middleware.
- Controllers resolve user identity and enforce user-scoped reads/writes.
- Games provider secrets are encrypted at rest.
- Startup tasks ensure DB indexes and default-user migration compatibility.

## Operational summary

- Frontend default dev port: `3002`
- Backend default port: `3001`
- Database: MongoDB
- Package manager/workspace toolchain: Yarn + Lerna

## If you need deeper technical detail

Detailed implementation docs are in `src/doc/`, especially:
- `PathPage-Next-Lesson-Logic.md`
- `Train-Error-Reinforcement-Mode.md`
- `Train-Section-Architecture.md`
- `Game-Imports-Guide.md`
- `Game-Import-Service-Architecture.md`
- `Training-Queue-Guide.md`
- `User-Auth-Backend.md`
- `User-Auth-Frontend.md`
- `Dashboard-Spaced-Repetition-Insights.md`
