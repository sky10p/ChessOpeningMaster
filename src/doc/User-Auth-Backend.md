# User Authentication and User Scope (Backend)

This document explains how backend user authentication works and how user isolation is enforced across data operations.

## Core Flow

1. `packages/backend/src/app.ts` mounts `/auth` routes first.
2. `authMiddleware` is applied after `/auth` and before all feature routes.
3. Feature controllers read `req.userId` through `getRequestUserId(req)` and scope queries by user.

## Auth Endpoints

Defined in `packages/backend/src/routes/auth.ts`:

- `GET /auth/config`
  - Returns `{ enabled, allowDefaultUser, defaultUsername }`.
- `GET /auth/session`
  - Returns `{ authenticated, userId }` based on token validity.
- `POST /auth/register`
  - Creates a user and immediately signs in.
- `POST /auth/login`
  - Signs in with username/password.
- `POST /auth/default-login`
  - Signs in with default local user when enabled.
- `POST /auth/logout`
  - Revokes current token and clears cookie.

## Token and Cookie Model

- Auth tokens are random 48-byte hex strings stored in `authTokens`.
- Token TTL is controlled by `AUTH_TOKEN_TTL_SECONDS`.
- Cookie name is `chess_opening_master_auth`.
- Cookie is set as `httpOnly`, with `sameSite` and `secure` determined by environment.
- Token can also be read from `Authorization: Bearer <token>`.

Implementation: `packages/backend/src/utils/authToken.ts`.

## Environment Flags

- `ENABLE_AUTH=true` enables authentication.
- `ALLOW_DEFAULT_USER=true` allows passwordless default-user login.
- `DEFAULT_USER_USERNAME` sets default username.
- `DEFAULT_USER_PASSWORD` sets default user password for created user.
- `AUTH_TOKEN_TTL_SECONDS` sets token expiration in seconds.
- `AUTH_COOKIE_SAME_SITE` optionally sets cookie policy (`lax`, `strict`, `none`).

Implementation: `packages/backend/src/services/authService.ts`.

## Startup Migration and Backward Compatibility

On startup, backend runs:

- `runMigrationsForStartup()` when `MIGRATIONS_AUTO_RUN=true`
- `ensureDefaultUser()`

Legacy data backfill for missing `userId` is handled by migration `20260303123000_backfill_legacy_user_scope`, which assigns legacy documents into the default user scope for:

- `repertoires`
- `studies`
- `positions`
- `variantsInfo`

If startup auto-run is disabled, run the migration CLI before enabling auth so legacy documents remain visible to user-scoped queries.

## Data Isolation Rules

All authenticated routes must use request user scope.

Current controller coverage:

- `repertoiresController.ts`
- `studiesController.ts`
- `positionsController.ts`
- `pathsController.ts`

Patterns to follow for new backend features:

1. Keep route behind `authMiddleware`.
2. Read current user with `getRequestUserId(req)`.
3. Add `{ userId }` to all read/write queries.
4. Include `userId` in new persisted documents.
5. Add indexes that include `userId` when uniqueness or frequent filtering is needed.

## Backup and Restore Semantics

The repertoire backup endpoints are also user-scoped through `authMiddleware`.

Routes:

- `GET /repertoires/download`
  - Exports a zip for the current `req.userId`
  - Includes the current user record from `users` plus all backed-up user-domain collections
  - Zip entries are serialized as Mongo Extended JSON so `ObjectId` and `Date` values round-trip safely
- `POST /repertoires/restore`
  - Accepts the backup zip as a raw `application/zip` request body
  - Restores only into the current `req.userId`

Restore validation rules:

- `users.json` must contain exactly one user record
- that user record `_id` must equal the current `req.userId`
- every user-scoped document inside the backup must have `userId === req.userId`
- unsupported files such as `authTokens.json` are rejected

Restore persistence rules:

- `users` is restored for the current user
- backed-up user-scoped collections are replaced for the current user
- restore reparses Mongo Extended JSON and also rehydrates legacy ISO date strings from older backups
- restore runs the user replacement plus all user-scoped collection replacements inside one Mongo transaction
- `authTokens` are not restored, so login is required again after restore

Restore infrastructure requirement:

- MongoDB must support transactions (replica set or `mongos`)
- if transaction support is unavailable, restore fails before replacing user data

Default-user mode:

- when auth is disabled, `authMiddleware` assigns the default user id to `req.userId`
- backup and restore therefore operate on the default user record and default-user data automatically

## Security Notes

- Passwords are never stored in plain text.
- Password hashing uses PBKDF2 with per-user salt.
- Hash comparison uses `timingSafeEqual`.
- Expired tokens are naturally removed by TTL index and also proactively cleaned on lookup misses.
