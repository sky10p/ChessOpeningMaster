# MongoDB Migrations

ChessKeep uses a small MongoDB migration runner on the native driver. All database structure changes must go through migrations.

## How it works

- applied migration records live in `__migrations`
- one lease lock document in `__migration_locks` prevents concurrent runs
- migration ids and checksums are derived from the canonical files in `packages/backend/src/db/migrations/definitions/` when that directory is present
- executable migration modules are loaded from the active runtime directory (`packages/backend/build/backend/db/migrations/definitions/` in compiled backend runs)
- files run in filename order

This split avoids checksum drift between running migrations from TypeScript source and validating them later from compiled JavaScript output.

## First migration

The first migration is `20260303120000_initial_schema`.

- it uses the same timestamp filename pattern as any later migration
- on a fresh database it creates the current baseline indexes
- on an existing database it skips indexes that already exist with the same definition
- if a required index name already exists with a different definition, it fails with a clear error instead of mutating it implicitly

This keeps the runner simple and keeps the migration workflow uniform.

## Commands

```bash
yarn migrate
yarn migrate:status
yarn migrate:create add_some_change
```

## Creating a migration

```bash
yarn migrate:create add_training_plan_index
```

Generated template:

```ts
import { MigrationDefinition } from "../types";

export const migration: MigrationDefinition = {
  id: "20260401000000_add_training_plan_index",
  name: "add training plan index",
  up: async (db) => {},
};
```

Keep migrations simple:

- use `updateMany`, update pipelines, or `bulkWrite`
- make them idempotent
- avoid loading full collections into memory
- do not edit already-applied migration files
- all future migrations should be created with `yarn migrate:create ...`

## Running migrations

Production:

```bash
yarn migrate
```

Fresh install:

```bash
yarn migrate
```

Upgrade an older database:

```bash
yarn migrate
```

## Backup and Restore

Before risky migration or deployment work, create a per-user backup from the application:

- `GET /repertoires/download` exports a zip for the current authenticated user
- in auth-disabled mode, the same route exports the default user because `authMiddleware` assigns that user to `req.userId`

Restore is available through:

- `POST /repertoires/restore`
- request body must be the zip returned by `GET /repertoires/download`
- content type should be `application/zip`

Restore rules:

- restore is scoped to the current authenticated/default user only
- `users.json` in the backup must match `req.userId`
- user-scoped JSON files must contain only documents for `req.userId`
- `authTokens` are intentionally excluded, so restored users must sign in again
- restore replaces the current user's stored data in the backed-up collections

Example:

```bash
curl -X POST "http://localhost:3001/repertoires/restore" \
  -H "Content-Type: application/zip" \
  --cookie "chess_opening_master_auth=<token>" \
  --data-binary "@chess-openings-backup-2026-03-03.zip"
```

Deployment note:

- if you deploy the compiled backend and keep `packages/backend/src/db/migrations/definitions/` alongside it, checksum validation stays stable across `ts-node` and compiled runs
- if runtime reports a missing migration file in `build/.../db/migrations/definitions`, rebuild the backend and clear stale build artifacts before restarting
- do not leave deleted migration artifacts in `packages/backend/build/backend/db/migrations/definitions/`

The integration tests run against `mongodb-memory-server` and a temporary in-memory database. They still use the real migration files and real collection names, but never touch a developer or production database.

Optional startup auto-run:

```bash
MIGRATIONS_AUTO_RUN=true
```

## Rules

- all DB structure changes go through migrations
- do not change applied migration files
- keep new migrations forward-only and focused
