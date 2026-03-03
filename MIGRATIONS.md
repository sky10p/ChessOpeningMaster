# MongoDB Migrations

ChessKeep uses a small MongoDB migration runner on the native driver. All database structure changes must go through migrations.

## How it works

- applied migration records live in `__migrations`
- one lease lock document in `__migration_locks` prevents concurrent runs
- migrations are loaded from `packages/backend/src/db/migrations/definitions/`
- files run in filename order

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
yarn db:backup
yarn db:restore -- .mongo-backups/<backup-folder> --drop
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
yarn db:backup
yarn migrate
```

`db:backup` and `db:restore` use `mongodump` and `mongorestore`, so MongoDB Database Tools must be installed and available in `PATH`.

Fresh install:

```bash
yarn migrate
```

Upgrade an older database:

```bash
yarn db:backup
yarn migrate
```

The integration tests run against `mongodb-memory-server` and a temporary in-memory database. They still use the real migration files and real collection names, but never touch a developer or production database.

Optional startup auto-run:

```bash
MIGRATIONS_AUTO_RUN=true
```

## Rules

- all DB structure changes go through migrations
- do not change applied migration files
- keep new migrations forward-only and focused
