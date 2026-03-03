# Backend Scripts

## Database migrations

Tracked MongoDB migrations live in `src/db/migrations/definitions`.

```bash
yarn migrate
yarn migrate:status
yarn migrate:create add_some_change
```

Migration workflow, locking, and idempotency guidelines are documented in the repo-level `MIGRATIONS.md`.

The first migration is a bridge migration: it creates missing indexes, skips matching ones, and fails on incompatible existing index definitions instead of rewriting them silently.
