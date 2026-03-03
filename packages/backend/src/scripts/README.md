# Backend Scripts

## Database migrations

Tracked MongoDB migrations live in `src/db/migrations/definitions`.

```bash
yarn migrate
yarn migrate:status
yarn migrate:create add_some_change
yarn db:backup
yarn db:restore -- .mongo-backups/<backup-folder> --drop
```

Migration workflow, locking, and idempotency guidelines are documented in the repo-level `MIGRATIONS.md`.

The first migration is a bridge migration: it creates missing indexes, skips matching ones, and fails on incompatible existing index definitions instead of rewriting them silently.

## Comments migration

The script `migrateRepertoireComments.ts` copies comments from repertoires to the positions collection.

```bash
yarn migrate:comments [strategy]
yarn migrate:comments:interactive
```

Available strategies:

- `keep_longest`
- `keep_newest`
- `merge`
- `interactive`
