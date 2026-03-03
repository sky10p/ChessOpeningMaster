# Backend Scripts

## Database migrations

Tracked MongoDB migrations live in `src/db/migrations/definitions`.

Checksums are validated against those canonical source files when they are present, while compiled backend runs execute the matching modules from `build/backend/db/migrations/definitions`.

```bash
yarn migrate
yarn migrate:status
yarn migrate:create add_some_change
```

Migration workflow, locking, and idempotency guidelines are documented in the repo-level `MIGRATIONS.md`.

If a production startup reports missing runtime migration files or checksum drift after a deployment, rebuild the backend and clear stale files under `build/backend/db/migrations/definitions` before restarting.

The first migration is a bridge migration: it creates missing indexes, skips matching ones, and fails on incompatible existing index definitions instead of rewriting them silently.
